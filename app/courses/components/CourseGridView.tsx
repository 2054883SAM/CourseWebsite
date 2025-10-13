import Link from 'next/link';
import { NavigationLink } from '@/components/navigation/NavigationLink';
import Image from 'next/image';
import { Course } from '@/lib/supabase/types';
import { SearchHighlight } from './SearchHighlight';
import { useAuth } from '@/lib/auth/AuthContext';

interface CourseGridViewProps {
  courses: Course[];
  searchQuery?: string;
  onCourseDeleted?: (id: string) => void;
  onDeleteStart?: () => void;
  onDeleteEnd?: () => void;
  onDeleteError?: (status: number, message: string) => void;
}

export function CourseGridView({
  courses,
  searchQuery = '',
  onCourseDeleted,
  onDeleteStart,
  onDeleteEnd,
  onDeleteError,
}: CourseGridViewProps) {
  if (courses.length === 0) {
    return (
      <div className="relative py-16 text-center">
        {/* Formes géométriques autour du message - Formes sélectionnées */}
        <div
          className="absolute bottom-1/4 left-1/4 h-5 w-5 animate-bounce rounded-full bg-gradient-to-br from-yellow-400/50 to-orange-500/35 shadow-lg"
          style={{
            animationDuration: '3.2s',
            animationDelay: '2.1s',
            boxShadow: '0 0 18px rgba(251, 191, 36, 0.4)',
          }}
        ></div>

        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 shadow-2xl"
          style={{
            boxShadow: '0 0 30px rgba(245, 158, 11, 0.3), 0 0 60px rgba(245, 158, 11, 0.15)',
          }}
        >
          <span className="animate-bounce text-3xl">🔍</span>
        </div>
        <h3
          className="mb-4 text-2xl font-bold text-amber-800"
          style={{
            textShadow: '0 0 15px rgba(245, 158, 11, 0.3)',
          }}
        >
          Aucun cours trouvé
        </h3>
        <p
          className="mx-auto max-w-md font-medium text-gray-700"
          style={{
            textShadow: '0 0 10px rgba(245, 158, 11, 0.2)',
          }}
        >
          {searchQuery
            ? `Aucun résultat ne correspond à votre recherche "${searchQuery}". Essayez d'autres mots-clés.`
            : "Essayez d'ajuster vos critères de recherche ou de filtres."}
        </p>
        {searchQuery && (
          <button
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              params.delete('query');
              window.location.search = params.toString();
            }}
            className="group relative mt-6 inline-flex items-center overflow-hidden rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-amber-500/25"
            style={{
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>✨</span>
              <span>Voir tous les cours</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course, index) => (
        <CourseCard
          key={course.id}
          course={course}
          searchQuery={searchQuery}
          index={index}
          onDeleted={onCourseDeleted}
          onDeleteStart={onDeleteStart}
          onDeleteEnd={onDeleteEnd}
          onDeleteError={onDeleteError}
        />
      ))}
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  searchQuery?: string;
  index: number;
  onDeleted?: (id: string) => void;
  onDeleteStart?: () => void;
  onDeleteEnd?: () => void;
  onDeleteError?: (status: number, message: string) => void;
}

function CourseCard({
  course,
  searchQuery = '',
  index,
  onDeleted,
  onDeleteStart,
  onDeleteEnd,
  onDeleteError,
}: CourseCardProps) {
  const { dbUser } = useAuth();

  const handleDelete = async () => {
    if (!confirm('Supprimer ce cours ? Cette action est irréversible.')) return;
    try {
      onDeleteStart?.();
      const res = await fetch(`/api/courses/${course.id}/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ courseId: course.id }),
      });
      if (res.ok) {
        onDeleted?.(course.id);
      } else {
        const { error } = await res.json().catch(() => ({ error: 'Delete failed' }));
        onDeleteError?.(res.status, error || 'Delete failed');
      }
    } catch (e: any) {
      onDeleteError?.(-1, e?.message || 'Delete failed');
    } finally {
      onDeleteEnd?.();
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl dark:bg-gray-800">
      {/* Image avec overlay */}
      <div className="relative h-56 w-full overflow-hidden">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
            <div className="text-center">
              <span className="text-4xl text-gray-400 dark:text-gray-500">📚</span>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Aucune image</p>
            </div>
          </div>
        )}

        {/* Overlay au survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100"></div>

        {/* Badge: sign in prompt */}
        <div className="absolute right-4 top-4">
          {!dbUser && (
            <div className="rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-3 py-1 text-sm font-bold text-white shadow-lg">
              Se connecter
            </div>
          )}
        </div>

        {/* Badge de niveau si disponible */}
        {course.niveau_difficulte && (
          <div className="absolute left-4 top-4">
            <div className="rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
              {course.niveau_difficulte}
            </div>
          </div>
        )}
      </div>

      {/* Contenu de la carte */}
      <div className="p-6">
        <NavigationLink href={`/courses/${course.id}`} className="block">
          <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 group-hover:text-amber-600">
            {searchQuery ? (
              <SearchHighlight text={course.title} query={searchQuery} />
            ) : (
              course.title
            )}
          </h3>

          <p className="mb-4 line-clamp-3 text-sm text-gray-600">
            {searchQuery ? (
              <SearchHighlight text={course.description} query={searchQuery} />
            ) : (
              course.description
            )}
          </p>
        </NavigationLink>

        {/* Informations du professeur */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200">
              <span className="text-sm">👨‍🏫</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {course.teacher_name || 'Non spécifié'}
              </p>
              <p className="text-xs text-gray-500">Professeur(e)</p>
            </div>
          </div>

          {/* Bouton d'action */}
          <div className="flex items-center space-x-2">
            {dbUser?.role === 'admin' && (
              <button
                onClick={handleDelete}
                title="Supprimer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 group-hover:shadow-xl"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2m-7 0h8"
                  />
                </svg>
              </button>
            )}
            <NavigationLink
              href={`/courses/${course.id}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-lg hover:from-gray-700 hover:to-gray-900 group-hover:shadow-xl"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </NavigationLink>
          </div>
        </div>

        {/* Informations supplémentaires */}
        {course.duree_estimee && (
          <div className="mt-4 flex items-center text-xs text-gray-500">
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {course.duree_estimee}
          </div>
        )}

        {dbUser?.role === 'admin' && (
          <NavigationLink
            href={`/courses/${course.id}/edit`}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-gold-600 px-4 py-2 font-semibold text-white shadow hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536M4 13.5V19h5.5l9.621-9.621a1.5 1.5 0 000-2.121l-3.379-3.379a1.5 1.5 0 00-2.121 0L4 13.5z"
              />
            </svg>
            Modifier
          </NavigationLink>
        )}
      </div>

      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full"></div>
    </div>
  );
}
