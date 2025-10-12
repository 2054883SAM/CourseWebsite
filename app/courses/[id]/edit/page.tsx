'use client';

import { use, useEffect, useMemo, useState } from 'react';
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
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6 h-8 w-1/3 animate-pulse rounded bg-gray-200" />
        <div className="space-y-4">
          <div className="h-10 rounded bg-gray-200" />
          <div className="h-24 rounded bg-gray-200" />
          <div className="h-10 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="rounded border border-red-300 bg-red-50 p-4 text-red-700">{error}</div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Modifier le cours</h1>
      {successMsg && (
        <div className="mb-4 rounded border border-green-300 bg-green-50 p-3 text-green-700">
          {successMsg}
        </div>
      )}
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Titre
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Miniature (thumbnail)
          </label>
          <input type="file" accept="image/*" onChange={handleThumbnailChange} />
          {course.thumbnail_url && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Miniature actuelle:{' '}
              <a href={course.thumbnail_url} className="text-blue-600 underline" target="_blank">
                voir
              </a>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-md bg-gradient-to-r from-gray-600 to-gray-800 px-5 py-2 text-white shadow hover:from-gray-700 hover:to-gray-900 disabled:opacity-60"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/courses/${course.id}`)}
            className="inline-flex items-center rounded-md border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default withAuth(EditCoursePage, { requiredRole: 'admin' });
