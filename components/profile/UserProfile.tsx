'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import Image from 'next/image';
import { useToast, ToastContainer } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase/client';

export default function UserProfile() {
  const { user, dbUser, loading } = useAuth();
  const [name, setName] = useState(dbUser?.name || user?.user_metadata?.full_name || '');
  const [bio, setBio] = useState(dbUser?.bio || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, success, error, removeToast } = useToast();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !dbUser) {
    return (
      <div className="text-center p-8">
        <div className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Non authentifié
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Veuillez vous connecter pour voir votre profil.
        </p>
      </div>
    );
  }

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
  };

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validation du fichier
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        error('La taille du fichier doit être inférieure à 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        error('Veuillez sélectionner un fichier image valide');
        return;
      }

      setIsUploadingPhoto(true);

      // Ensure we have the latest auth context
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      
      if (!userId) {
        throw new Error("Vous devez être connecté pour télécharger une photo");
      }

      // Upload photo to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      console.log('Using auth ID for upload:', userId);
      console.log('Upload path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('profile-picture')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Erreur lors de l&apos;upload de la photo');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-picture')
        .getPublicUrl(filePath);

      // Update user profile with new photo URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ photo_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      success('Photo de profil mise à jour avec succès !');
      
      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error('Error uploading photo:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      error('Échec de l&apos;upload de la photo: ' + errorMessage);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setIsDeletingPhoto(true);
      setShowDeleteConfirm(false);

      // Update user profile to remove photo URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ photo_url: null })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Erreur lors de la suppression de la photo');
      }

      success('Photo de profil supprimée avec succès !');
      
      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      console.error('Error deleting photo:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      error('Échec de la suppression de la photo: ' + errorMessage);
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);

      const { error: updateError } = await supabase
        .from('users')
        .update({ name, bio })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      success('Profil mis à jour avec succès !');
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      error('Échec de la mise à jour du profil: ' + errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full mb-4 sm:mb-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Mon Profil
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 px-4">
            Personnalisez votre expérience et gérez vos informations
          </p>
        </div>

        <div className="rounded-2xl bg-white/90 backdrop-blur-sm border border-white/20 shadow-2xl p-4 sm:p-6 lg:p-8 dark:bg-gray-800/90 dark:border-gray-700/20">
        {/* Photo de profil */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl mr-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Photo de profil
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-6 lg:space-x-8">
            <div className="relative">
              {dbUser.photo_url ? (
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 group">
                  <Image
                    src={dbUser.photo_url}
                    alt={`Photo de profil de ${dbUser.name}`}
                    width={160}
                    height={160}
                    className="w-full h-full rounded-2xl object-cover border-4 border-white/50 shadow-2xl"
                  />
                  
                  {/* Overlay avec bouton de suppression */}
                  <div className="absolute inset-0 rounded-2xl bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeletingPhoto}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                      aria-label="Supprimer la photo de profil"
                    >
                      <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs sm:text-sm font-medium bg-black/50 px-2 py-1 sm:px-3 sm:py-1 rounded-full hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-2xl flex items-center justify-center border-4 border-white/50 shadow-2xl">
                  <span className="text-4xl sm:text-5xl text-orange-600 dark:text-orange-400 font-bold">
                    {(dbUser.name || user?.user_metadata?.full_name)?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {dbUser.name || user?.user_metadata?.full_name || 'Utilisateur'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-base sm:text-lg">
                {dbUser.photo_url ? 'Survolez votre photo pour la modifier ou la supprimer.' : 'Ajoutez une photo de profil pour personnaliser votre compte.'}
              </p>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-2xl shadow-lg hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {isUploadingPhoto ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Upload en cours...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {dbUser.photo_url ? 'Modifier la photo' : 'Ajouter une photo'}
                  </>
                )}
              </button>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                Formats acceptés: JPG, PNG, GIF • Taille max: 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Informations du profil */}
        <div>
          <div className="flex items-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl mr-4 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Informations personnelles
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-500 focus:scale-[1.02] transform"
                  disabled={isUpdating}
                  required
                  minLength={2}
                  maxLength={50}
                  placeholder="Votre nom complet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={dbUser.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
                  placeholder="email@exemple.com"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  L&apos;email ne peut pas être modifié
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rôle
                </label>
                <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 transition-all duration-300 shadow-sm hover:shadow-md">
                  <span className="capitalize">{dbUser.role}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Votre rôle dans la plateforme
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date d&apos;inscription
                </label>
                <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 transition-all duration-300 shadow-sm hover:shadow-md">
                  {dbUser.created_at ? new Date(dbUser.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </div>
              </div>
            </div>

            {/* Bio/Description */}
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio / Description
              </label>
              <textarea
                value={bio}
                onChange={handleBioChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-300 resize-none shadow-sm hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-500 focus:scale-[1.01] transform"
                disabled={isUpdating}
                rows={4}
                maxLength={500}
                placeholder="Parlez-nous de vous... (votre expertise, vos passions, vos objectifs)"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Décrivez-vous en quelques mots pour personnaliser votre profil
                </p>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {bio.length}/500
                </span>
              </div>
            </div>

            <div className="flex justify-center pt-6 sm:pt-8">
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center px-8 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-2xl shadow-lg hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sauvegarder les modifications
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-white/20 dark:border-gray-700/20">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Supprimer la photo de profil ?
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Êtes-vous sûr de vouloir supprimer votre photo de profil ? Cette action ne peut pas être annulée.
              </p>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeletingPhoto}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  disabled={isDeletingPhoto}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                >
                  {isDeletingPhoto ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Suppression...
                    </>
                  ) : (
                    'Supprimer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
} 