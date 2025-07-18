'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageLayout, Section, Container, GridLayout, ContentBlock } from '../components/layout';
import { withAuth } from '@/components/auth/withAuth';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCourses, shouldUseMockData, mockData } from '@/lib/supabase';
import { Course } from '@/lib/supabase/types';

function Home() {
  const { user, dbUser } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch featured courses on component mount
  useEffect(() => {
    async function fetchFeaturedCourses() {
      try {
        if (shouldUseMockData()) {
          // Use first 3 mock courses
          setFeaturedCourses(mockData.mockCourses.slice(0, 3));
        } else {
          // Fetch real courses - limited to 3 for featured section
          const courses = await getCourses({
            limit: 3,
            sort_by: 'created_at',
            sort_order: 'desc'
          });
          setFeaturedCourses(courses);
        }
      } catch (error) {
        console.error('Error fetching featured courses:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedCourses();
  }, []);

  return (
    <PageLayout>
      {/* Hero Section */}
      <Section className="py-16 text-center md:py-24">
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          {user ? `Welcome back, ${dbUser?.name}!` : 'Welcome to Course Website'}
        </h1>
        <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-400">
          An online learning platform with interactive video courses and comprehensive learning
          materials.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/courses"
            className="ring-offset-background inline-flex h-11 items-center justify-center rounded-md bg-primary-600 px-6 text-base font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Browse Courses
          </Link>
          {!user ? (
            <Link
              href="/signin"
              className="ring-offset-background inline-flex h-11 items-center justify-center rounded-md border border-gray-200 px-6 text-base font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:hover:bg-gray-800"
            >
              Sign In
            </Link>
          ) : null}
        </div>
      </Section>

      {/* Featured Courses Section */}
      <Section>
        <h2 className="mb-12 text-center text-3xl font-bold">Featured Courses</h2>

        <GridLayout columns={{ default: 1, sm: 2, lg: 3 }} className="mb-12">
          {loading ? (
            // Loading placeholders
            Array(3).fill(0).map((_, i) => (
              <ContentBlock key={`loading-${i}`} variant="card" className="p-6">
                <div className="mb-4 aspect-video rounded-md bg-gray-200 dark:bg-gray-700"></div>
                <div className="mb-2 h-6 w-3/4 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                <div className="mb-4 h-16 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex items-center justify-between">
                  <div className="h-6 w-16 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-9 w-24 rounded-md bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </ContentBlock>
            ))
          ) : (
            // Actual courses
            featuredCourses.map((course) => (
              <ContentBlock key={course.id} variant="card" className="p-6">
                <div className="mb-4 aspect-video rounded-md bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  {course.thumbnail_url && (
                    <img 
                      src={course.thumbnail_url} 
                      alt={course.title} 
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <h3 className="mb-2 text-xl font-bold">{course.title}</h3>
                <p className="mb-4 line-clamp-2 text-gray-600 dark:text-gray-400">
                  {course.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary-600 dark:text-primary-400">
                    ${course.price.toFixed(2)}
                  </span>
                  <Link
                    href={`/courses/${course.id}`}
                    className="ring-offset-background inline-flex h-9 items-center justify-center rounded-md bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  >
                    View Course
                  </Link>
                </div>
              </ContentBlock>
            ))
          )}
        </GridLayout>

        <div className="text-center">
          <Link
            href="/courses"
            className="ring-offset-background inline-flex h-11 items-center justify-center rounded-md border border-gray-200 px-6 text-base font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:hover:bg-gray-800"
          >
            View All Courses
          </Link>
        </div>
      </Section>

      {/* Features Section */}
      <Section>
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Why Choose Our Platform</h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-400">
            We provide the best learning experience with cutting-edge features.
          </p>
        </div>

        <GridLayout columns={{ default: 1, sm: 2, lg: 3 }} gap="gap-8">
          {[
            {
              title: 'High-Quality Content',
              description:
                'All courses are created by industry experts and undergo rigorous quality checks.',
            },
            {
              title: 'Interactive Learning',
              description: 'Engage with interactive exercises, quizzes, and hands-on projects.',
            },
            {
              title: 'Learn at Your Pace',
              description: 'Access course materials anytime, anywhere, and learn at your own pace.',
            },
            {
              title: 'Community Support',
              description: 'Join our community of learners and get help when you need it.',
            },
            {
              title: 'Certificates',
              description: 'Earn certificates upon completion to showcase your new skills.',
            },
            {
              title: '24/7 Support',
              description: 'Our support team is always ready to help you with any questions.',
            },
          ].map((feature, i) => (
            <ContentBlock key={i} variant="card" className="p-6">
              <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </ContentBlock>
          ))}
        </GridLayout>
      </Section>

      {/* Call to Action Section */}
      <Section className="text-center">
        <h2 className="mb-4 text-3xl font-bold">
          {user ? 'Continue Learning' : 'Ready to Start Learning?'}
        </h2>
        <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-400">
          {user
            ? 'Check out our latest courses and continue your learning journey.'
            : 'Join thousands of students already learning on our platform.'}
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          {user ? (
            <Link
              href="/courses"
              className="ring-offset-background inline-flex h-11 items-center justify-center rounded-md bg-primary-600 px-6 text-base font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Browse Courses
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="ring-offset-background inline-flex h-11 items-center justify-center rounded-md bg-primary-600 px-6 text-base font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Sign Up Now
              </Link>
              <Link
                href="/courses"
                className="ring-offset-background inline-flex h-11 items-center justify-center rounded-md border border-gray-200 px-6 text-base font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:hover:bg-gray-800"
              >
                Browse Courses
              </Link>
            </>
          )}
        </div>
      </Section>
    </PageLayout>
  );
}

// Export the wrapped component - no auth required for home page
export default withAuth(Home, { requireAuth: false });
