import Image from 'next/image';
import { Course } from '@/lib/supabase/types';

interface CourseHeaderProps {
  course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-5">
        {/* Course Thumbnail */}
        <div className="lg:col-span-2 relative">
          <div className="relative h-48 lg:h-full w-full">
            {course.thumbnail_url ? (
              <Image
                src={course.thumbnail_url}
                alt={course.title}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Aucune image</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Course Info */}
        <div className="lg:col-span-3 p-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">
            {course.title}
          </h1>
          
          <p className="text-gray-600 mb-6 line-clamp-2">
            {course.description}
          </p>
          
          <div className="flex flex-wrap gap-4 items-center text-sm">
            {course.creator && (
              <div className="flex items-center">
                <span className="text-gray-600 mr-1">Créé par :</span>
                <div className="flex items-center">
                  {course.creator.photo_url ? (
                    <Image 
                      src={course.creator.photo_url} 
                      alt={course.creator.name}
                      width={24}
                      height={24}
                      className="rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center mr-2">
                      {course.creator.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium">{course.creator.name}</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center">
              <span className="text-gray-600 mr-1">Prix :</span>
              <span className="font-medium">${course.price.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-600 mr-1">Sections :</span>
              <span className="font-medium">{course.section_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 