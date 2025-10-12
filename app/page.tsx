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
  const { user, dbUser, loading: authLoading } = useAuth();
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isStudent = dbUser?.role === 'student';
  const isAdmin = dbUser?.role === 'admin';
  const router = useRouter();

  // Liste des images de fond
  const backgroundImages = [
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2022&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    'https://images.unsplash.com/photo-1497486751825-1233686d5d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80',
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  ];

  // Changement automatique d'image toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Redirect users based on role (only after auth is ready and user exists)
  useEffect(() => {
    if (authLoading || !user) return;
    if (isStudent) {
      router.replace('/learning?page=dashboard');
    } else if (isAdmin) {
      router.replace('/dashboard?page=dashboard');
    }
  }, [authLoading, user, isStudent, isAdmin, router]);

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
  if (!authLoading && user && (isStudent || isAdmin)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="background-beige relative min-h-screen w-full overflow-hidden">
      {/* Bannière d'accueil */}
      <section className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-[1440px] items-center justify-center overflow-visible px-4 sm:px-8 lg:px-24">
        {/* Div avec image en background */}
        <div
          className="flex h-[400px] w-full max-w-[1200px] items-center justify-center rounded-3xl bg-cover bg-center bg-no-repeat shadow-2xl transition-all duration-1000 ease-in-out sm:h-[450px] md:h-[500px] lg:h-[550px] xl:h-[600px]"
          style={{
            backgroundImage: `url('${backgroundImages[currentImageIndex]}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
          }}
        >
          {/* Contenu principal avec animations d'images*/}
          <div className="relative z-20 flex w-full flex-col items-center justify-center gap-4 px-4 pb-8 pt-0 sm:gap-6 sm:px-6 md:gap-8 md:px-8">
            {/* Titre en haut */}
            <div className="custom-text-center translate-y-2.5 self-start text-center">
              <h1 className="hero-title-enhanced text-3xl font-bold leading-tight text-white sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl">
                {user ? `Bon retour, ${dbUser?.name}!` : 'Apprendre devient'}
                <span
                  className="hero-subtitle mt-2 block sm:mt-3"
                  style={{
                    background: 'linear-gradient(180deg, #3B82F6, #1D4ED8, #1E40AF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  facile et amusant
                </span>
              </h1>
            </div>

            {/* Rectangle futuriste dans le bas */}
            <div className="w-full max-w-4xl translate-y-[83%] transform sm:translate-y-[83%] md:translate-y-1/3 lg:translate-y-1/2">
              {/* Indicateurs de images */}
              <div className="mb-3 flex justify-center space-x-3 sm:mb-4 sm:space-x-4">
                {backgroundImages.map((_, index) => (
                  <button
                    key={index}
                    className={`ultra-indicator ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => setCurrentImageIndex(index)}
                    aria-label={`Aller à l'image ${index + 1}`}
                    style={{ zIndex: 100 }}
                  >
                    <div className="indicator-glow"></div>
                  </button>
                ))}
              </div>
              <div
                className="relative overflow-hidden rounded-xl border border-amber-300 bg-amber-50/95 p-4 shadow-2xl backdrop-blur-sm sm:rounded-2xl sm:p-5 md:p-6 lg:p-7 xl:p-8"
                style={{
                  boxShadow: '0 0 30px rgba(245, 158, 11, 0.3), 0 0 60px rgba(245, 158, 11, 0.15)',
                }}
              >
                {/* Effet glow futuriste */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-200/20 via-amber-100/15 to-amber-300/20 sm:rounded-2xl"></div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-amber-200/10 to-amber-300/10 sm:rounded-2xl"></div>
                <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-300/30 via-amber-200/25 to-amber-400/30 opacity-50 blur-sm sm:rounded-2xl"></div>

                {/* Contenu responsive */}
                <div className="relative z-10 flex flex-col items-center gap-6 lg:flex-row lg:gap-8">
                  {/* Texte */}
                  <div className="flex-1 text-center lg:text-left">
                    <p className="ultra-text-shadow text-base font-medium leading-relaxed tracking-wide text-amber-900 sm:text-lg sm:leading-loose">
                      Une plateforme éducative conçue spécialement pour les élèves du primaire. Des
                      cours créés par des enseignants passionnés pour rendre l&apos;apprentissage
                      captivant et accessible à tous les enfants.
                    </p>
                  </div>

                  {/* Séparateur esthétique - caché sur mobile */}
                  <div className="hidden flex-col items-center gap-2 lg:flex">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400/80"></div>
                    <div
                      className="h-1 w-1 animate-pulse rounded-full bg-blue-300/60"
                      style={{ animationDelay: '0.5s' }}
                    ></div>
                    <div
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500/70"
                      style={{ animationDelay: '1s' }}
                    ></div>
                  </div>

                  {/* Boutons */}
                  <div className="flex w-full flex-col gap-4 sm:gap-6 lg:w-auto lg:min-w-[200px]">
                    <Link href="/courses" className="ultra-button primary-button group text-center">
                      <span className="button-glow"></span>
                      <span className="mr-3 text-lg sm:text-xl">🚀</span>
                      <span className="text-sm sm:text-base">Découvrir les cours</span>
                    </Link>
                    {!user ? (
                      <>
                        <Link
                          href="/payment"
                          className="ultra-button secondary-button group text-center"
                        >
                          <span className="button-glow"></span>
                          <span className="mr-3 text-lg sm:text-xl">👨‍👩‍👧‍👦</span>
                          <span className="text-sm sm:text-base">S&apos;abonner</span>
                        </Link>
                        <Link
                          href="/signin"
                          className="ultra-button group text-center"
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '2px solid rgba(245, 158, 11, 0.3)',
                            backdropFilter: 'blur(10px)',
                            boxShadow:
                              '0 10px 25px rgba(245, 158, 11, 0.1), 0 5px 15px rgba(245, 158, 11, 0.05)',
                          }}
                        >
                          <span className="button-glow"></span>
                          <span className="mr-3 text-lg sm:text-xl">🔐</span>
                          <span className="text-sm sm:text-base">Se connecter</span>
                        </Link>
                      </>
                    ) : (
                      isStudent && (
                        <Link
                          href="/payment"
                          className="ultra-button secondary-button group text-center"
                        >
                          <span className="button-glow"></span>
                          <span className="mr-3 text-lg sm:text-xl">👨‍👩‍👧‍👦</span>
                          <span className="text-sm sm:text-base">Mon abonnement</span>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Cours */}
      <section className="from-background-beige to-background-beige section-courses-mobile relative overflow-hidden bg-gradient-to-b via-gray-100 py-12 sm:py-16 lg:py-20">
        {/* Background decorative leger glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-1/4 h-32 w-32 animate-pulse rounded-full bg-blue-500/10 blur-3xl sm:h-48 sm:w-48 lg:h-64 lg:w-64"></div>
          <div
            className="absolute bottom-1/4 right-1/4 h-40 w-40 animate-pulse rounded-full bg-purple-500/10 blur-3xl sm:h-60 sm:w-60 lg:h-80 lg:w-80"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        <Container maxWidth="7xl" className="relative z-10">
          <div className="mb-8 px-4 text-center sm:mb-10 lg:mb-12">
            <div className="mb-4 flex items-center justify-center sm:mb-6">
              <span className="animate-bounce text-4xl sm:text-5xl lg:text-6xl">📚</span>
            </div>
            <h2 className="mb-4 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-2xl font-bold text-transparent sm:mb-6 sm:text-3xl lg:text-4xl">
              Nos cours populaires
            </h2>
            <p className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 sm:text-lg">
              Découvrez nos cours les plus appréciés par les élèves et leurs parents.
              <span className="font-semibold text-gray-800">
                {' '}
                Apprentissage ludique et efficace garanti !
              </span>
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-4 px-4 sm:mb-10 sm:gap-6 md:grid-cols-2 lg:mb-12 lg:grid-cols-3">
            {loading
              ? // Loading placeholders
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={`loading-${i}`}
                      className="group relative rounded-xl border border-blue-500/30 bg-white/90 p-4 shadow-xl backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-blue-500/25 sm:rounded-2xl sm:p-6"
                    >
                      <div className="mb-6 aspect-video animate-pulse rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                      <div className="mb-4 h-8 w-3/4 animate-pulse rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
                      <div className="mb-6 h-20 animate-pulse rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
                      <div className="h-14 w-40 animate-pulse rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
                    </div>
                  ))
              : // Course cards
                featuredCourses.map((course: Course) => (
                  <div
                    key={course.id}
                    className="group relative overflow-hidden rounded-xl border border-blue-500/30 bg-white/60 p-4 shadow-xl backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-blue-500/25 sm:rounded-2xl sm:p-6"
                    style={{
                      boxShadow:
                        '0 0 20px rgba(59, 130, 246, 0.1), 0 0 40px rgba(59, 130, 246, 0.05)',
                    }}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100"></div>

                    {/* Course thumbnail */}
                    <div className="relative mb-4 aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 sm:mb-6 sm:rounded-xl">
                      {course.thumbnail_url ? (
                        <div
                          className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url(${course.thumbnail_url})` }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
                            🚀
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    </div>

                    {/*  Content carte */}
                    <div className="relative z-10">
                      <h3 className="mb-2 text-lg font-bold text-gray-800 transition-colors duration-300 group-hover:text-blue-600 sm:mb-3 sm:text-xl">
                        {course.title}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600 sm:mb-6 sm:text-base">
                        {course.description}
                      </p>

                      {/*  Button dans carte */}
                      <Link
                        href={`/courses/${course.id}`}
                        className="group/btn relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 text-xs font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl sm:h-12 sm:px-8 sm:text-sm"
                        style={{
                          boxShadow:
                            '0 0 15px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.1)',
                        }}
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          <span>Découvrir</span>
                          <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
                            →
                          </span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"></div>
                      </Link>
                    </div>
                  </div>
                ))}
          </div>

          <div className="px-4 text-center">
            <Link
              href="/courses"
              className="bg-size-200 bg-pos-0 hover:bg-pos-100 group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 px-8 text-base font-semibold text-white shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-blue-500/25 sm:h-14 sm:px-10 sm:text-lg"
              style={{
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)',
              }}
            >
              <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                <span className="text-xl transition-transform duration-300 group-hover:rotate-12 sm:text-2xl">
                  🚀
                </span>
                <span className="text-sm sm:text-base">Voir tous les cours</span>
                <span className="transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-700 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
            </Link>
          </div>
        </Container>
      </section>

      {/* Section Fonctionnalités */}
      <section className="background-beige relative overflow-hidden py-12 sm:py-16 lg:py-20">
        {/* Background decorative "Glow" */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 transform animate-pulse rounded-full bg-gradient-to-r from-yellow-500/10 to-yellow-400/10 blur-3xl sm:h-72 sm:w-72 lg:h-96 lg:w-96"></div>
          <div
            className="absolute right-1/4 top-1/4 h-32 w-32 animate-pulse rounded-full bg-yellow-500/10 blur-3xl sm:h-48 sm:w-48 lg:h-64 lg:w-64"
            style={{ animationDelay: '1s' }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/4 h-40 w-40 animate-pulse rounded-full bg-yellow-400/10 blur-3xl sm:h-60 sm:w-60 lg:h-80 lg:w-80"
            style={{ animationDelay: '2s' }}
          ></div>
        </div>

        <Container maxWidth="7xl" className="relative z-10">
          <div className="mb-12 px-4 text-center sm:mb-14 lg:mb-16">
            <div className="mb-6 flex items-center justify-center sm:mb-8">
              <span className="animate-bounce text-4xl sm:text-5xl lg:text-6xl">🚀</span>
            </div>
            <h2 className="mb-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-2xl font-bold text-transparent sm:mb-8 sm:text-3xl lg:text-4xl">
              Pourquoi EduKids Academy ?
            </h2>
            <div className="mx-auto max-w-4xl">
              <p className="mb-4 text-base leading-relaxed text-gray-600 sm:text-lg lg:text-xl">
                Une approche pédagogique{' '}
                <span className="rounded-full border border-yellow-400/30 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 px-2 py-1 font-bold text-gray-800 shadow-lg sm:px-3">
                  innovante
                </span>{' '}
                qui transforme l&apos;apprentissage en aventure passionnante pour vos enfants.
              </p>
              <div className="flex flex-col items-center justify-center space-y-2 text-xs text-gray-400 sm:flex-row sm:space-x-4 sm:space-y-0 sm:text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-400"></div>
                  <span>Méthodes certifiées</span>
                </div>
                <div className="hidden h-1 w-1 rounded-full bg-gray-500 sm:block"></div>
                <div className="flex items-center space-x-2">
                  <div
                    className="h-2 w-2 animate-pulse rounded-full bg-yellow-400"
                    style={{ animationDelay: '0.5s' }}
                  ></div>
                  <span>Résultats garantis</span>
                </div>
                <div className="hidden h-1 w-1 rounded-full bg-gray-500 sm:block"></div>
                <div className="flex items-center space-x-2">
                  <div
                    className="h-2 w-2 animate-pulse rounded-full bg-yellow-400"
                    style={{ animationDelay: '1s' }}
                  ></div>
                  <span>Suivi personnalisé</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 px-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
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
                className="group relative overflow-hidden rounded-2xl border border-yellow-500/30 bg-white/60 p-4 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:shadow-yellow-500/25 sm:rounded-3xl sm:p-6 lg:p-8"
                style={{
                  boxShadow: '0 0 30px rgba(234, 179, 8, 0.1), 0 0 60px rgba(234, 179, 8, 0.05)',
                }}
              >
                {/* Enhanced glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-yellow-500/5 via-yellow-400/5 to-yellow-600/5"></div>
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-yellow-500/20 via-yellow-400/20 to-yellow-600/20 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100"></div>

                <div className="relative z-10">
                  <div className="mb-3 text-3xl transition-transform duration-300 group-hover:scale-110 sm:mb-4 sm:text-4xl">
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-sm font-bold text-gray-800 transition-colors duration-300 group-hover:text-yellow-600 sm:mb-4 sm:text-base">
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700 sm:text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Conteneur grille background pour les deux sections */}
      <div className="background-beige relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute left-0 top-0 h-full w-full"
              style={{
                backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, transparent 0%, rgba(59, 130, 246, 0.15) 25%, rgba(59, 130, 246, 0.15) 75%, transparent 100%)
              `,
                backgroundSize: '40px 40px, 40px 40px, 100% 100%',
                backgroundBlendMode: 'multiply',
              }}
            ></div>
          </div>
        </div>

        {/* Éléments décoratifs (forme geometriques) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-1/4 top-20 h-16 w-16 rotate-45 animate-spin border-2 border-blue-400/40"
            style={{ animationDuration: '20s' }}
          ></div>
          <div
            className="absolute bottom-20 right-1/4 h-10 w-10 animate-pulse rounded-full bg-blue-500/25"
            style={{ animationDuration: '4s' }}
          ></div>
          <div
            className="absolute right-1/3 top-1/3 h-8 w-8 animate-bounce rounded-full bg-gradient-to-br from-blue-400/30 to-blue-600/30"
            style={{ animationDuration: '3s' }}
          ></div>
          <div
            className="rotate-30 absolute bottom-1/3 left-1/3 h-12 w-12 animate-spin border border-blue-300/40"
            style={{ animationDuration: '15s' }}
          ></div>
          <div
            className="absolute left-1/2 top-1/4 h-6 w-6 rotate-12 animate-pulse border border-blue-500/35"
            style={{ animationDuration: '4s' }}
          ></div>
          <div
            className="absolute bottom-1/4 right-1/2 h-14 w-14 animate-bounce rounded-full bg-gradient-to-br from-blue-500/20 to-blue-400/20"
            style={{ animationDuration: '5s', animationDelay: '1.5s' }}
          ></div>
          <div
            className="rotate-60 absolute right-3/4 top-2/4 h-10 w-10 animate-spin border-2 border-blue-400/30"
            style={{ animationDuration: '12s' }}
          ></div>
          <div
            className="absolute bottom-3/4 left-2/3 h-7 w-7 animate-bounce rounded-full bg-gradient-to-br from-blue-600/25 to-blue-500/25"
            style={{ animationDuration: '3.5s', animationDelay: '2s' }}
          ></div>
          <div className="from-blue-500/8 to-blue-400/8 absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 transform animate-pulse rounded-full bg-gradient-to-r blur-3xl"></div>
          <div
            className="bg-blue-500/8 absolute right-1/4 top-1/4 h-40 w-40 animate-pulse rounded-full blur-3xl"
            style={{ animationDelay: '1s' }}
          ></div>
        </div>

        {/* Section Enseignants */}
        <section className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
          <Container maxWidth="7xl" className="relative z-10">
            <div className="mb-12 px-4 text-center sm:mb-14 lg:mb-16">
              <div className="mb-6 flex items-center justify-center sm:mb-8">
                <div className="relative animate-bounce">
                  <span className="text-4xl sm:text-5xl lg:text-6xl">👩‍🏫</span>
                  <div className="absolute -inset-2 animate-pulse rounded-full bg-blue-500/20 blur-lg"></div>
                </div>
              </div>
              <h2 className="mb-6 text-2xl font-bold text-blue-500 sm:mb-8 sm:text-3xl lg:text-4xl">
                Enseignants : Partagez votre passion
              </h2>
              <p className="mx-auto max-w-4xl text-base leading-relaxed text-gray-700 sm:text-lg lg:text-xl">
                Transformez votre expertise pédagogique en une source de revenus complémentaires
                tout en aidant des milliers d&apos;enfants à apprendre.
              </p>
            </div>

            <div className="grid grid-cols-1 items-center gap-8 px-4 sm:gap-10 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4 sm:space-y-6">
                <div className="relative overflow-hidden rounded-xl border border-blue-500/30 bg-white/60 p-4 shadow-xl backdrop-blur-sm sm:rounded-2xl sm:p-6">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 via-blue-400/5 to-blue-600/5 sm:rounded-2xl"></div>

                  <div className="relative z-10 flex items-start space-x-3 sm:space-x-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/20 sm:h-12 sm:w-12">
                      <span className="text-xl sm:text-2xl">💡</span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-bold text-gray-800 sm:text-lg">
                        Créez vos cours en ligne
                      </h3>
                      <p className="text-sm text-gray-600 sm:text-base">
                        Utilisez vos méthodes pédagogiques éprouvées pour créer des cours vidéo
                        engageants.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-blue-500/30 bg-white/60 p-4 shadow-xl backdrop-blur-sm sm:rounded-2xl sm:p-6">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 via-blue-400/5 to-blue-600/5 sm:rounded-2xl"></div>

                  <div className="relative z-10 flex items-start space-x-3 sm:space-x-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/20 sm:h-12 sm:w-12">
                      <span className="text-xl sm:text-2xl">💰</span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-bold text-gray-800 sm:text-lg">
                        Générez des revenus passifs
                      </h3>
                      <p className="text-sm text-gray-600 sm:text-base">
                        Recevez une commission sur chaque inscription à vos cours, créant un revenu
                        durable.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-blue-500/30 bg-white/60 p-4 shadow-xl backdrop-blur-sm sm:rounded-2xl sm:p-6">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 via-blue-400/5 to-blue-600/5 sm:rounded-2xl"></div>

                  <div className="relative z-10 flex items-start space-x-3 sm:space-x-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/20 sm:h-12 sm:w-12">
                      <span className="text-xl sm:text-2xl">🌟</span>
                    </div>
                    <div>
                      <h3 className="mb-2 text-base font-bold text-gray-800 sm:text-lg">
                        Valorisez votre expertise
                      </h3>
                      <p className="text-sm text-gray-600 sm:text-base">
                        Construisez votre réputation et montrez vos compétences pédagogiques à un
                        large public.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-white/60 p-4 shadow-2xl backdrop-blur-sm sm:rounded-3xl sm:p-6 lg:p-8">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-blue-400/5 to-blue-600/5 sm:rounded-3xl"></div>

                <div className="relative z-10">
                  <h3 className="mb-3 text-lg font-bold text-gray-800 sm:mb-4 sm:text-xl lg:text-2xl">
                    Rejoignez notre équipe d&apos;enseignants
                  </h3>
                  <p className="mb-4 text-sm text-gray-600 sm:mb-6 sm:text-base">
                    Nous recherchons des enseignants passionnés pour enrichir notre catalogue de
                    cours. Bénéficiez d&apos;un support technique complet et d&apos;une plateforme
                    optimisée pour l&apos;enseignement.
                  </p>
                  <div className="space-y-3 sm:space-y-4">
                    <Link
                      href="/signup"
                      className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:text-blue-500 hover:shadow-lg hover:shadow-blue-500/25 sm:h-14 sm:text-base lg:text-lg"
                      style={{
                        background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                        boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.boxShadow =
                          '0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          'linear-gradient(to right, #3B82F6, #2563EB)';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
                      }}
                    >
                      <span className="mr-2 text-lg sm:mr-3 sm:text-xl">👩‍🏫</span>
                      <span className="text-xs sm:text-sm lg:text-base">
                        Devenir enseignant partenaire
                      </span>
                    </Link>
                    <div className="flex flex-col items-center justify-center space-y-2 text-xs text-gray-400 sm:flex-row sm:space-x-4 sm:space-y-0 sm:text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400"></div>
                        <span>Inscription gratuite</span>
                      </div>
                      <div className="hidden h-1 w-1 rounded-full bg-gray-500 sm:block"></div>
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-2 w-2 animate-pulse rounded-full bg-blue-400"
                          style={{ animationDelay: '0.5s' }}
                        ></div>
                        <span>Support dédié</span>
                      </div>
                      <div className="hidden h-1 w-1 rounded-full bg-gray-500 sm:block"></div>
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-2 w-2 animate-pulse rounded-full bg-blue-400"
                          style={{ animationDelay: '1s' }}
                        ></div>
                        <span>Commission attractive</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </Container>
        </section>

        {/* Section Appel à l'action */}
        <section className="relative z-10 overflow-hidden py-12 sm:py-16 lg:py-20">
          {/* Particules flottantes jusqua le Top*/}
          <div className="pointer-events-none fixed bottom-0 left-0 z-0 h-screen w-full overflow-hidden">
            <div className="floating-particles">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 4}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Éléments décoratifs (forme geometriques) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-0 top-1/2 h-px w-full animate-pulse bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
            <div
              className="absolute right-1/4 top-1/3 h-8 w-8 rotate-45 animate-spin border border-blue-500/30 sm:h-12 sm:w-12"
              style={{ animationDuration: '20s' }}
            ></div>
            <div
              className="absolute bottom-1/3 left-1/4 h-6 w-6 animate-bounce rounded-full bg-blue-500/15 sm:h-8 sm:w-8"
              style={{ animationDuration: '3s' }}
            ></div>
            <div
              className="absolute right-1/3 top-1/2 h-20 w-20 animate-pulse rounded-full bg-blue-500/5 blur-2xl sm:h-32 sm:w-32 lg:h-40 lg:w-40"
              style={{ animationDelay: '1s' }}
            ></div>
          </div>

          <Container maxWidth="2xl" className="relative z-10">
            <div className="px-4 text-center text-gray-800">
              {/* Titre avec effet futuriste */}
              <div className="mb-6 sm:mb-8">
                <h2
                  className="mb-3 bg-gradient-to-r from-gray-800 via-blue-600 to-gray-800 bg-clip-text text-2xl font-bold text-transparent sm:mb-4 sm:text-3xl lg:text-4xl xl:text-5xl"
                  style={{
                    textShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                    filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.2))',
                  }}
                >
                  {user
                    ? "Continuez l'aventure d'apprentissage"
                    : "Offrez à votre enfant le meilleur de l'éducation"}
                </h2>
                <div className="mx-auto h-1 w-16 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-blue-400 sm:w-20 lg:w-24"></div>
              </div>

              {/* Description */}
              <p
                className="mx-auto mb-8 max-w-3xl text-base leading-relaxed text-gray-600 sm:mb-10 sm:text-lg lg:mb-12 lg:text-xl"
                style={{
                  textShadow: '0 0 15px rgba(59, 130, 246, 0.2)',
                }}
              >
                {user
                  ? 'Découvrez nos nouveaux cours et continuez à grandir avec nous.'
                  : 'Rejoignez des milliers de familles qui font confiance à notre plateforme éducative. Apprentissage garanti !'}
              </p>

              {/* Boutons */}
              <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
                {user ? (
                  <>
                    <Link
                      href="/courses"
                      className="group relative inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-8 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-2 hover:from-blue-400 hover:to-blue-500 hover:shadow-2xl hover:shadow-blue-500/30 sm:h-14 sm:rounded-2xl sm:px-10 sm:text-base lg:h-16 lg:px-12 lg:text-lg"
                      style={{
                        boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)',
                      }}
                    >
                      <span className="mr-2 text-lg sm:mr-3 sm:text-xl lg:text-2xl">📚</span>
                      <span className="text-xs sm:text-sm lg:text-base">Découvrir les cours</span>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-blue-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-2xl"></div>
                    </Link>
                    {isStudent && (
                      <Link
                        href="/payment"
                        className="group relative inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-8 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-2 hover:from-green-400 hover:to-green-500 hover:shadow-2xl hover:shadow-green-500/30 sm:h-14 sm:rounded-2xl sm:px-10 sm:text-base lg:h-16 lg:px-12 lg:text-lg"
                        style={{
                          boxShadow: '0 0 25px rgba(34, 197, 94, 0.4)',
                        }}
                      >
                        <span className="mr-2 text-lg sm:mr-3 sm:text-xl lg:text-2xl">👨‍👩‍👧‍👦</span>
                        <span className="text-xs sm:text-sm lg:text-base">Mon abonnement</span>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/20 to-green-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-2xl"></div>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/payment"
                      className="group relative inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-8 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-2 hover:from-green-400 hover:to-green-500 hover:shadow-2xl hover:shadow-green-500/30 sm:h-14 sm:rounded-2xl sm:px-10 sm:text-base lg:h-16 lg:px-12 lg:text-lg"
                      style={{
                        boxShadow: '0 0 25px rgba(34, 197, 94, 0.4)',
                      }}
                    >
                      <span className="mr-2 text-lg sm:mr-3 sm:text-xl lg:text-2xl">🚀</span>
                      <span className="text-xs sm:text-sm lg:text-base">
                        Commencer l&apos;abonnement
                      </span>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-400/20 to-green-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-2xl"></div>
                    </Link>
                    <Link
                      href="/signup"
                      className="group relative inline-flex h-12 items-center justify-center rounded-xl border-2 border-gray-800 px-8 text-sm font-bold text-gray-800 transition-all duration-300 hover:-translate-y-2 hover:bg-gray-800 hover:text-white hover:shadow-2xl hover:shadow-gray-800/30 sm:h-14 sm:rounded-2xl sm:px-10 sm:text-base lg:h-16 lg:px-12 lg:text-lg"
                      style={{
                        boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      <span className="mr-2 text-lg sm:mr-3 sm:text-xl lg:text-2xl">🔐</span>
                      <span className="text-xs sm:text-sm lg:text-base">
                        Créer un compte gratuit
                      </span>
                      <div className="absolute inset-0 rounded-xl bg-gray-800/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-2xl"></div>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}

// Export the wrapped component - no auth required for home page
export default withAuth(Home, { requireAuth: false });
