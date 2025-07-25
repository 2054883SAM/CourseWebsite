'use client';

import { useState, useRef } from 'react';
import { PageLayout, Container, Section } from '@/components/layout';
import { useAuth } from '@/lib/auth/hooks';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
// import { useToast, ToastContainer } from '../../../components/ui/Toast';

export default function CreateVideoPage() {
  const { user, dbUser } = useAuth();
  const supabase = createClientComponentClient<Database>();
  // const { toasts, success, error, removeToast } = useToast();

  // Temporary toast replacements
  const success = (message: string) => {
    console.log('Success:', message);
    alert(message);
  };
  const error = (message: string) => {
    console.error('Error:', message);
    alert('Erreur: ' + message);
  };

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

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  const uploadVideoToMux = async (file: File): Promise<string> => {
    try {
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
      // Attendre un peu que l'upload soit traité
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Récupérer le playbackId après l'upload en utilisant l'uploadId
      const playbackResponse = await fetch(`/api/upload-video?uploadId=${uploadId}`, {
        method: 'GET',
      });

      if (!playbackResponse.ok) {
        throw new Error('Erreur lors de la récupération du playbackId');
      }

      const { playbackId } = await playbackResponse.json();
      if (!playbackId) {
        throw new Error('PlaybackId non disponible');
      }

      setVideoUploadProgress(100);
      return playbackId;
    } catch (error) {
      console.error('Erreur upload vidéo:', error);
      throw error;
    }
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `course-thumbnails/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('course-thumbnails')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error('Erreur lors de l\'upload de la thumbnail');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('course-thumbnails')
      .getPublicUrl(filePath);

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

      // Upload thumbnail si un fichier est sélectionné
      if (selectedThumbnail) {
        setUploadProgress(20);
        thumbnailUrl = await uploadThumbnail(selectedThumbnail);
        setUploadProgress(40);
      }

      // Upload vidéo si un fichier est sélectionné
      if (selectedVideo) {
        setUploadProgress(60);
        videoPlaybackId = await uploadVideoToMux(selectedVideo);
        setPlaybackId(videoPlaybackId);
        setUploadProgress(80);
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
          playback_id: videoPlaybackId // Stocker le playbackId directement dans le cours
        })
        .select()
        .single();

      if (courseError) {
        throw new Error('Erreur lors de la création du cours');
      }

      setUploadProgress(100);
      success('Cours créé avec succès ! Votre vidéo est maintenant disponible.');
      
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
                      URL de l'image
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
                      Description courte de l'image
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
                        <img
                          src={thumbnailPreview}
                          alt="Aperçu de la thumbnail"
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