'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useAuth } from '@/lib/auth/hooks';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import { useToast, ToastContainer } from '@/components/ui/Toast';

export default function UserProfile() {
  const { user, dbUser, loading } = useAuth();
  const [name, setName] = useState(dbUser?.name || '');
  const [bio, setBio] = useState(dbUser?.bio || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();
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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Paramètres du profil
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Gérez vos informations personnelles et votre photo de profil
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        {/* Photo de profil */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span className="mr-3">📸</span>
            Photo de profil
          </h2>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              {dbUser.photo_url ? (
                <div className="relative w-32 h-32 group">
                  <Image
                    src={dbUser.photo_url}
                    alt={`Photo de profil de ${dbUser.name}`}
                    width={128}
                    height={128}
                    className="rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                  />
                  
                  {/* Overlay avec bouton de suppression */}
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeletingPhoto}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Supprimer la photo de profil"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm font-medium">
                      Modifier
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center border-4 border-gray-200 dark:border-gray-600">
                  <span className="text-4xl text-gray-500 dark:text-gray-400 font-bold">
                    {dbUser.name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {dbUser.name || 'Utilisateur'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {dbUser.photo_url ? 'Cliquez sur "Modifier la photo" pour changer votre image de profil, ou survolez la photo pour la supprimer.' : 'Ajoutez une photo de profil pour personnaliser votre compte.'}
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
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
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
                    📷 {dbUser.photo_url ? 'Modifier la photo' : 'Ajouter une photo'}
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Informations du profil */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span className="mr-3">👤</span>
            Informations personnelles
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
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
                <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
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
                <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 resize-none"
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

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-full shadow-lg hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
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
                  '💾 Sauvegarder les modifications'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
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
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
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