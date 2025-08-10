import Link from 'next/link';
import Image from 'next/image';
import { Course } from '@/lib/supabase/types';
import { SearchHighlight } from './SearchHighlight';
import { useAuth } from '@/lib/auth/AuthContext';

interface CourseGridViewProps {
  courses: Course[];
  searchQuery?: string;
  onCourseDeleted?: (id: string) => void;
}

export function CourseGridView({ courses, searchQuery = '', onCourseDeleted }: CourseGridViewProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-900 dark:text-white">No courses found</h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {searchQuery ? 
            `No results match your search for "${searchQuery}". Try different keywords.` : 
            'Try adjusting your search or filter criteria.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {courses.map((course, index) => (
        <CourseCard 
          key={course.id} 
          course={course} 
          searchQuery={searchQuery} 
          index={index}
          onDeleted={onCourseDeleted}
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
}

function CourseCard({ course, searchQuery = '', index, onDeleted }: CourseCardProps) {
  const { dbUser } = useAuth();

  const handleDelete = async () => {
    if (!confirm('Supprimer ce cours ? Cette action est irréversible.')) return;
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
      alert(error || 'Delete failed');
    }
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image avec overlay */}
      <div className="relative h-56 w-full overflow-hidden">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl text-gray-400 dark:text-gray-500">📚</span>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Aucune image</p>
            </div>
          </div>
        )}
        
        {/* Overlay au survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Badge de prix */}
        <div className="absolute top-4 right-4">
          {(dbUser) ? (
            <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              ${course.price.toFixed(2)}
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              Se connecter
            </div>
          )}
        </div>

        {/* Badge de niveau si disponible */}
        {course.niveau_difficulte && (
          <div className="absolute top-4 left-4">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">
              {course.niveau_difficulte}
            </div>
          </div>
        )}
      </div>

      {/* Contenu de la carte */}
      <div className="p-6">
        <Link href={`/courses/${course.id}`} className="block">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors duration-200 line-clamp-2">
            {searchQuery ? (
              <SearchHighlight text={course.title} query={searchQuery} />
            ) : (
              course.title
            )}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
            {searchQuery ? (
              <SearchHighlight text={course.description} query={searchQuery} />
            ) : (
              course.description
            )}
          </p>
        </Link>

        {/* Informations du créateur */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            {course.creator?.photo_url ? (
              <div className="relative">
                <Image 
                  src={course.creator.photo_url} 
                  alt={course.creator.name}
                  width={32}
                  height={32}
                  className="rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-700"></div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  {course.creator?.name?.[0]?.toUpperCase() || 'C'}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {course.creator?.name || 'Créateur'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Créateur
              </p>
              {course.creator?.bio && (
                <p className="text-xs text-gray-600 dark:text-gray-500 mt-1 line-clamp-1">
                  {course.creator.bio}
                </p>
              )}
            </div>
          </div>

          {/* Bouton d'action */}
          <div className="flex items-center space-x-2">
            {dbUser?.role === 'admin' && (
              <button
                onClick={handleDelete}
                title="Supprimer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all duration-200 transform hover:scale-110 group-hover:shadow-xl"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 012-2h2a2 2 0 012 2v2m-7 0h8" />
                </svg>
              </button>
            )}
            <Link
            href={`/courses/${course.id}`}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-lg hover:from-gray-700 hover:to-gray-900 transition-all duration-200 transform hover:scale-110 group-hover:shadow-xl"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            </Link>
          </div>
        </div>

        {/* Informations supplémentaires */}
        {course.duree_estimee && (
          <div className="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.duree_estimee}
          </div>
        )}

        {dbUser?.role === 'admin' && (
          <Link
            href={`/courses/${course.id}/edit`}
            className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gold-600 text-white font-semibold shadow hover:bg-gold-700 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M4 13.5V19h5.5l9.621-9.621a1.5 1.5 0 000-2.121l-3.379-3.379a1.5 1.5 0 00-2.121 0L4 13.5z" />
            </svg>
            Modifier
          </Link>
        )}
      </div>

      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
    </div>
  );
} 