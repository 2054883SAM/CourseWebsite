'use client';

import { useState, useRef } from 'react';
import { PageLayout, Container, Section } from '@/components/layout';
import { useAuth } from '@/lib/auth/hooks';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export default function CreateVideoPage() {
  const { user, dbUser } = useAuth();
  const supabase = createClientComponentClient<Database>();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    isFeatured: false,
    thumbnailUrl: '',
    thumbnailDescription: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [playbackId, setPlaybackId] = useState<string>('');
  
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      
      // Créer un aperçu
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

  const uploadVideoToMux = async (file: File): Promise<string> => {
    try {
      // Étape 1: Créer l'upload URL avec notre API
      const response = await fetch('/api/upload-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de l\'upload URL');
      }

      const { uploadUrl, uploadId } = await response.json();
      setVideoUploadProgress(25);

      // Étape 2: Uploader la vidéo directement vers Mux
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Erreur lors de l\'upload vers Mux');
      }

      setVideoUploadProgress(75);

      // Étape 3: Attendre que la vidéo soit traitée et récupérer le playback ID
      // Note: En production, vous devriez utiliser un webhook ou polling
      // Pour simplifier, on simule un délai
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVideoUploadProgress(100);

      // Pour l'instant, on retourne un playback ID fictif
      // En production, vous devriez récupérer le vrai playback ID depuis Mux
      return 'demo-playback-id-' + Date.now();

    } catch (error) {
      console.error('Erreur upload vidéo:', error);
      throw error;
    }
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('course-thumbnails')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('course-thumbnails')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !dbUser) {
      alert('Vous devez être connecté pour créer un cours.');
      return;
    }

    if (!selectedVideo) {
      alert('Veuillez sélectionner une vidéo.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);
    setVideoUploadProgress(0);

    try {
      let thumbnailUrl = formData.thumbnailUrl;
      let videoPlaybackId = '';

      // Upload thumbnail si une image a été sélectionnée
      if (selectedThumbnail) {
        setUploadProgress(25);
        thumbnailUrl = await uploadThumbnail(selectedThumbnail);
        setUploadProgress(50);
      }

      // Upload vidéo vers Mux
      setUploadProgress(60);
      videoPlaybackId = await uploadVideoToMux(selectedVideo);
      setPlaybackId(videoPlaybackId);
      setUploadProgress(80);

      // Créer le cours dans Supabase
      const { data: course, error } = await supabase
        .from('courses')
        .insert({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          thumbnail_url: thumbnailUrl || null,
          creator_id: user.id,
          // Ajouter les champs manquants si ils existent dans la DB
          ...(formData.isFeatured && { is_featured: formData.isFeatured }),
          ...(formData.thumbnailDescription && { thumbnail_description: formData.thumbnailDescription })
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du cours:', error);
        throw error;
      }

      setUploadProgress(100);
      
      alert(`Cours "${formData.title}" créé avec succès! Playback ID: ${videoPlaybackId}`);
      
      // Rediriger vers la page du cours ou la liste des cours
      window.location.href = `/courses/${course.id}`;

    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du cours. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
      setVideoUploadProgress(0);
    }
  };

  return (
    <PageLayout>
      <Container>
        <Section>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Créer une nouvelle vidéo</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section Upload Vidéo */}
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Upload de la vidéo</h2>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium">Glissez votre vidéo ici</p>
                    <p className="text-sm">ou cliquez pour sélectionner un fichier</p>
                    <p className="text-xs mt-2">Formats supportés: MP4, MOV, AVI (Max 2GB)</p>
                  </div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    id="video-upload"
                    onChange={handleVideoChange}
                  />
                  <label
                    htmlFor="video-upload"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 cursor-pointer"
                  >
                    {selectedVideo ? `Vidéo sélectionnée: ${selectedVideo.name}` : 'Sélectionner une vidéo'}
                  </label>
                  
                  {selectedVideo && (
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                      <p>Taille: {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <p>Type: {selectedVideo.type}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Informations de base */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Informations de base</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Titre de la vidéo *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                      placeholder="Ex: Introduction à React"
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prix ($)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    placeholder="Décrivez le contenu de votre vidéo..."
                  />
                </div>

                <div className="mt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Mettre en vedette
                    </span>
                  </label>
                </div>
              </div>

              {/* Section Thumbnail */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Image de couverture (Thumbnail)</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL de l'image
                    </label>
                    <input
                      type="url"
                      id="thumbnailUrl"
                      name="thumbnailUrl"
                      value={formData.thumbnailUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label htmlFor="thumbnailDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description courte
                    </label>
                    <input
                      type="text"
                      id="thumbnailDescription"
                      name="thumbnailDescription"
                      value={formData.thumbnailDescription}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                      placeholder="Description courte de la vidéo"
                    />
                  </div>
                </div>

                {/* Upload d'image depuis l'appareil */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ou télécharger une image depuis votre appareil
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleThumbnailChange}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-sm transition-colors"
                    >
                      📷 Prendre une photo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            setSelectedThumbnail(file);
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setThumbnailPreview(e.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-sm transition-colors"
                    >
                      📁 Choisir une image
                    </button>
                  </div>
                  
                  {/* Aperçu de l'image sélectionnée */}
                  {thumbnailPreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Aperçu:</p>
                      <img 
                        src={thumbnailPreview} 
                        alt="Aperçu thumbnail" 
                        className="w-32 h-24 object-cover rounded-md border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Barres de progression */}
              {isSubmitting && (
                <div className="space-y-4">
                  {/* Progression générale */}
                  <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Création du cours en cours...
                      </span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Progression vidéo */}
                  {videoUploadProgress > 0 && videoUploadProgress < 100 && (
                    <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          Upload vidéo vers Mux...
                        </span>
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {videoUploadProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-green-200 dark:bg-green-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${videoUploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedVideo}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Création en cours...' : 'Créer la vidéo'}
                </button>
              </div>
            </form>
          </div>
        </Section>
      </Container>
    </PageLayout>
  );
} 