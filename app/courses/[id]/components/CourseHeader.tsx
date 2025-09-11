import Image from 'next/image';
import { Course } from '@/lib/supabase/types';

interface CourseHeaderProps {
  course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-100 shadow-lg border-2 border-sky-200 mb-8">
      {/* Bannière colorée avec illustrations éducatives */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 via-blue-400/10 to-indigo-400/10"></div>
      <div className="absolute top-4 right-4 text-4xl opacity-20">📚✨</div>
      <div className="absolute bottom-4 left-4 text-3xl opacity-20">🎓🌟</div>
      <div className="absolute top-1/2 left-1/4 text-2xl opacity-15">📐</div>
      <div className="absolute top-1/4 right-1/3 text-2xl opacity-15">🔢</div>
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-6 p-8">
        {/* Course Thumbnail */}
        <div className="lg:col-span-2 relative">
          <div className="relative h-56 lg:h-full w-full rounded-xl overflow-hidden shadow-md">
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
              <div className="w-full h-full bg-gradient-to-br from-sky-200 to-blue-300 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">📖</div>
                  <span className="text-blue-800 font-medium">Cours éducatif</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Course Info */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎯</span>
              <span className="bg-sky-200 text-sky-800 px-3 py-1 rounded-full text-sm font-medium">
                Cours primaire
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-sky-700 mb-4 leading-tight">
              {course.title}
            </h1>
          </div>
          
          <p className="text-gray-700 text-lg leading-relaxed">
            {course.description}
          </p>
          
          <div className="flex flex-wrap gap-6 items-center">
            {course.creator && (
              <div className="flex items-center bg-white/60 rounded-full px-4 py-2 shadow-sm">
                <span className="text-xl mr-2">👨‍🏫</span>
                <div className="flex items-center">
                  {course.creator.photo_url ? (
                    <Image 
                      src={course.creator.photo_url} 
                      alt={course.creator.name}
                      width={32}
                      height={32}
                      className="rounded-full mr-3 border-2 border-white"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-sky-200 text-sky-800 rounded-full flex items-center justify-center mr-3 border-2 border-white">
                      {course.creator.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-600">Enseignant</div>
                    <div className="font-semibold text-gray-800">{course.creator.name}</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center bg-white/60 rounded-full px-4 py-2 shadow-sm">
              <span className="text-xl mr-2">📝</span>
              <div>
                <div className="text-sm text-gray-600">Sections</div>
                <div className="font-semibold text-gray-800">{course.section_count || 0} leçons</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 