'use client';

import { useState, useRef } from 'react';
import { PageLayout, Container, Section } from '@/components/layout';
import { useAuth } from '@/lib/auth/hooks';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { VideoChapter } from '@/lib/types/vdocipher';
import Image from 'next/image';
// import { useToast, ToastContainer } from '../../../components/ui/Toast';

export default function CreateVideoPage() {
  const { user, dbUser, loading } = useAuth();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Initialize all state hooks first (React hooks must be called in the same order)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    isFeatured: false,
    thumbnailUrl: '',
    thumbnailDescription: '',
    // Nouveaux champs
    ceQueVousAllezApprendre: '',
    prerequis: '',
    publicCible: '',
    dureeEstimee: '',
    niveauDifficulte: 'debutant' as 'debutant' | 'intermediaire' | 'avance'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [playbackId, setPlaybackId] = useState<string>('');
  const [chapters, setChapters] = useState<VideoChapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState<Omit<VideoChapter, 'id'> & { startTimeFormatted: string, durationFormatted: string }>({
    title: '',
    startTime: 0,
    startTimeFormatted: '00:00',
    duration: undefined,
    durationFormatted: '',
    description: undefined,
    thumbnail: undefined
  });

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Temporary toast replacements
  const success = (message: string) => {
    console.log('Success:', message);
    alert(message);
  };
  const error = (message: string) => {
    console.error('Error:', message);
    alert('Erreur: ' + message);
  };

  // Check authorization - only admins and creators can create courses
  if (loading) {
    return (
      <PageLayout>
        <Section className="py-8">
          <Container>
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  if (!user || !dbUser) {
    return (
      <PageLayout>
        <Section className="py-8">
          <Container>
            <div className="text-center p-8">
              <div className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Non authentifié
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Veuillez vous connecter pour créer un cours.
              </p>
            </div>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  if (!['admin', 'creator'].includes(dbUser.role)) {
    return (
      <PageLayout>
        <Section className="py-8">
          <Container>
            <div className="text-center p-8">
              <div className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Accès non autorisé
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Seuls les administrateurs et les créateurs peuvent créer des cours.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Votre rôle actuel: {dbUser.role}
              </p>
            </div>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedThumbnail(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideo(file);
      console.log('Vidéo sélectionnée:', file.name, 'Taille:', file.size);
    }
  };
  
  const handleChapterInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startTimeFormatted') {
      // Handle time format input for startTime
      setCurrentChapter(prev => ({
        ...prev,
        startTimeFormatted: value,
        startTime: timeToSeconds(value)
      }));
    } else if (name === 'durationFormatted') {
      // Handle time format input for duration
      setCurrentChapter(prev => ({
        ...prev,
        durationFormatted: value,
        duration: value ? timeToSeconds(value) : undefined
      }));
    } else {
      // Handle other inputs normally
      setCurrentChapter(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addChapter = () => {
    if (!currentChapter.title) {
      error('Le titre du chapitre est obligatoire');
      return;
    }
    
    const newChapter: VideoChapter = {
      id: crypto.randomUUID(),
      title: currentChapter.title,
      startTime: currentChapter.startTime,
      duration: currentChapter.duration,
      description: currentChapter.description,
      thumbnail: currentChapter.thumbnail
    };
    
    setChapters(prevChapters => [...prevChapters, newChapter]);
    
    // Calculate next logical start time based on the end of this chapter
    const nextStartTime = currentChapter.startTime + (currentChapter.duration || 300);
    const nextStartTimeFormatted = formatTime(nextStartTime);
    
    setCurrentChapter({
      title: '',
      startTime: nextStartTime,
      startTimeFormatted: nextStartTimeFormatted,
      duration: undefined,
      durationFormatted: '',
      description: undefined,
      thumbnail: undefined
    });
    console.log('Chapters:', chapters);
  };

  const removeChapter = (id: string) => {
    setChapters(prevChapters => prevChapters.filter(chapter => chapter.id !== id));
  };
  
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const timeToSeconds = (timeString: string): number => {
    // Handle HH:MM:SS or MM:SS format
    const parts = timeString.split(':').map(part => parseInt(part, 10));
    
    if (parts.length === 3) {
      // HH:MM:SS format
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS format
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 1 && !isNaN(parts[0])) {
      // Just seconds
      return parts[0];
    }
    return 0;
  };

  const uploadVideoToVdoCipher = async (file: File): Promise<string> => {
    try {
      // STEP 1: Obtain upload credentials (align with test page behavior)
      console.log('VDOCIPHER: Requesting upload credentials...');
      setVideoUploadProgress(10);

      const credentialsResponse = await fetch('/api/upload-video/vdocipher-credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title?.trim() || 'Untitled video',
          folderId: 'root',
        }),
      });

      if (!credentialsResponse.ok) {
        const errorText = await credentialsResponse.text();
        throw new Error(`Credentials request failed: ${credentialsResponse.status} - ${errorText}`);
      }

      const { clientPayload, videoId } = await credentialsResponse.json();
      console.log('VDOCIPHER: Upload credentials received', { videoId });
      setVideoUploadProgress(25);

      // STEP 2: Upload file to VdoCipher
      console.log('VDOCIPHER: Uploading file to VdoCipher...');
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('uploadCredentials', JSON.stringify(clientPayload));

      const uploadResponse = await fetch('/api/upload-video/vdocipher-upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      // Even if the endpoint returns a body, we don't need it here; align with test page behavior
      try {
        await uploadResponse.json();
      } catch (_) {
        // Ignore non-JSON responses gracefully
      }

      console.log('VDOCIPHER: Upload completed');
      setVideoUploadProgress(50);

      // STEP 3: Monitor processing status (limit to ~10 minutes like test page)
      console.log('VDOCIPHER: Monitoring processing status (up to ~10 minutes)...');
      let videoReady = false;
      let attempts = 0;
      const maxAttempts = 60; // 10 minutes @ 10s interval
      const checkInterval = 10000; // 10 seconds
      const startTime = Date.now();

      while (!videoReady && attempts < maxAttempts) {
        attempts++;
        const elapsedTime = Date.now() - startTime;
        const elapsedMinutes = (elapsedTime / (1000 * 60)).toFixed(1);

        // Progress from 50% -> 90%
        const progressPercent = 50 + (attempts / maxAttempts) * 40;
        setVideoUploadProgress(progressPercent);

        if (attempts > 1) {
          await new Promise(resolve => setTimeout(resolve, checkInterval));
        }

        const statusResponse = await fetch(`/api/upload-video/vdocipher-status?videoId=${videoId}`, { method: 'GET' });

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          console.warn('VDOCIPHER: Status check failed', { status: statusResponse.status, error: errorText });
          continue;
        }

        const statusData = await statusResponse.json();
        console.log('VDOCIPHER: Status check', { attempt: attempts, ...statusData, elapsedMinutes });

        if (statusData.isReady) {
          videoReady = true;
          console.log(`VDOCIPHER: Video is ready after ${elapsedMinutes} minutes`);
        } else if (statusData.status === 'Error' || statusData.status === 'Failed') {
          throw new Error(`Video processing failed with status: ${statusData.status}`);
        }
      }

      if (!videoReady) {
        const elapsedMinutes = ((Date.now() - startTime) / (1000 * 60)).toFixed(1);
        console.warn(`VDOCIPHER: Video still processing after ${elapsedMinutes} minutes. Proceeding with course creation; processing continues in background.`);
      }

      setVideoUploadProgress(100);
      return videoId; // Use videoId as playback_id
    } catch (err) {
      console.error('VDOCIPHER: Upload error', err);
      throw err;
    }
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    console.log('Starting thumbnail upload for file:', file.name, 'Size:', file.size);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('L\'image doit faire moins de 5MB');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `course-thumbnails/${fileName}`;

    console.log('Uploading to path:', filePath);
    console.log('User role:', dbUser?.role);
    console.log('User ID:', user?.id);

    const { data, error: uploadError } = await supabase.storage
      .from('course-thumbnails')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      throw new Error(`Erreur lors de l'upload de la thumbnail: ${uploadError.message}`);
    }

    console.log('Upload successful:', data);

    const { data: { publicUrl } } = supabase.storage
      .from('course-thumbnails')
      .getPublicUrl(filePath);

    console.log('Generated public URL:', publicUrl);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let thumbnailUrl = formData.thumbnailUrl;
      let videoPlaybackId = '';
      let paddlePriceId: string | null = null;

      // Upload thumbnail si un fichier est sélectionné
      if (selectedThumbnail) {
        setUploadProgress(20);
        thumbnailUrl = await uploadThumbnail(selectedThumbnail);
        setUploadProgress(40);
      }

      // Upload vidéo si un fichier est sélectionné
      if (selectedVideo) {
        setUploadProgress(60);
        videoPlaybackId = await uploadVideoToVdoCipher(selectedVideo);
        setPlaybackId(videoPlaybackId);
        setUploadProgress(80);
      }

      // Create Paddle price (one-time) for this course price using server API
      const priceFloat = parseFloat(formData.price);
      if (!isNaN(priceFloat) && priceFloat > 0) {
        setUploadProgress(85);
        const amountCents = Math.round(priceFloat * 100);
        const createPriceRes = await fetch('/api/paddle/create-price', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amountCents,
            currency: 'USD',
            courseTitle: formData.title?.trim() || undefined,
          }),
        });
        if (!createPriceRes.ok) {
          const errText = await createPriceRes.text();
          throw new Error(`Création du prix Paddle échouée: ${createPriceRes.status} - ${errText}`);
        }
        const { priceId } = await createPriceRes.json();
        paddlePriceId = priceId || null;
      }

      // Créer le cours dans la base de données
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          thumbnail_url: thumbnailUrl || null,
          thumbnail_description: formData.thumbnailDescription || null,
          creator_id: user.id,
          is_featured: formData.isFeatured,
          ce_que_vous_allez_apprendre: formData.ceQueVousAllezApprendre || null,
          prerequis: formData.prerequis || null,
          public_cible: formData.publicCible || null,
          duree_estimee: formData.dureeEstimee || null,
          niveau_difficulte: formData.niveauDifficulte,
          playback_id: videoPlaybackId, // Stocker le videoId VdoCipher comme playback_id
          chapters: chapters.length > 0 ? JSON.stringify(chapters) : null, // Stocker les chapitres au format JSON
          paddle_price_id: paddlePriceId,
        })
        .select()
        .single();

      if (courseError) {
        throw new Error('Erreur lors de la création du cours');
      }

      setUploadProgress(100);
      success('Cours créé avec succès ! Votre vidéo a été uploadée sur VdoCipher et sera bientôt disponible.');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        price: '',
        isFeatured: false,
        thumbnailUrl: '',
        thumbnailDescription: '',
        ceQueVousAllezApprendre: '',
        prerequis: '',
        publicCible: '',
        dureeEstimee: '',
        niveauDifficulte: 'debutant'
      });
      setSelectedThumbnail(null);
      setSelectedVideo(null);
      setThumbnailPreview('');
      setPlaybackId('');
      setVideoUploadProgress(0);
      setChapters([]);
      setCurrentChapter({
        title: '',
        startTime: 0,
        startTimeFormatted: '00:00',
        duration: undefined,
        durationFormatted: '',
        description: undefined,
        thumbnail: undefined
      });

    } catch (err) {
      console.error('Erreur lors de la création du cours:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      error('Erreur lors de la création du cours: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <PageLayout>
      <Section className="py-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Créer un nouveau cours
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Partagez vos connaissances avec le monde en créant un cours vidéo interactif
              </p>
            </div>

            {/* Progress Bar */}
            {isSubmitting && (
              <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Création en cours...
                  </span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                {videoUploadProgress > 0 && videoUploadProgress < 100 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Upload vidéo...
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {videoUploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700">
                      <div 
                        className="bg-green-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${videoUploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="mr-3">📝</span>
                  Informations de base
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Titre du cours *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                      placeholder="Ex: Introduction à React"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                      placeholder="Décrivez votre cours..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prix (en dollars) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                      placeholder="29.99"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Niveau de difficulté
                    </label>
                    <select
                      name="niveauDifficulte"
                      value={formData.niveauDifficulte}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                    >
                      <option value="debutant">Débutant</option>
                      <option value="intermediaire">Intermédiaire</option>
                      <option value="avance">Avancé</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Mettre en vedette ce cours
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Detailed Information Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="mr-3">📋</span>
                  Informations détaillées
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ce que vous allez apprendre
                    </label>
                    <textarea
                      name="ceQueVousAllezApprendre"
                      value={formData.ceQueVousAllezApprendre}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                      placeholder="Listez les compétences que les étudiants acquerront..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prérequis
                    </label>
                    <textarea
                      name="prerequis"
                      value={formData.prerequis}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                      placeholder="Quelles connaissances préalables sont nécessaires ?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Public cible
                    </label>
                    <textarea
                      name="publicCible"
                      value={formData.publicCible}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                      placeholder="À qui s'adresse ce cours ?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Durée estimée
                    </label>
                    <input
                      type="text"
                      name="dureeEstimee"
                      value={formData.dureeEstimee}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                      placeholder="Ex: 2 heures, 30 minutes"
                    />
                  </div>
                </div>
              </div>

              {/* Thumbnail Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="mr-3">🖼️</span>
                  Image de couverture
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL de l&apos;image
                    </label>
                    <input
                      type="url"
                      name="thumbnailUrl"
                      value={formData.thumbnailUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ou télécharger une image
                    </label>
                    <input
                      type="file"
                      ref={thumbnailInputRef}
                      onChange={handleThumbnailChange}
                      accept="image/*"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description courte de l&apos;image
                    </label>
                    <input
                      type="text"
                      name="thumbnailDescription"
                      value={formData.thumbnailDescription}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                      placeholder="Description de l'image pour l'accessibilité"
                    />
                  </div>

                  {thumbnailPreview && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Aperçu
                      </label>
                      <div className="relative w-full max-w-md">
                        <Image
                          src={thumbnailPreview}
                          alt="Aperçu de la thumbnail"
                          width={400}
                          height={200}
                          className="w-full h-48 object-cover rounded-xl border border-gray-300 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="mr-3">🎥</span>
                  Vidéo du cours
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sélectionner une vidéo
                  </label>
                  <input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoChange}
                    accept="video/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                  />
                  {selectedVideo && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Vidéo sélectionnée: {selectedVideo.name} ({(selectedVideo.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>
              
              {/* Chapters Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <span className="mr-3">📑</span>
                  Description des chapitres
                </h2>
                
                <div className="space-y-6">
                  {/* Add Chapter Form */}
                  <div className="p-6 border border-gray-200 rounded-xl dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Ajouter un chapitre
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Titre du chapitre *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={currentChapter.title}
                          onChange={handleChapterInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                          placeholder="Ex: Introduction au cours"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Temps de début (HH:MM:SS ou MM:SS) *
                        </label>
                        <input
                          type="text"
                          name="startTimeFormatted"
                          value={currentChapter.startTimeFormatted}
                          onChange={handleChapterInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                          placeholder="00:00"
                          pattern="([0-9]+:)?[0-5]?[0-9]:[0-5][0-9]"
                          title="Format: HH:MM:SS ou MM:SS (ex: 01:30:45 ou 05:20)"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Durée (HH:MM:SS ou MM:SS, optionnel)
                        </label>
                        <input
                          type="text"
                          name="durationFormatted"
                          value={currentChapter.durationFormatted}
                          onChange={handleChapterInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                          placeholder="05:00"
                          pattern="([0-9]+:)?[0-5]?[0-9]:[0-5][0-9]"
                          title="Format: HH:MM:SS ou MM:SS (ex: 00:05:00 ou 05:00)"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Description (optionnel)
                        </label>
                        <textarea
                          name="description"
                          value={currentChapter.description || ''}
                          onChange={handleChapterInputChange}
                          rows={2}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                          placeholder="Description brève du chapitre..."
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={addChapter}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                      >
                        Ajouter le chapitre
                      </button>
                    </div>
                  </div>
                  
                  {/* Chapter List */}
                  {chapters.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Chapitres ({chapters.length})
                      </h3>
                      
                      <div className="border rounded-xl overflow-hidden dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                Titre
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                Début
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                Durée
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                Description
                              </th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                            {chapters.map((chapter) => (
                              <tr key={chapter.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  {chapter.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {formatTime(chapter.startTime)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {chapter.duration ? formatTime(chapter.duration) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                  {chapter.description || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => removeChapter(chapter.id)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    Supprimer
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Création en cours...
                    </>
                  ) : (
                    'Créer le cours'
                  )}
                </button>
              </div>
            </form>
          </div>
        </Container>
      </Section>

      {/* Toast Container */}
      {/* <ToastContainer toasts={toasts} onRemove={removeToast} /> */}
    </PageLayout>
  );
} 