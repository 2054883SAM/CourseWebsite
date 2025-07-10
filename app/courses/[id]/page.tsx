import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { Section } from '@/components/layout/Section';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CourseHeader } from './components/CourseHeader';
import { CourseOverview } from './components/CourseOverview';
import { CourseCurriculum } from './components/CourseCurriculum';
import { InstructorInfo } from './components/InstructorInfo';
import { RelatedCourses } from './components/RelatedCourses';
import { CourseDetailSkeleton } from './components/CourseDetailSkeleton';
import { getCourseById, getCourseSections, useMockData, mockData } from '@/lib/supabase';

interface CourseDetailPageProps {
  params: {
    id: string;
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  // Get course data from Supabase or mock data
  const course = useMockData()
    ? mockData.mockCourses.find(c => c.id === params.id)
    : await getCourseById(params.id);

  // Handle case where course is not found
  if (!course) {
    notFound();
  }

  // Get sections for this course
  const sections = useMockData()
    ? mockData.mockSections.filter(s => s.course_id === params.id)
    : await getCourseSections(params.id);

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <PageLayout>
      <Section className="bg-gray-50 pt-6 pb-12">
        <div className="container mx-auto px-4">
          <Breadcrumbs
            items={[
              { label: 'Courses', href: '/courses' },
              { label: course.title, href: `/courses/${course.id}` },
            ]}
          />
          
          <Suspense fallback={<CourseDetailSkeleton />}>
            {/* Course Header */}
            <CourseHeader course={course} />
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content - 2/3 width on large screens */}
              <div className="lg:col-span-2">
                {/* Course Overview */}
                <CourseOverview course={course} />
                
                {/* Course Curriculum */}
                <div className="mt-8">
                  <CourseCurriculum sections={sortedSections} />
                </div>
                
                {/* Instructor Info */}
                <div className="mt-8">
                  <InstructorInfo creator={course.creator} />
                </div>
              </div>
              
              {/* Sidebar - 1/3 width on large screens */}
              <div className="lg:col-span-1">
                {/* Course Action Card */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="text-2xl font-bold mb-4">${course.price.toFixed(2)}</div>
                  
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors mb-4">
                    Enroll Now
                  </button>
                  
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Sections:</span>
                      <span className="font-semibold">{sortedSections.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Duration:</span>
                      <span className="font-semibold">
                        {Math.round(
                          sortedSections.reduce(
                            (total, section) => total + (section.duration || 0), 
                            0
                          ) / 60
                        )} mins
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created by:</span>
                      <span className="font-semibold">{course.creator?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Related Courses */}
            <div className="mt-12">
              <RelatedCourses 
                courseId={course.id} 
                creatorId={course.creator_id} 
              />
            </div>
          </Suspense>
        </div>
      </Section>
    </PageLayout>
  );
} 