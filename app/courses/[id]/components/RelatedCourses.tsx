import Link from 'next/link';
import Image from 'next/image';
import { Course } from '@/lib/supabase/types';

interface RelatedCoursesProps {
  courseId: string;
  creatorId: string;
  relatedCourses: Course[];
}

export function RelatedCourses({ courseId, creatorId, relatedCourses }: RelatedCoursesProps) {
  if (relatedCourses.length === 0) {
    return null; // Don't show the section if there are no related courses
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">More Courses by This Creator</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedCourses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <Link 
            href={`/courses?creator=${creatorId}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Courses by This Creator
          </Link>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="group block bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative h-32 w-full">
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
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        
        <div className="absolute bottom-0 right-0 bg-blue-600 text-white px-2 py-1 text-xs font-semibold">
          ${course.price.toFixed(2)}
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600">
          {course.title}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{course.section_count || 0} sections</span>
          {course.creator && <span>{course.creator.name}</span>}
        </div>
      </div>
    </Link>
  );
} 