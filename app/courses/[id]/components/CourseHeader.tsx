import Image from 'next/image';
import { Course } from '@/lib/supabase/types';

interface CourseHeaderProps {
  course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border-2 border-sky-200 bg-gradient-to-r from-sky-100 via-blue-50 to-indigo-100 shadow-lg">
      {/* Bannière colorée avec illustrations éducatives */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 via-blue-400/10 to-indigo-400/10"></div>
      <div className="absolute right-4 top-4 text-4xl opacity-20">📚✨</div>
      <div className="absolute bottom-4 left-4 text-3xl opacity-20">🎓🌟</div>
      <div className="absolute left-1/4 top-1/2 text-2xl opacity-15">📐</div>
      <div className="absolute right-1/3 top-1/4 text-2xl opacity-15">🔢</div>

      <div className="relative z-10 grid grid-cols-1 gap-6 p-8 lg:grid-cols-5">
        {/* Course Thumbnail */}
        <div className="relative lg:col-span-2">
          <div className="relative h-56 w-full overflow-hidden rounded-xl shadow-md lg:h-full">
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
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-200 to-blue-300">
                <div className="text-center">
                  <div className="mb-2 text-6xl">📖</div>
                  <span className="font-medium text-blue-800">Cours éducatif</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Course Info */}
        <div className="space-y-6 lg:col-span-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="rounded-full bg-sky-200 px-3 py-1 text-sm font-medium text-sky-800">
                Cours primaire
              </span>
            </div>
            <h1 className="mb-4 text-3xl font-bold leading-tight text-sky-700 md:text-4xl lg:text-5xl">
              {course.title}
            </h1>
          </div>

          <p className="text-lg leading-relaxed text-gray-700">{course.description}</p>

          <div className="flex flex-wrap items-center gap-6">
            {course.teacher_name && (
              <div className="flex items-center rounded-full bg-white/60 px-4 py-2 shadow-sm">
                <span className="mr-2 text-xl">👨‍🏫</span>
                <div className="flex items-center">
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-amber-100 to-amber-200">
                    <span className="text-sm">👨‍🏫</span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Professeur(e)</div>
                    <div className="font-semibold text-gray-800">{course.teacher_name}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
