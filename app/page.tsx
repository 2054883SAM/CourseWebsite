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
  const isStudent = dbUser?.role === 'student';

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
            sort_order: 'desc',
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
    <PageLayout maxWidth="full">
      {/* Hero Section with Blue Gradient Background */}
      <Section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 py-20 text-center dark:from-blue-900 dark:to-blue-800 md:py-32">
        {/* Background decoration */}
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-blue-300 to-blue-500 opacity-20 blur-3xl"></div>

        <Container maxWidth="2xl" className="relative z-10">
          <div className="animate-fade-in-up">
            <h1 className="mb-4 bg-gradient-to-r from-gray-900 via-blue-600 to-gray-800 bg-clip-text text-4xl font-bold text-gray-900 text-transparent dark:from-white dark:via-blue-400 dark:to-gray-300 dark:text-white md:text-5xl lg:text-6xl">
              {user ? `Bon retour, ${dbUser?.name}!` : 'Apprendre devient amusant!'}
            </h1>
            <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
              Une plateforme éducative conçue spécialement pour les élèves du primaire. Des cours
              créés par des enseignants passionnés pour rendre l'apprentissage captivant et
              accessible.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/courses"
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-8 text-base font-semibold text-white transition-all duration-300 hover:from-blue-700 hover:to-blue-900 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="relative z-10">Découvrir les cours</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </Link>
              {!user ? (
                <>
                  <Link
                    href="/payment"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-green-600 px-8 text-base font-semibold text-white transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:shadow-lg hover:shadow-green-500/25 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Abonnement mensuel
                  </Link>
                  <Link
                    href="/signin"
                    className="inline-flex h-12 items-center justify-center rounded-full border-2 border-blue-300 px-8 text-base font-semibold text-blue-700 transition-all duration-300 hover:border-blue-500 hover:text-blue-600 hover:shadow-md dark:border-blue-600 dark:text-blue-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
                  >
                    Se connecter
                  </Link>
                </>
              ) : (
                isStudent && (
                  <Link
                    href="/payment"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-green-600 px-8 text-base font-semibold text-white transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Mon abonnement
                  </Link>
                )
              )}
            </div>
          </div>
        </Container>
      </Section>

      {/* Featured Courses Section */}
      <Section className="bg-white py-16 dark:bg-gray-900">
        <Container maxWidth="7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              Cours populaires pour le primaire
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Découvrez nos cours les plus appréciés par les élèves et leurs parents. Apprentissage
              ludique garanti !
            </p>
          </div>

          <GridLayout columns={{ default: 1, sm: 2, lg: 3 }} className="mb-12 gap-8">
            {loading
              ? // Enhanced loading placeholders with shimmer effect
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={`loading-${i}`}
                      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800"
                    >
                      <div className="mb-4 aspect-video animate-pulse rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
                      <div className="mb-3 h-6 w-3/4 animate-pulse rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
                      <div className="mb-4 h-16 animate-pulse rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-6 w-16 animate-pulse rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
                        <div className="h-10 w-24 animate-pulse rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>
                      </div>
                    </div>
                  ))
              : // Enhanced course cards
                featuredCourses.map((course: Course, index: number) => (
                  <div
                    key={course.id}
                    className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800"
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
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700">
                          <div className="text-4xl text-blue-400 dark:text-blue-500">🎓</div>
                        </div>
                      )}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {course.title}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-gray-600 dark:text-gray-300">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between">
                      {/* Price removed from schema */}
                      <Link
                        href={`/courses/${course.id}`}
                        className="inline-flex h-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-800 px-6 text-sm font-semibold text-white transition-all duration-300 hover:from-blue-700 hover:to-blue-900 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Découvrir
                      </Link>
                    </div>
                  </div>
                ))}
          </GridLayout>

          <div className="text-center">
            <Link
              href="/courses"
              className="inline-flex h-12 items-center justify-center rounded-full border-2 border-blue-300 px-8 text-base font-semibold text-blue-700 transition-all duration-300 hover:border-blue-500 hover:text-blue-600 hover:shadow-md dark:border-blue-600 dark:text-blue-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
            >
              Voir tous les cours
            </Link>
          </div>
        </Container>
      </Section>

      {/* Features Section with Icons */}
      <Section className="bg-blue-50 py-16 dark:bg-blue-900">
        <Container maxWidth="7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              Pourquoi les enfants adorent apprendre ici
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
              Une approche pédagogique innovante qui transforme l'apprentissage en aventure
              passionnante pour vos enfants.
            </p>
          </div>

          <GridLayout columns={{ default: 1, sm: 2, lg: 3 }} gap="gap-8">
            {[
              {
                icon: '🎨',
                title: 'Cours ludiques et colorés',
                description:
                  'Des contenus visuels captivants et des activités amusantes créés spécialement pour les enfants du primaire.',
              },
              {
                icon: '🧩',
                title: 'Apprentissage par le jeu',
                description:
                  "Transformez l'éducation en aventure avec des quiz interactifs, des défis et des récompenses.",
              },
              {
                icon: '👩‍🏫',
                title: 'Enseignants certifiés',
                description:
                  'Tous nos cours sont créés par des enseignants expérimentés du primaire et validés pédagogiquement.',
              },
              {
                icon: '📱',
                title: 'Accessible partout',
                description:
                  'Votre enfant peut apprendre sur tablette, ordinateur ou smartphone, à la maison ou en déplacement.',
              },
              {
                icon: '⭐',
                title: 'Suivi des progrès',
                description:
                  'Les parents peuvent suivre les progrès de leur enfant et célébrer ses réussites ensemble.',
              },
              {
                icon: '💰',
                title: 'Revenus pour enseignants',
                description:
                  'Plateforme permettant aux enseignants de valoriser leur expertise et générer des revenus complémentaires.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-700"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </GridLayout>
        </Container>
      </Section>

      {/* Teacher Section */}
      <Section className="bg-gradient-to-r from-blue-100 to-indigo-200 py-16 dark:from-blue-800 dark:to-indigo-800">
        <Container maxWidth="7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              Enseignants : Partagez votre passion et générez des revenus
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
              Transformez votre expertise pédagogique en une source de revenus complémentaires tout
              en aidant des milliers d'enfants à apprendre.
            </p>
          </div>

          <GridLayout columns={{ default: 1, lg: 2 }} gap="gap-12" className="items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
                  <span className="text-xl text-white">💡</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    Créez vos cours en ligne
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Utilisez vos méthodes pédagogiques éprouvées pour créer des cours vidéo
                    engageants.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                  <span className="text-xl text-white">💰</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    Générez des revenus passifs
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Recevez une commission sur chaque inscription à vos cours, créant un revenu
                    durable.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-500">
                  <span className="text-xl text-white">🌟</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                    Valorisez votre expertise
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Construisez votre réputation et montrez vos compétences pédagogiques à un large
                    public.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
                <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  Rejoignez notre équipe d'enseignants
                </h3>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                  Nous recherchons des enseignants passionnés pour enrichir notre catalogue de
                  cours. Bénéficiez d'un support technique complet et d'une plateforme optimisée
                  pour l'enseignement.
                </p>
                <div className="space-y-3">
                  <Link
                    href="/signup"
                    className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-8 text-base font-semibold text-white transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Devenir enseignant partenaire
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Inscription gratuite • Support dédié • Commission attractive
                  </p>
                </div>
              </div>
            </div>
          </GridLayout>
        </Container>
      </Section>

      {/* Call to Action Section */}
      <Section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16 text-center text-white">
        <Container maxWidth="2xl">
          <h2 className="mb-4 text-4xl font-bold">
            {user
              ? "Continuez l'aventure d'apprentissage"
              : "Offrez à votre enfant le meilleur de l'éducation"}
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-blue-100">
            {user
              ? 'Découvrez nos nouveaux cours et continuez à grandir avec nous.'
              : 'Rejoignez des milliers de familles qui font confiance à notre plateforme éducative. Apprentissage garanti !'}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {user ? (
              <>
                <Link
                  href="/courses"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-blue-700 transition-all duration-300 hover:bg-blue-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                >
                  Découvrir les cours
                </Link>
                {isStudent && (
                  <Link
                    href="/payment"
                    className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-green-600 px-8 text-base font-semibold text-white transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Mon abonnement
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/payment"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-green-600 px-8 text-base font-semibold text-white transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  🚀 Commencer l'abonnement
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-full border-2 border-white px-8 text-base font-semibold text-white transition-all duration-300 hover:bg-white hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                >
                  Créer un compte gratuit
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
