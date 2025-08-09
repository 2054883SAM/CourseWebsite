import Link from 'next/link';
import Image from 'next/image';
import { Course } from '@/lib/supabase/types';
import { SearchHighlight } from './SearchHighlight';
import { useAuth } from '@/lib/auth/AuthContext';

interface CourseListViewProps {
  courses: Course[];
  searchQuery?: string;
}

export function CourseListView({ courses, searchQuery = '' }: CourseListViewProps) {
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
    <div className="space-y-4">
      {courses.map((course) => (
        <CourseListItem key={course.id} course={course} searchQuery={searchQuery} />
      ))}
    </div>
  );
}

interface CourseListItemProps {
  course: Course;
  searchQuery?: string;
}

function CourseListItem({ course, searchQuery = '' }: CourseListItemProps) {
  const { user } = useAuth();

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
              <span className="text-gray-400 dark:text-gray-500">No image</span>
            </div>
          )}
          {user ? (
            <div className="absolute bottom-0 right-0 bg-gradient-to-r from-gray-600 to-gray-800 text-white px-2 py-1 text-sm font-semibold">
              ${course.price.toFixed(2)}
            </div>
          ) : (
            <div className="absolute bottom-0 right-0 bg-green-600 text-white px-2 py-1 text-sm font-semibold">
              Sign in to enroll
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 flex-1">
          <Link href={`/courses/${course.id}`} className="block">
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
          </Link>

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
              <span className="text-sm text-gray-700 dark:text-gray-300">{course.creator?.name || 'Unknown Creator'}</span>
            </div>

            {user && (
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

            {!user && (
              <button 
                onClick={() => window.location.href = '/signin'} 
                className="text-sm text-gold-600 hover:text-gold-800 dark:text-gold-400 dark:hover:text-gold-300 font-medium"
              >
                Sign in to see full details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 