'use client';

import { use, useEffect, useMemo, useState, useRef } from 'react';
import { withAuth } from '@/components/auth/withAuth';
import { Course } from '@/lib/supabase/types';
import { getCourseById, supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

type PageParams = { id: string };
type PageProps = { params: Promise<PageParams> };

function EditCoursePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [course, setCourse] = useState<Course | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getCourseById(id);
        if (!mounted) return;
        if (!data) {
          setError('Course not found');
          return;
        }
        setCourse(data);
        setTitle(data.title || '');
        setDescription(data.description || '');
        // price removed from schema
      } catch (e) {
        console.error(e);
        if (mounted) setError('Failed to load course');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnailFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setThumbnailPreview('');
    }
  };

  const deleteOldThumbnailIfAny = async (existingUrl?: string | null) => {
    if (!existingUrl) return;
    try {
      const url = new URL(existingUrl);
      const publicPrefix = '/storage/v1/object/public/course-thumbnails/';
      const idx = url.pathname.indexOf(publicPrefix);
      if (idx !== -1) {
        const relativePath = url.pathname.substring(idx + publicPrefix.length);
        if (relativePath) {
          const { error: removeErr } = await supabase.storage
            .from('course-thumbnails')
            .remove([relativePath]);
          if (removeErr) throw removeErr;
        }
      }
    } catch (e) {
      console.warn('Failed to parse/delete old thumbnail. Continuing.', e);
    }
  };

  const uploadNewThumbnailIfProvided = async (): Promise<string | null> => {
    if (!thumbnailFile) return null;
    // basic validations
    if (!thumbnailFile.type.startsWith('image/')) {
      throw new Error('Le fichier de miniature doit être une image');
    }
    if (thumbnailFile.size > 5 * 1024 * 1024) {
      throw new Error("L'image doit faire moins de 5MB");
    }
    const fileExt = thumbnailFile.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `course-thumbnails/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('course-thumbnails')
      .upload(filePath, thumbnailFile);
    if (uploadError) throw new Error(`Erreur upload thumbnail: ${uploadError.message}`);
    const { data: publicData } = supabase.storage.from('course-thumbnails').getPublicUrl(filePath);
    return publicData.publicUrl || null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setError(null);
    setSuccessMsg(null);
    setSaving(true);
    try {
      let thumbnailUrlToUse: string | null | undefined = course.thumbnail_url;

      // Replace thumbnail if a new file is selected
      if (thumbnailFile) {
        await deleteOldThumbnailIfAny(course.thumbnail_url);
        thumbnailUrlToUse = await uploadNewThumbnailIfProvided();
      }

      // Update Supabase course fields first
      const { error: updateErr } = await supabase
        .from('courses')
        .update({
          title: title.trim(),
          description: description.trim(),
          thumbnail_url: thumbnailUrlToUse ?? null,
        })
        .eq('id', course.id);
      if (updateErr) throw new Error(updateErr.message);

      setSuccessMsg('Cours mis à jour avec succès');
      // Refresh and redirect back to course page after a short delay
      setTimeout(() => {
        router.push(`/courses/${course.id}`);
      }, 800);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Échec de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="background-beige min-h-screen relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-bl from-amber-300/40 via-amber-200/30 to-orange-400/40 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-400/35 to-orange-400/35 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-gradient-to-tr from-amber-400/35 to-orange-400/35 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-300/30 to-orange-300/30 rounded-full blur-2xl animate-pulse-slow"></div>
        </div>
        
        <div className="container mx-auto px-4 py-10 relative z-[10]">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600"></div>
              </div>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Chargement du cours...
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Veuillez patienter pendant que nous récupérons les informations
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="background-beige min-h-screen relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-bl from-amber-300/40 via-amber-200/30 to-orange-400/40 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-400/35 to-orange-400/35 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-gradient-to-tr from-amber-400/35 to-orange-400/35 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-300/30 to-orange-300/30 rounded-full blur-2xl animate-pulse-slow"></div>
        </div>
        
        <div className="container mx-auto px-4 py-10 relative z-[10]">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-md mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-red-200 shadow-lg p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-red-800 mb-2">Erreur</h2>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="background-beige min-h-screen relative">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-bl from-amber-300/40 via-amber-200/30 to-orange-400/40 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-400/35 to-orange-400/35 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-gradient-to-tr from-amber-400/35 to-orange-400/35 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-300/30 to-orange-300/30 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8 relative z-[10]">
        {/* Header */}
        <div className="mb-8">
          <div className="rounded-xl border border-white/20 bg-white/90 p-6 shadow-lg backdrop-blur-sm dark:border-gray-700/20 dark:bg-gray-800/90 text-center">
            <h1 className="mb-4 text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Modifier le cours
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Mettez à jour les informations de votre cours et perfectionnez votre contenu
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 shadow-lg p-4">
            <div className="flex items-center">
              <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-700 font-medium">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg p-6 lg:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Title Section */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Titre du cours
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 dark:border-gray-600 dark:bg-gray-800/90 dark:text-white"
                placeholder="Entrez le titre de votre cours"
                required
              />
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                className="w-full rounded-xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-200 resize-none dark:border-gray-600 dark:bg-gray-800/90 dark:text-white"
                placeholder="Décrivez le contenu et les objectifs de votre cours"
                required
              />
            </div>

            {/* Thumbnail Section */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Miniature du cours
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-amber-400 transition-colors duration-200">
                <input 
                  ref={thumbnailInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleThumbnailChange}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label htmlFor="thumbnail-upload" className="cursor-pointer">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-3">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Cliquez pour sélectionner une nouvelle image
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG jusqu'à 5MB
                  </p>
                </label>
              </div>
              {/* Aperçu de la nouvelle image */}
              {thumbnailPreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Nouvelle miniature :
                  </p>
                  <div className="group relative w-full max-w-md mx-auto">
                    <img
                      src={thumbnailPreview}
                      alt="Aperçu de la nouvelle miniature"
                      className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition-shadow duration-200"
                    />
                    {/* Overlay pour desktop */}
                    <div className="hidden md:flex absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-xl items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => {
                          setThumbnailFile(null);
                          setThumbnailPreview('');
                          if (thumbnailInputRef.current) {
                            thumbnailInputRef.current.value = '';
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 inline-flex items-center justify-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-gray-700 text-sm font-medium shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Supprimer
                      </button>
                    </div>
                    
                    {/* Bouton pour mobile - en bas */}
                    <div className="md:hidden absolute bottom-2 left-1/2 transform -translate-x-1/2">
                      <button 
                        type="button"
                        onClick={() => {
                          setThumbnailFile(null);
                          setThumbnailPreview('');
                          if (thumbnailInputRef.current) {
                            thumbnailInputRef.current.value = '';
                          }
                        }}
                        className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-gray-700 text-sm font-medium shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Miniature actuelle */}
              {course.thumbnail_url && !thumbnailPreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Miniature actuelle :
                  </p>
                  <div className="group relative w-full max-w-md mx-auto">
                    <img
                      src={course.thumbnail_url}
                      alt="Miniature actuelle du cours"
                      className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition-shadow duration-200"
                    />
                    {/* Overlay pour desktop */}
                    <div className="hidden md:flex absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-xl items-center justify-center">
                      <a 
                        href={course.thumbnail_url} 
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-105 inline-flex items-center justify-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-gray-700 text-sm font-medium shadow-lg" 
                        target="_blank"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Voir en grand
                      </a>
                    </div>
                    
                    {/* Bouton pour mobile - en bas */}
                    <div className="md:hidden absolute bottom-2 left-1/2 transform -translate-x-1/2">
                      <a 
                        href={course.thumbnail_url} 
                        className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-gray-700 text-sm font-medium shadow-lg hover:scale-105 transition-all duration-200" 
                        target="_blank"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Voir en grand
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-white font-semibold shadow-lg hover:from-amber-600 hover:to-amber-700 focus:ring-2 focus:ring-amber-200 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Enregistrer les modifications
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/courses/${course.id}`)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white/80 backdrop-blur-sm px-6 py-3 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all duration-200 dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default withAuth(EditCoursePage, { requiredRole: 'admin' });
