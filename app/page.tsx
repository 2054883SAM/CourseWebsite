'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageLayout, Section, Container, GridLayout, ContentBlock } from '../components/layout';
import { withAuth } from '@/components/auth/withAuth';
import { useAuth } from '@/lib/auth/AuthContext';
import { getCourses, shouldUseMockData, mockData } from '@/lib/supabase';
import { Course } from '@/lib/supabase/types';

import { StudentLayout } from '@/components/layout/StudentLayout';
import { useRouter } from 'next/navigation';

function Home() {
  const { user, dbUser } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const isStudent = dbUser?.role === 'student';
  const isAdmin = dbUser?.role === 'admin';
  const router = useRouter();

  // Redirect users based on role
  useEffect(() => {
    if (isStudent) {
      router.push('/learning?page=dashboard');
    } else if (isAdmin) {
      router.push('/dashboard?page=dashboard');
    }
  }, [isStudent, isAdmin, router]);

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

  // Show loading while redirecting users
  if (isStudent || isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Bannière d'accueil */}
      <section className="bg-white py-20">
        <Container maxWidth="2xl">
          <div className="text-center">
            <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl lg:text-7xl">
              {user ? `Bon retour, ${dbUser?.name}!` : 'Apprendre devient'}
              <span className="block text-[#1D4ED8]">facile et amusant</span>
            </h1>
            <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-600">
              Une plateforme éducative conçue spécialement pour les élèves du primaire. Des cours
              créés par des enseignants passionnés pour rendre l&apos;apprentissage captivant et
              accessible à tous les enfants.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#1D4ED8] px-10 text-lg font-semibold text-white transition-all duration-300 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                🚀 Découvrir les cours
              </Link>
              {!user ? (
                <>
                  <Link
                    href="/payment"
                    className="inline-flex h-14 items-center justify-center rounded-full bg-green-500 px-10 text-lg font-semibold text-white transition-all duration-300 hover:bg-green-600 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-200"
                  >
                    👨‍👩‍👧‍👦 S&apos;abonner
                  </Link>
                  <Link
                    href="/signin"
                    className="inline-flex h-14 items-center justify-center rounded-full border-2 border-[#1D4ED8] px-10 text-lg font-semibold text-[#1D4ED8] transition-all duration-300 hover:bg-[#1D4ED8] hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-200"
                  >
                    🔐 Se connecter
                  </Link>
                </>
              ) : (
                isStudent && (
                  <Link
                    href="/payment"
                    className="inline-flex h-14 items-center justify-center rounded-full bg-green-500 px-10 text-lg font-semibold text-white transition-all duration-300 hover:bg-green-600 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-green-200"
                  >
                    👨‍👩‍👧‍👦 Mon abonnement
                  </Link>
                )
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Section Cours */}
      <section className="bg-white py-20">
        <Container maxWidth="7xl">
          <div className="mb-16 text-center">
            <div className="mb-4 flex items-center justify-center">
              <span className="mr-3 text-4xl">📘</span>
              <h2 className="text-4xl font-bold text-gray-900">Nos cours populaires</h2>
            </div>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Découvrez nos cours les plus appréciés par les élèves et leurs parents. Apprentissage
              ludique et efficace garanti !
            </p>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? // Loading placeholders
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={`loading-${i}`}
                      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <div className="mb-4 aspect-video animate-pulse rounded-lg bg-gray-200"></div>
                      <div className="mb-3 h-6 w-3/4 animate-pulse rounded bg-gray-200"></div>
                      <div className="mb-4 h-16 animate-pulse rounded bg-gray-200"></div>
                      <div className="h-10 w-24 animate-pulse rounded-full bg-gray-200"></div>
                    </div>
                  ))
              : // Course cards
                featuredCourses.map((course: Course) => (
                  <div
                    key={course.id}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-gray-100">
                      {course.thumbnail_url ? (
                        /* Replaced img with div for now - consider using next/image in future */
                        <div
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${course.thumbnail_url})` }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-4xl">📚</span>
                        </div>
                      )}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-gray-900">{course.title}</h3>
                    <p className="mb-4 line-clamp-2 text-gray-600">{course.description}</p>
                    <Link
                      href={`/courses/${course.id}`}
                      className="inline-flex h-10 items-center justify-center rounded-full bg-[#1D4ED8] px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                      Découvrir
                    </Link>
                  </div>
                ))}
          </div>

          <div className="text-center">
            <Link
              href="/courses"
              className="inline-flex h-12 items-center justify-center rounded-full border-2 border-[#1D4ED8] px-8 text-base font-semibold text-[#1D4ED8] transition-all duration-300 hover:bg-[#1D4ED8] hover:text-white"
            >
              📚 Voir tous les cours
            </Link>
          </div>
        </Container>
      </section>

      {/* Section Fonctionnalités */}
      <section className="bg-gray-50 py-20">
        <Container maxWidth="7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">Pourquoi choisir EduKidz ?</h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Une approche pédagogique innovante qui transforme l&apos;apprentissage en aventure
              passionnante pour vos enfants.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Section Enseignants */}
      <section className="bg-white py-20">
        <Container maxWidth="7xl">
          <div className="mb-16 text-center">
            <div className="mb-4 flex items-center justify-center">
              <span className="mr-3 text-4xl">👩‍🏫</span>
              <h2 className="text-4xl font-bold text-gray-900">
                Enseignants : Partagez votre passion
              </h2>
            </div>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Transformez votre expertise pédagogique en une source de revenus complémentaires tout
              en aidant des milliers d&apos;enfants à apprendre.
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#1D4ED8]">
                  <span className="text-xl text-white">💡</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Créez vos cours en ligne</h3>
                  <p className="text-gray-600">
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
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    Générez des revenus passifs
                  </h3>
                  <p className="text-gray-600">
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
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    Valorisez votre expertise
                  </h3>
                  <p className="text-gray-600">
                    Construisez votre réputation et montrez vos compétences pédagogiques à un large
                    public.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="mb-4 text-2xl font-bold text-gray-900">
                Rejoignez notre équipe d&apos;enseignants
              </h3>
              <p className="mb-6 text-gray-600">
                Nous recherchons des enseignants passionnés pour enrichir notre catalogue de cours.
                Bénéficiez d&apos;un support technique complet et d&apos;une plateforme optimisée
                pour l&apos;enseignement.
              </p>
              <div className="space-y-3">
                <Link
                  href="/signup"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1D4ED8] text-base font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  👩‍🏫 Devenir enseignant partenaire
                </Link>
                <p className="text-sm text-gray-500">
                  Inscription gratuite • Support dédié • Commission attractive
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Section Appel à l'action */}
      <section className="bg-[#1D4ED8] py-20">
        <Container maxWidth="2xl">
          <div className="text-center text-white">
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              {user
                ? "Continuez l'aventure d'apprentissage"
                : "Offrez à votre enfant le meilleur de l'éducation"}
            </h2>
            <p className="mx-auto mb-12 max-w-3xl text-xl text-blue-100">
              {user
                ? 'Découvrez nos nouveaux cours et continuez à grandir avec nous.'
                : 'Rejoignez des milliers de familles qui font confiance à notre plateforme éducative. Apprentissage garanti !'}
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              {user ? (
                <>
                  <Link
                    href="/courses"
                    className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-lg font-semibold text-[#1D4ED8] transition-colors hover:bg-gray-50"
                  >
                    📚 Découvrir les cours
                  </Link>
                  {isStudent && (
                    <Link
                      href="/payment"
                      className="inline-flex h-14 items-center justify-center rounded-full bg-green-500 px-10 text-lg font-semibold text-white transition-colors hover:bg-green-600"
                    >
                      👨‍👩‍👧‍👦 Mon abonnement
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/payment"
                    className="inline-flex h-14 items-center justify-center rounded-full bg-green-500 px-10 text-lg font-semibold text-white transition-colors hover:bg-green-600"
                  >
                    🚀 Commencer l&apos;abonnement
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex h-14 items-center justify-center rounded-full border-2 border-white px-10 text-lg font-semibold text-white transition-all duration-300 hover:bg-white hover:text-[#1D4ED8]"
                  >
                    🔐 Créer un compte gratuit
                  </Link>
                </>
              )}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

// Export the wrapped component - no auth required for home page
export default withAuth(Home, { requireAuth: false });
