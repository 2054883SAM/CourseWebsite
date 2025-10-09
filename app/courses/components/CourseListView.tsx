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

export function CourseListView({ courses, searchQuery = '', onCourseDeleted, onDeleteStart, onDeleteEnd, onDeleteError }: CourseListViewProps) {
  if (courses.length === 0) {
    return (
      <div className="py-16 text-center relative">
        {/* Formes géométriques autour du message - Formes sélectionnées */}
        <div className="absolute bottom-1/4 left-1/4 w-5 h-5 bg-gradient-to-br from-yellow-400/50 to-orange-500/35 rounded-full animate-bounce shadow-lg" style={{
          animationDuration: '3.2s', 
          animationDelay: '2.1s',
          boxShadow: '0 0 18px rgba(251, 191, 36, 0.4)'
        }}></div>
        
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 shadow-2xl" style={{
          boxShadow: '0 0 30px rgba(245, 158, 11, 0.3), 0 0 60px rgba(245, 158, 11, 0.15)'
        }}>
          <span className="text-3xl animate-bounce">🔍</span>
        </div>
        <h3 className="mb-4 text-2xl font-bold text-amber-800" style={{
          textShadow: '0 0 15px rgba(245, 158, 11, 0.3)'
        }}>
          Aucun cours trouvé
        </h3>
        <p className="mx-auto max-w-md text-gray-700 font-medium" style={{
          textShadow: '0 0 10px rgba(245, 158, 11, 0.2)'
        }}>
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
            className="mt-6 group relative inline-flex items-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white shadow-xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105 overflow-hidden"
            style={{
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)'
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>✨</span>
              <span>Voir tous les cours</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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

function CourseListItem({ course, searchQuery = '', onDeleted, onDeleteStart, onDeleteEnd, onDeleteError }: CourseListItemProps) {
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">Aucune image</span>
            </div>
          )}
          {!dbUser && (
            <div className="absolute bottom-0 right-0 bg-green-600 text-white px-2 py-1 text-sm font-semibold">
              Connectez-vous pour vous inscrire
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 flex-1">
          <NavigationLink href={`/courses/${course.id}`} className="block">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1 group-hover:text-gold-600 dark:group-hover:text-gold-400">
                {searchQuery ? (
                  <SearchHighlight text={course.title} query={searchQuery} />
                ) : (
                  course.title
                )}
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {searchQuery ? (
                <SearchHighlight text={course.description} query={searchQuery} />
              ) : (
                course.description
              )}
            </p>
          </NavigationLink>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center">
              {course.creator?.photo_url ? (
                <Image 
                  src={course.creator.photo_url} 
                  alt={course.creator.name}
                  width={24}
                  height={24}
                  className="rounded-full mr-2"
                />
              ) : (
                <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center mr-2">
                  {course.creator?.name.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300">{course.creator?.name || 'Créateur inconnu'}</span>
            </div>

            {dbUser && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
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
                onClick={() => window.location.href = '/signin'} 
                className="text-sm text-gold-600 hover:text-gold-800 dark:text-gold-400 dark:hover:text-gold-300 font-medium"
              >
                Connectez-vous pour voir tous les détails
              </button>
            )}

            {dbUser?.role === 'admin' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  title="Supprimer"
                  className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-red-600 text-white shadow hover:bg-red-700 transition"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a 2 2 0 012-2h2a2 2 0 012 2v2m-7 0h8" />
                  </svg>
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {dbUser?.role === 'admin' && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <Link
            href={`/courses/${course.id}/edit`}
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gold-600 text-white font-semibold shadow hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 13.5V19h5.5l9.621-9.621a1.5 1.5 0 000-2.121l-3.379-3.379a1.5 1.5 0 00-2.121 0L4 13.5z" />
            </svg>
            Modifier
          </Link>
        </div>
      )}
    </div>
  );
} 