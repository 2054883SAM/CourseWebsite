import Link from 'next/link';
import Image from 'next/image';
import { Course } from '@/lib/supabase/types';
import { SearchHighlight } from './SearchHighlight';

interface CourseGridViewProps {
  courses: Course[];
  searchQuery?: string;
}

export function CourseGridView({ courses, searchQuery = '' }: CourseGridViewProps) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} searchQuery={searchQuery} />
      ))}
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  searchQuery?: string;
}

function CourseCard({ course, searchQuery = '' }: CourseCardProps) {
  return (
    <div className="group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-transform hover:shadow-md hover:-translate-y-1">
      <Link href={`/courses/${course.id}`} className="block">
        <div className="relative h-48 w-full">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
          <div className="absolute bottom-0 right-0 bg-blue-600 text-white px-2 py-1 text-sm font-semibold">
            ${course.price.toFixed(2)}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-blue-600 line-clamp-2">
            {searchQuery ? (
              <SearchHighlight text={course.title} query={searchQuery} />
            ) : (
              course.title
            )}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {searchQuery ? (
              <SearchHighlight text={course.description} query={searchQuery} />
            ) : (
              course.description
            )}
          </p>
          
          <div className="flex items-center justify-between">
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
            
            <span className="text-sm text-gray-600">
              {course.section_count || 0} {course.section_count === 1 ? 'section' : 'sections'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
} 