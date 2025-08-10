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
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
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
        setPrice(data.price != null ? String(data.price) : '');
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
          const { error: removeErr } = await supabase
            .storage
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
    const { data: publicData } = supabase.storage
      .from('course-thumbnails')
      .getPublicUrl(filePath);
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
      const newPriceNumber = Number(price);
      if (Number.isNaN(newPriceNumber) || newPriceNumber < 0) {
        throw new Error('Le prix doit être un nombre valide');
      }

      const { error: updateErr } = await supabase
        .from('courses')
        .update({
          title: title.trim(),
          description: description.trim(),
          price: newPriceNumber,
          thumbnail_url: thumbnailUrlToUse ?? null,
        })
        .eq('id', course.id);
      if (updateErr) throw new Error(updateErr.message);

      // If price changed and paddle_price_id exists, PATCH Paddle price
      const priceChanged = newPriceNumber !== course.price;
      if (priceChanged && course.paddle_price_id) {
        const amountCents = Math.round(newPriceNumber * 100);
        const resp = await fetch(`/api/paddle/prices/${course.paddle_price_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            unit_price: {
              amount: String(amountCents),
              currency_code: currency || 'USD',
            },
          }),
        });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}));
          throw new Error(j?.error || 'Paddle price update failed');
        }
      }

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
        <div className="animate-pulse h-8 w-1/3 bg-gray-200 rounded mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
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
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Modifier le cours</h1>
      {successMsg && (
        <div className="mb-4 rounded border border-green-300 bg-green-50 p-3 text-green-700">{successMsg}</div>
      )}
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Prix</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Devise</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Miniature (thumbnail)</label>
          <input type="file" accept="image/*" onChange={handleThumbnailChange} />
          {course.thumbnail_url && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Miniature actuelle: <a href={course.thumbnail_url} className="text-blue-600 underline" target="_blank">voir</a>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-5 py-2 rounded-md bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow hover:from-gray-700 hover:to-gray-900 disabled:opacity-60"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/courses/${course.id}`)}
            className="inline-flex items-center px-5 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default withAuth(EditCoursePage, { requiredRole: 'admin' });


