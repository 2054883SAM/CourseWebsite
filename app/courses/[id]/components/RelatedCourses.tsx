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
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Plus de cours de ce créateur</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {relatedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            href={`/courses?creator=${creatorId}`}
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            Voir tous les cours de ce créateur
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
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
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
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <span className="text-sm text-gray-400">Aucune image</span>
          </div>
        )}

        {/* Price removed */}
      </div>

      <div className="p-3">
        <h3 className="mb-1 line-clamp-2 text-sm font-medium text-gray-800 group-hover:text-blue-600">
          {course.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{course.section_count || 0} sections</span>
          {course.teacher_name && <span>Professeur(e) {course.teacher_name}</span>}
        </div>
      </div>
    </Link>
  );
}
