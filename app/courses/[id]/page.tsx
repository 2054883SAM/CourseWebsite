'use client';

import { Suspense, useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { Section } from '@/components/layout/Section';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CourseHeader } from './components/CourseHeader';
import { CourseOverview } from './components/CourseOverview';
import { InstructorInfo } from './components/InstructorInfo';
import { RelatedCourses } from './components/RelatedCourses';
import { CourseDetailSkeleton } from './components/CourseDetailSkeleton';
import { CourseActions } from './components/CourseActions';
import { getCourseById, getCourses, shouldUseMockData, mockData } from '@/lib/supabase';
import { withAuth } from '@/components/auth/withAuth';
import { useNavigation } from '@/lib/navigation/NavigationContext';
import { Course } from '@/lib/supabase/types';
import { useAuth } from '@/lib/auth/AuthContext';
import { checkEnrollmentStatus } from '@/lib/supabase/enrollments';

type PageParams = {
  id: string;
};

type PageProps = {
  params: Promise<PageParams>;
};

function CourseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, dbUser } = useAuth();
  const { isNavigating } = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(false);

  // Add requireAuth constant since we know this page doesn't require auth
  const requireAuth = false;

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      // Admins have access to all courses without enrollment
      if (dbUser?.role === 'admin') {
        setIsEnrolled(true);
        setIsCheckingEnrollment(false);
        return;
      }

      if (!user?.id || !id) {
        setIsEnrolled(false);
        setIsCheckingEnrollment(false);
        return;
      }

      try {
        setIsCheckingEnrollment(true);
        const { isEnrolled } = await checkEnrollmentStatus(user.id, id);
        setIsEnrolled(isEnrolled);
      } catch (error) {
        console.error('Error checking enrollment:', error);
        setIsEnrolled(false);
      } finally {
        setIsCheckingEnrollment(false);
      }
    };

    checkEnrollment();
  }, [user, id, dbUser]);

  // Memoize the fetch function to prevent unnecessary recreations
  const fetchData = useCallback(async (mounted: boolean) => {
    if (!mounted) return;

    try {
      // Get course data
      const courseData = shouldUseMockData()
        ? mockData.mockCourses.find(c => c.id === id)
        : await getCourseById(id);

      if (!courseData) {
        if (mounted) {
          router.push('/404');
        }
        return;
      }

      if (!mounted) return;
      setCourse(courseData);

      // Get related courses
      const relatedCoursesData = shouldUseMockData()
        ? mockData.mockCourses
            .filter(c => c.creator_id === courseData.creator_id && c.id !== id)
            .slice(0, 4)
        : await getCourses({
            creator_id: courseData.creator_id,
            limit: 5,
          }).then(courses => courses.filter(c => c.id !== id).slice(0, 4));

      if (!mounted) return;
      setRelatedCourses(relatedCoursesData);
      setError(null);
      setLastFetchTime(Date.now());
    } catch (err) {
      console.error('Error fetching course data:', err);
      if (!mounted) return;

      setError('Échec du chargement du cours. Veuillez réessayer.');
      setCourse(null);
      setRelatedCourses([]);
    } finally {
      if (mounted) setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    let mounted = true;

    // Function to check if we should fetch based on time elapsed
    const shouldRefetch = () => {
      const timeSinceLastFetch = Date.now() - lastFetchTime;
      // Only refetch if it's been more than 5 minutes or there was an error
      return timeSinceLastFetch > 5 * 60 * 1000 || error !== null;
    };

    // Function to handle visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden && shouldRefetch()) {
        setLoading(true);
        fetchData(true);
      }
    };

    // Initial fetch
    fetchData(mounted);

    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData, lastFetchTime, error]);

  if (loading && !isNavigating) {
    return <CourseDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen w-full background-beige relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-red-400/20 to-red-600/15 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-amber-400/18 to-amber-600/12 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        
        <div className="w-full py-8 sm:py-12 relative z-10">
          <div className="container mx-auto px-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-400/20 via-amber-400/20 to-blue-400/20 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/80 backdrop-blur-xl border-2 border-red-200/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl">⚠️</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent mb-3 sm:mb-4">Erreur de chargement</h2>
                <p className="text-red-600 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
                <button 
                  onClick={() => {
                    setLoading(true);
                    fetchData(true);
                  }}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm sm:text-base"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return null; // Router will handle the redirect
  }

  return (
    <div className="min-h-screen w-full background-beige relative overflow-hidden">
      {/* Background Elements - Unique to Course Detail Page */}
      {/* Floating Learning Icons */}
      <div className="absolute top-20 left-8 w-16 h-16 bg-gradient-to-br from-blue-400/25 to-blue-600/20 rounded-full animate-float flex items-center justify-center text-2xl z-50">
        📚
      </div>
      <div className="absolute right-12 w-12 h-12 bg-gradient-to-br from-green-400/25 to-green-600/20 rounded-full animate-float flex items-center justify-center text-xl z-50" style={{ top: '40rem', animationDelay: '2s' }}>
        🎯
      </div>
      <div className="absolute left-1/4 w-14 h-14 bg-gradient-to-br from-purple-400/25 to-purple-600/20 rounded-full animate-float flex items-center justify-center text-xl z-50" style={{ top: '83rem', animationDelay: '4s' }}>
        💡
      </div>
      <div className="absolute right-1/3 w-10 h-10 bg-gradient-to-br from-amber-400/25 to-amber-600/20 rounded-full animate-float flex items-center justify-center text-lg z-50" style={{ top: '117rem',animationDelay: '1s' }}>
        ⭐
      </div>
      
      {/* Geometric Learning Shapes */}
      <div className="absolute top-80 w-8 h-8 bg-gradient-to-br from-blue-300/30 to-blue-500/25 transform rotate-45 animate-spin z-50" style={{ right: '10rem', animationDuration: '20s' }}></div>
      <div className="absolute left-16 w-6 h-6 bg-gradient-to-br from-green-300/30 to-green-500/25 rounded-full animate-pulse z-50" style={{ top: '80rem', animationDelay: '3s' }}></div>
      <div className="absolute w-4 h-4 bg-gradient-to-br from-purple-300/30 to-purple-500/25 transform rotate-12 animate-bounce z-50" style={{ top: '90rem', right: '22rem', animationDelay: '2.5s' }}></div>
      
      {/* Bottom Learning Elements */}
      <div className="absolute left-12 w-12 h-12 bg-gradient-to-br from-amber-400/25 to-amber-600/20 rounded-full animate-float flex items-center justify-center text-xl z-50" style={{ top: '175rem', animationDelay: '3.5s' }}>
        🚀
      </div>
      <div className="absolute bottom-48 right-16 w-10 h-10 bg-gradient-to-br from-blue-400/25 to-blue-600/20 rounded-full animate-float flex items-center justify-center text-lg z-50" style={{ animationDelay: '1.5s' }}>
        🎓
      </div>
      <div className="absolute left-1/3 w-8 h-8 bg-gradient-to-br from-green-300/30 to-green-500/25 transform rotate-45 animate-pulse z-50" style={{ bottom: '35rem',animationDelay: '4.5s' }}></div>
      
      {/* Subtle Learning Pattern */}
      <div className="absolute inset-0 opacity-5 z-40">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-blue-300 rounded-full"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 border border-green-300 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 w-16 h-16 border border-amber-300 rounded-full"></div>
      </div>
      
      <div className="w-full pt-6 pb-16 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-6">
            <Breadcrumbs
              items={[
                { label: 'Cours', href: '/courses' },
                { label: course.title, href: `/courses/${course.id}` },
              ]}
            />
          </div>
          
          <Suspense fallback={<CourseDetailSkeleton />}>
            {/* Course Header */}
            <CourseHeader course={course} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 lg:items-start">
              {/* Main Content - 2/3 width on large screens */}
              <div className="lg:col-span-2 space-y-12">
                {/* Course Overview */}
                <div className="relative">
                  <div className="absolute rounded-3xl"></div>
                  <div className="relative bg-white border-2 border-blue-200/50 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                    <CourseOverview course={course} />
                  </div>
                </div>
                
                {/* Instructor Info - visible on small screens only */}
                <div className="relative lg:hidden">
                  <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/20 via-blue-400/20 to-green-400/20 rounded-3xl blur-xl"></div>
                  <div className="relative bg-white/80 backdrop-blur-xl border-2 border-amber-200/50 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                    <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-xl sm:text-2xl lg:text-3xl">👨‍🏫</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent">Ton enseignant</h3>
                    </div>
                    <InstructorInfo creator={course.creator} />
                    
                    {/* Section Qualités - visible on small screens only */}
                    <div className="mt-4 sm:mt-6">
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {/* Expertise */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-2 sm:p-3 border border-blue-200/50">
                          <div className="text-center">
                            <div className="text-sm sm:text-lg mb-1">🎓</div>
                            <div className="text-xs font-bold text-blue-700">Expert</div>
                            <div className="text-xs text-blue-600">certifié</div>
                          </div>
                        </div>
                        
                        {/* Pédagogie */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-2 sm:p-3 border border-green-200/50">
                          <div className="text-center">
                            <div className="text-sm sm:text-lg mb-1">🧠</div>
                            <div className="text-xs font-bold text-green-700">Pédagogie</div>
                            <div className="text-xs text-green-600">adaptée</div>
                          </div>
                        </div>
                        
                        {/* Innovation */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-2 sm:p-3 border border-purple-200/50">
                          <div className="text-center">
                            <div className="text-sm sm:text-lg mb-1">🚀</div>
                            <div className="text-xs font-bold text-purple-700">Contenu</div>
                            <div className="text-xs text-purple-600">innovant</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sidebar - 1/3 width on large screens */}
              <div className="lg:col-span-1 order-first lg:order-last lg:flex lg:flex-col lg:h-full">
                <div className="relative lg:flex-shrink-0">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 via-amber-400/20 to-green-400/20 rounded-3xl blur-xl"></div>
                  <div className="relative bg-white/80 backdrop-blur-xl border-2 border-blue-200/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
                    <CourseActions 
                      course={course} 
                      initialEnrollmentStatus={dbUser?.role === 'admin' ? 'enrolled' : (isCheckingEnrollment ? 'processing' : (isEnrolled ? 'enrolled' : 'not-enrolled'))} 
                    />
                  </div>
                </div>
                
                {/* Instructor Info - visible on large screens only */}
                <div className="relative hidden lg:block lg:flex-1 mt-5">
                  <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/20 via-blue-400/20 to-green-400/20 rounded-3xl blur-xl"></div>
                  <div className="relative bg-white/80 backdrop-blur-xl border-2 border-amber-200/50 rounded-3xl p-6 lg:p-8 shadow-2xl h-full">
                    <div className="flex items-center gap-3 lg:gap-4 lg:mb-4">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl lg:text-3xl">👨‍🏫</span>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent">Ton enseignant</h3>
                    </div>
                    <InstructorInfo creator={course.creator} />
                    
                    {/* Section Confiance - visible on large screens only */}
                    <div className="mt-5">
                      <div className="space-y-4">
                        {/* Expertise */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm lg:text-base font-bold text-blue-700">Expert certifié</div>
                              <div className="text-xs lg:text-sm text-blue-600 font-medium">Maîtrise approfondie</div>
                            </div>
                            <div className="text-2xl">🎓</div>
                          </div>
                        </div>
                        
                        {/* Pédagogie */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm lg:text-base font-bold text-green-700">Pédagogie adaptée</div>
                              <div className="text-xs lg:text-sm text-green-600 font-medium">Méthodes efficaces</div>
                            </div>
                            <div className="text-2xl">🧠</div>
                          </div>
                        </div>
                        
                        {/* Innovation */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm lg:text-base font-bold text-purple-700">Contenu innovant</div>
                              <div className="text-xs lg:text-sm text-purple-600 font-medium">Méthodes modernes</div>
                            </div>
                            <div className="text-2xl">🚀</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Related Courses */}
            <div className="mt-12 sm:mt-16">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-amber-400/20 rounded-3xl blur-xl"></div>
                <div className="relative bg-white/80 backdrop-blur-xl border-2 border-green-200/50 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-xl sm:text-2xl lg:text-3xl">🎪</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 via-green-700 to-green-800 bg-clip-text text-transparent">Autres cours qui pourraient te plaire</h3>
                  </div>
                  <RelatedCourses 
                    courseId={course.id} 
                    creatorId={course.creator_id}
                    relatedCourses={relatedCourses}
                  />
                </div>
              </div>
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Export the wrapped component with authentication required for enrolled courses
export default withAuth(CourseDetailPage, { requireAuth: false }); 