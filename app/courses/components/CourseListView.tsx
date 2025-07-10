import Link from 'next/link';
import Image from 'next/image';
import { Course } from '@/lib/supabase/types';
import { SearchHighlight } from './SearchHighlight';

interface CourseListViewProps {
  courses: Course[];
  searchQuery?: string;
}

export function CourseListView({ courses, searchQuery = '' }: CourseListViewProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-900">No courses found</h3>
        <p className="mt-2 text-gray-600">
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
  return (
    <Link
      href={`/courses/${course.id}`}
      className="flex flex-col sm:flex-row bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Course thumbnail */}
      <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Course details */}
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-blue-600">
              {searchQuery ? (
                <SearchHighlight text={course.title} query={searchQuery} />
              ) : (
                course.title
              )}
            </h3>
            <div className="bg-blue-600 text-white px-2 py-1 text-sm font-semibold rounded-md">
              ${course.price.toFixed(2)}
            </div>
          </div>

          <p className="text-gray-600 mb-4">
            {searchQuery ? (
              <SearchHighlight text={course.description} query={searchQuery} />
            ) : (
              course.description
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          {/* Creator info */}
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
              <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-2">
                {course.creator?.name.charAt(0) || 'U'}
              </div>
            )}
            <span className="text-sm text-gray-700">{course.creator?.name || 'Unknown Creator'}</span>
          </div>

          {/* Course stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center text-gray-600">
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
          </div>
        </div>
      </div>
    </Link>
  );
} 