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
      {/* Hero Section with Gradient Background */}
      <Section className="relative overflow-hidden bg-gradient-gray py-20 text-center md:py-32">
        {/* Background decoration */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 opacity-10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 opacity-10 blur-3xl"></div>
        
        <Container className="relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-gray-900 via-gold-600 to-gray-800 bg-clip-text text-transparent dark:from-white dark:via-gold-400 dark:to-gray-300">
              {user ? `Bon retour, ${dbUser?.name}!` : 'Bienvenue sur EzioAcademy'}
            </h1>
            <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
              Une plateforme d'apprentissage en ligne avec des cours vidéo interactifs et des matériaux d'apprentissage complets.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/courses"
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-gray-600 to-gray-800 px-8 text-base font-semibold text-white transition-all duration-300 hover:from-gray-700 hover:to-gray-900 hover:shadow-lg hover:shadow-gray-500/25 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
              >
                <span className="relative z-10">Catalogue des cours</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </Link>
              {!user ? (
                <Link
                  href="/signin"
                  className="inline-flex h-12 items-center justify-center rounded-full border-2 border-gray-300 px-8 text-base font-semibold text-gray-700 transition-all duration-300 hover:border-gold-500 hover:text-gold-600 hover:shadow-md dark:border-gray-600 dark:text-gray-300 dark:hover:border-gold-400 dark:hover:text-gold-400"
                >
                  Se connecter
                </Link>
              ) : null}
            </div>
          </div>
        </Container>
      </Section>

      {/* Featured Courses Section */}
      <Section className="py-16 bg-white dark:bg-gray-900">
        <Container>
          <div className="text-center mb-16">
            <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Cours en vedette</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Découvrez nos cours les plus populaires et commencez votre apprentissage dès aujourd'hui.
            </p>
          </div>

          <GridLayout columns={{ default: 1, sm: 2, lg: 3 }} className="mb-12 gap-8">
            {loading ? (
              // Enhanced loading placeholders with shimmer effect
              Array(3).fill(0).map((_, i) => (
                <div key={`loading-${i}`} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
                  <div className="mb-4 aspect-video rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse dark:from-gray-700 dark:to-gray-600"></div>
                  <div className="mb-3 h-6 w-3/4 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse dark:from-gray-700 dark:to-gray-600"></div>
                  <div className="mb-4 h-16 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse dark:from-gray-700 dark:to-gray-600"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-16 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse dark:from-gray-700 dark:to-gray-600"></div>
                    <div className="h-10 w-24 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse dark:from-gray-700 dark:to-gray-600"></div>
                  </div>
                </div>
              ))
            ) : (
              // Enhanced course cards
              featuredCourses.map((course: Course, index: number) => (
                <div 
                  key={course.id} 
                  className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:bg-gray-800"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4 aspect-video overflow-hidden rounded-xl">
                    {course.thumbnail_url ? (
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title} 
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                        <div className="text-4xl text-gray-400 dark:text-gray-500">📚</div>
                      </div>
                    )}
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-gray-600 dark:text-gray-300">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gold-600 dark:text-gold-400">
                      ${course.price.toFixed(2)}
                    </span>
                    <Link
                      href={`/courses/${course.id}`}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-gray-600 to-gray-800 px-6 text-sm font-semibold text-white transition-all duration-300 hover:from-gray-700 hover:to-gray-900 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2"
                    >
                      Voir le cours
                    </Link>
                  </div>
                </div>
              ))
            )}
          </GridLayout>

          <div className="text-center">
            <Link
              href="/courses"
              className="inline-flex h-12 items-center justify-center rounded-full border-2 border-gray-300 px-8 text-base font-semibold text-gray-700 transition-all duration-300 hover:border-gold-500 hover:text-gold-600 hover:shadow-md dark:border-gray-600 dark:text-gray-300 dark:hover:border-gold-400 dark:hover:text-gold-400"
            >
              Voir tous les cours
            </Link>
          </div>
        </Container>
      </Section>

      {/* Features Section with Icons */}
      <Section className="py-16 bg-gray-50 dark:bg-gray-800">
        <Container>
          <div className="text-center mb-16">
            <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Pourquoi choisir notre plateforme</h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
              Nous offrons la meilleure expérience d'apprentissage avec des fonctionnalités de pointe.
            </p>
          </div>

          <GridLayout columns={{ default: 1, sm: 2, lg: 3 }} gap="gap-8">
            {[
              {
                icon: '🎯',
                title: 'Contenu de haute qualité',
                description: 'Tous les cours sont créés par des experts du secteur et passent par des contrôles qualité rigoureux.',
              },
              {
                icon: '🔄',
                title: 'Apprentissage interactif',
                description: 'Participez à des exercices interactifs, des quiz et des projets pratiques.',
              },
              {
                icon: '⏰',
                title: 'Apprenez à votre rythme',
                description: 'Accédez aux matériaux de cours à tout moment, n\'importe où, et apprenez à votre propre rythme.',
              },
              {
                icon: '👥',
                title: 'Support communautaire',
                description: 'Rejoignez notre communauté d\'apprenants et obtenez de l\'aide quand vous en avez besoin.',
              },
              {
                icon: '🏆',
                title: 'Certificats',
                description: 'Obtenez des certificats à la fin pour mettre en valeur vos nouvelles compétences.',
              },
              {
                icon: '🛟',
                title: 'Support 24/7',
                description: 'Notre équipe de support est toujours prête à vous aider avec toutes vos questions.',
              },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 dark:bg-gray-700"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </GridLayout>
        </Container>
      </Section>

      {/* Call to Action Section */}
      <Section className="py-16 bg-gradient-to-r from-gray-600 to-gray-800 text-center text-white">
        <Container>
          <h2 className="mb-4 text-4xl font-bold">
            {user ? 'Continuez à apprendre' : 'Prêt à commencer à apprendre ?'}
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-200">
            {user
              ? 'Découvrez nos derniers cours et continuez votre parcours d\'apprentissage.'
              : 'Rejoignez des milliers d\'étudiants qui apprennent déjà sur notre plateforme.'}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {user ? (
              <Link
                href="/courses"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-600"
              >
                Catalogue des cours
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-gray-700 transition-all duration-300 hover:bg-gray-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-600"
                >
                  S'inscrire maintenant
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex h-12 items-center justify-center rounded-full border-2 border-white px-8 text-base font-semibold text-white transition-all duration-300 hover:bg-white hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-600"
                >
                  Catalogue des cours
                </Link>
              </>
            )}
          </div>
        </Container>
      </Section>
    </PageLayout>
  );
}

// Export the wrapped component - no auth required for home page
export default withAuth(Home, { requireAuth: false });
