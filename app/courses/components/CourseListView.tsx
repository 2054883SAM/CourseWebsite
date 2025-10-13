import Link from 'next/link';
import { NavigationLink } from '@/components/navigation/NavigationLink';
import Image from 'next/image';
import { Course } from '@/lib/supabase/types';
import { SearchHighlight } from './SearchHighlight';
import { useAuth } from '@/lib/auth/AuthContext';

interface CourseListViewProps {
  courses: Course[];
  searchQuery?: string;
  onCourseDeleted?: (id: string) => void;
  onDeleteStart?: () => void;
  onDeleteEnd?: () => void;
  onDeleteError?: (status: number, message: string) => void;
}

export function CourseListView({
  courses,
  searchQuery = '',
  onCourseDeleted,
  onDeleteStart,
  onDeleteEnd,
  onDeleteError,
}: CourseListViewProps) {
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
    <div className="space-y-4">
      {courses.map((course) => (
        <CourseListItem
          key={course.id}
          course={course}
          searchQuery={searchQuery}
          onDeleted={onCourseDeleted}
          onDeleteStart={onDeleteStart}
          onDeleteEnd={onDeleteEnd}
          onDeleteError={onDeleteError}
        />
      ))}
    </div>
  );
}

interface CourseListItemProps {
  course: Course;
  searchQuery?: string;
  onDeleted?: (id: string) => void;
  onDeleteStart?: () => void;
  onDeleteEnd?: () => void;
  onDeleteError?: (status: number, message: string) => void;
}

function CourseListItem({
  course,
  searchQuery = '',
  onDeleted,
  onDeleteStart,
  onDeleteEnd,
  onDeleteError,
}: CourseListItemProps) {
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
    <div className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md hover:shadow-blue-900/50">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-48 w-full flex-shrink-0 sm:h-auto sm:w-64">
          {course.thumbnail_url ? (
            <Image src={course.thumbnail_url} alt={course.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200">
              <span className="text-gray-400">Aucune image</span>
            </div>
          )}
          {!dbUser && (
            <div className="absolute bottom-0 right-0 bg-green-600 px-2 py-1 text-sm font-semibold text-white">
              Connectez-vous pour vous inscrire
            </div>
          )}
        </div>

        <div className="p-6">
          <NavigationLink href={`/courses/${course.id}`} className="block">
            <h3 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 group-hover:text-amber-600">
              {searchQuery ? (
                <SearchHighlight text={course.title} query={searchQuery} />
              ) : (
                course.title
              )}
            </h3>

            <p className="mb-4 text-gray-600">
              {searchQuery ? (
                <SearchHighlight text={course.description} query={searchQuery} />
              ) : (
                course.description
              )}
            </p>
          </NavigationLink>

          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center">
              <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600">
                👨‍🏫
              </div>
              <span className="text-sm text-gray-700">
                Professeur(e) {course.teacher_name || 'Non spécifié'}
              </span>
            </div>

            {dbUser && (
              <div className="flex items-center text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span className="text-sm">
                  {course.section_count || 0} {course.section_count === 1 ? 'section' : 'sections'}
                </span>
              </div>
            )}

            {!dbUser && (
              <button
                onClick={() => (window.location.href = '/signin')}
                className="text-sm font-medium text-gold-600 hover:text-gold-800"
              >
                Connectez-vous pour voir tous les détails
              </button>
            )}

            {dbUser?.role === 'admin' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  title="Supprimer"
                  className="inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-2 text-white shadow transition hover:bg-red-700"
                >
                  <svg
                    className="mr-1 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a 2 2 0 012-2h2a2 2 0 012 2v2m-7 0h8"
                    />
                  </svg>
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {dbUser?.role === 'admin' && (
        <div className="border-t border-gray-100 p-4">
          <Link
            href={`/courses/${course.id}/edit`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-gold-600 px-4 py-2 font-semibold text-white shadow hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
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
          </Link>
        </div>
      )}
    </div>
  );
}
