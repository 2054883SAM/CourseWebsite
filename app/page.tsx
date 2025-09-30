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
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
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
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      {/* Bannière d'accueil */}
        <section className="relative min-h-[calc(100vh-73px)] flex items-center justify-center overflow-hidden pl-4 pr-4 sm:pl-8 sm:pr-8 lg:pl-24 lg:pr-24 max-w-[1440px] mx-auto">
        {/* Div avec image en background */}
        <div 
          className="w-full max-w-[1200px] h-[400px] sm:h-[500px] lg:h-[600px] flex items-center justify-center bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out rounded-3xl shadow-2xl"
          style={{
            backgroundImage: `url('${backgroundImages[currentImageIndex]}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
          }}
        >
          {/* Overlay dégradé sombre */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/50"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
          
          
        {/* Contenu principal avec animations d'images*/}
        <div className="relative z-20 flex flex-col items-center justify-center px-8 pb-8 pt-0 gap-8 w-full">
          {/* Titre en haut */}
          <div className="text-left self-start sm:translate-y-0 translate-y-2.5">
            <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl xl:text-7xl hero-title-enhanced leading-tight">
              {user ? `Bon retour, ${dbUser?.name}!` : 'Apprendre devient'}
              <span className="block hero-subtitle mt-3" style={{
                background: 'linear-gradient(135deg, #3B82F6, #1D4ED8, #1E40AF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                facile et amusant
              </span>
            </h1>
          </div>
            
          {/* Rectangle futuriste dans le bas */}
          <div className="max-w-4xl w-full transform translate-y-1/2">
              {/* Indicateurs de images */}
              <div className="flex justify-center space-x-4 mb-4">
                {backgroundImages.map((_, index) => (
                  <button
                    key={index}
                    className={`ultra-indicator ${
                      index === currentImageIndex 
                        ? 'active' 
                        : ''
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                    aria-label={`Aller à l'image ${index + 1}`}
                    style={{ zIndex: 100 }}
                  >
                    <div className="indicator-glow"></div>
                  </button>
                ))}
              </div>
              <div className="relative bg-black backdrop-blur-sm rounded-2xl p-8 border border-blue-500 shadow-2xl overflow-hidden" style={{boxShadow: '0 0 30px rgba(59, 130, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2)'}}>
                {/* Effet glow futuriste */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-400/5 to-purple-400/5 rounded-2xl"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-cyan-400/20 rounded-2xl blur-sm opacity-50"></div>
                
                {/* Contenu en flex horizontal pour text*/}
                <div className="relative z-10 flex items-center gap-8">
                  {/* Texte à gauche */}
                  <div className="flex-1">
                      <p className="text-lg leading-loose text-white/95 ultra-text-shadow font-medium tracking-wide">
                        Une plateforme éducative conçue spécialement pour les élèves du primaire. Des cours
                        créés par des enseignants passionnés pour rendre l&apos;apprentissage captivant et
                        accessible à tous les enfants.
                      </p>
                  </div>
                  
                  {/* Séparateur esthétique */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400/80 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-blue-300/60 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="w-1.5 h-1.5 bg-blue-500/70 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  </div>
                  
                  {/* Boutons à droite */}
                  <div className="flex flex-col gap-6 min-w-[200px]">
                    <Link
                      href="/courses"
                      className="group ultra-button primary-button text-center"
                    >
                      <span className="button-glow"></span>
                      <span className="mr-3 text-xl">🚀</span>
                      <span>Découvrir les cours</span>
                    </Link>
                    {!user ? (
                      <>
                        <Link
                          href="/payment"
                          className="group ultra-button secondary-button text-center"
                        >
                          <span className="button-glow"></span>
                          <span className="mr-3 text-xl">👨‍👩‍👧‍👦</span>
                          <span>S&apos;abonner</span>
                        </Link>
                        <Link
                          href="/signin"
                          className="group ultra-button tertiary-button text-center"
                        >
                          <span className="button-glow"></span>
                          <span className="mr-3 text-xl">🔐</span>
                          <span>Se connecter</span>
                        </Link>
                      </>
                    ) : (
                      isStudent && (
                        <Link
                          href="/payment"
                          className="group ultra-button secondary-button text-center"
                        >
                          <span className="button-glow"></span>
                          <span className="mr-3 text-xl">👨‍👩‍👧‍👦</span>
                          <span>Mon abonnement</span>
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
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
        {/* Background decorative leger glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <Container maxWidth="7xl" className="relative z-10">
          <div className="mb-12 text-center">
            <div className="mb-6 flex items-center justify-center">
              <span className="text-6xl animate-bounce">📚</span>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent mb-6">
              Nos cours populaires
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-300 leading-relaxed">
              Découvrez nos cours les plus appréciés par les élèves et leurs parents. 
              <span className="font-semibold text-white"> Apprentissage ludique et efficace garanti !</span>
            </p>
          </div>

          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? // Loading placeholders
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={`loading-${i}`}
                      className="group relative rounded-2xl border border-blue-500/30 bg-white/10 backdrop-blur-sm p-6 shadow-xl hover:shadow-blue-500/25 transition-all duration-500 hover:-translate-y-2"
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
                    className="group relative rounded-2xl border border-blue-500/30 bg-white/10 backdrop-blur-sm p-6 shadow-xl hover:shadow-blue-500/25 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                    style={{boxShadow: '0 0 20px rgba(59, 130, 246, 0.1), 0 0 40px rgba(59, 130, 246, 0.05)'}}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 rounded-2xl"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Course thumbnail */}
                    <div className="mb-6 aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 relative">
                      {course.thumbnail_url ? (
                        <div
                          className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url(${course.thumbnail_url})` }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-4xl group-hover:scale-110 transition-transform duration-300">🚀</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    {/*  Content carte */}
                    <div className="relative z-10">
                      <h3 className="mb-3 text-xl font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                        {course.title}
                      </h3>
                      <p className="mb-6 line-clamp-2 text-gray-300 leading-relaxed">
                        {course.description}
                      </p>
                      
                      {/*  Button dans carte */}
                      <Link
                        href={`/courses/${course.id}`}
                        className="group/btn relative inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
                        style={{boxShadow: '0 0 15px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.1)'}}
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          <span>Découvrir</span>
                          <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      </Link>
                    </div>
                  </div>
                ))}
          </div>

          <div className="text-center">
            <Link
              href="/courses"
              className="group relative inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 bg-pos-0 px-10 text-lg font-semibold text-white shadow-xl hover:shadow-blue-500/25 transition-all duration-500 hover:scale-105 hover:bg-pos-100 overflow-hidden"
              style={{boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), 0 0 40px rgba(59, 130, 246, 0.1)'}}
            >
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🚀</span>
                <span>Voir tous les cours</span>
                <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
          </div>
        </Container>
      </section>

      {/* Section Fonctionnalités */}
      <section className="relative py-20 overflow-hidden bg-black">
        {/* Background decorative "Glow" */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-500/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <Container maxWidth="7xl" className="relative z-10">
          <div className="mb-16 text-center">
            <div className="mb-8 flex items-center justify-center">
              <span className="text-6xl animate-bounce">🚀</span>
            </div>
            <h2 className="mb-8 text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              Pourquoi EduKids Academy ?
            </h2>
            <div className="mx-auto max-w-4xl">
               <p className="text-xl text-gray-300 leading-relaxed mb-4">
                 Une approche pédagogique <span className="font-bold text-white bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 px-3 py-1 rounded-full border border-yellow-400/30 shadow-lg">innovante</span> qui transforme l&apos;apprentissage en aventure
                 passionnante pour vos enfants.
               </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span>Méthodes certifiées</span>
                </div>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <span>Résultats garantis</span>
                </div>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  <span>Suivi personnalisé</span>
                </div>
              </div>
            </div>
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
                className="group relative rounded-3xl border border-yellow-500/30 bg-black/40 backdrop-blur-sm p-8 shadow-2xl hover:shadow-yellow-500/25 transition-all duration-500 hover:-translate-y-3 overflow-hidden"
                style={{boxShadow: '0 0 30px rgba(234, 179, 8, 0.1), 0 0 60px rgba(234, 179, 8, 0.05)'}}
              >
                {/* Enhanced glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-yellow-400/5 to-yellow-600/5 rounded-3xl"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 via-yellow-400/20 to-yellow-600/20 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="mb-4 text-4xl group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="mb-4 text-base font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Conteneur grille background pour les deux sections */}
      <div className="relative bg-black">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, transparent 0%, rgba(59, 130, 246, 0.15) 25%, rgba(59, 130, 246, 0.15) 75%, transparent 100%)
              `,
              backgroundSize: '40px 40px, 40px 40px, 100% 100%',
              backgroundBlendMode: 'multiply'
            }}></div>
          </div>
        </div>
        
        {/* Éléments décoratifs (forme geometriques) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-16 h-16 border-2 border-blue-400/40 rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
          <div className="absolute bottom-20 right-1/4 w-10 h-10 bg-blue-500/25 rounded-full animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-gradient-to-br from-blue-400/30 to-blue-600/30 rounded-full animate-bounce" style={{animationDuration: '3s'}}></div>
          <div className="absolute bottom-1/3 left-1/3 w-12 h-12 border border-blue-300/40 rotate-30 animate-spin" style={{animationDuration: '15s'}}></div>
          <div className="absolute top-1/4 left-1/2 w-6 h-6 border border-blue-500/35 rotate-12 animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute bottom-1/4 right-1/2 w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-400/20 rounded-full animate-bounce" style={{animationDuration: '5s', animationDelay: '1.5s'}}></div>
          <div className="absolute top-2/4 right-3/4 w-10 h-10 border-2 border-blue-400/30 rotate-60 animate-spin" style={{animationDuration: '12s'}}></div>
          <div className="absolute bottom-3/4 left-2/3 w-7 h-7 bg-gradient-to-br from-blue-600/25 to-blue-500/25 rounded-full animate-bounce" style={{animationDuration: '3.5s', animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-blue-500/8 to-blue-400/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-blue-500/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        {/* Section Enseignants */}
        <section className="relative py-20 overflow-hidden">
        
        <Container maxWidth="7xl" className="relative z-10">
          <div className="mb-16 text-center">
            <div className="mb-8 flex items-center justify-center">
              <div className="relative">
                <span className="text-6xl animate-bounce">👩‍🏫</span>
                <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-lg animate-pulse"></div>
              </div>
            </div>
            <h2 className="mb-8 text-4xl font-bold text-blue-500">
              Enseignants : Partagez votre passion
            </h2>
            <p className="mx-auto max-w-4xl text-xl text-white leading-relaxed">
              Transformez votre expertise pédagogique en une source de revenus complémentaires tout
              en aidant des milliers d&apos;enfants à apprendre.
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="relative rounded-2xl border border-blue-500/30 bg-black/40 backdrop-blur-sm p-6 shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-blue-400/5 to-blue-600/5 rounded-2xl"></div>
                
                <div className="relative z-10 flex items-start space-x-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 border border-blue-400/30">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-bold text-white">Créez vos cours en ligne</h3>
                    <p className="text-gray-300">
                      Utilisez vos méthodes pédagogiques éprouvées pour créer des cours vidéo
                      engageants.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl border border-blue-500/30 bg-black/40 backdrop-blur-sm p-6 shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-blue-400/5 to-blue-600/5 rounded-2xl"></div>
                
                <div className="relative z-10 flex items-start space-x-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 border border-blue-400/30">
                    <span className="text-2xl">💰</span>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-bold text-white">
                      Générez des revenus passifs
                    </h3>
                    <p className="text-gray-300">
                      Recevez une commission sur chaque inscription à vos cours, créant un revenu
                      durable.
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative rounded-2xl border border-blue-500/30 bg-black/40 backdrop-blur-sm p-6 shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-blue-400/5 to-blue-600/5 rounded-2xl"></div>
                
                <div className="relative z-10 flex items-start space-x-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20 border border-blue-400/30">
                    <span className="text-2xl">🌟</span>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-bold text-white">
                      Valorisez votre expertise
                    </h3>
                    <p className="text-gray-300">
                      Construisez votre réputation et montrez vos compétences pédagogiques à un large
                      public.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl border border-blue-500/30 bg-black/40 backdrop-blur-sm p-8 shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-blue-400/5 to-blue-600/5 rounded-3xl"></div>
              
              <div className="relative z-10">
                <h3 className="mb-4 text-2xl font-bold text-white">
                  Rejoignez notre équipe d&apos;enseignants
                </h3>
                <p className="mb-6 text-gray-300">
                  Nous recherchons des enseignants passionnés pour enrichir notre catalogue de cours.
                  Bénéficiez d&apos;un support technique complet et d&apos;une plateforme optimisée
                  pour l&apos;enseignement.
                </p>
                <div className="space-y-4">
            <Link
              href="/signup"
              className="inline-flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-lg font-semibold text-white transition-all duration-300 hover:text-blue-500 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(to right, #3B82F6, #2563EB)',
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #3B82F6, #2563EB)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
              }}
            >
              <span className="mr-3 text-xl">👩‍🏫</span>
              Devenir enseignant partenaire
            </Link>
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span>Inscription gratuite</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <span>Support dédié</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                      <span>Commission attractive</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

        {/* Section Appel à l'action */}
        <section className="py-20 relative z-10 overflow-hidden">
          {/* Particules flottantes jusqua le Top*/}
          <div className="fixed bottom-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
            <div className="floating-particles">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="particle" style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}></div>
              ))}
            </div>
          </div>

          {/* Éléments décoratifs (forme geometriques) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-12 h-12 border border-blue-500/30 rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
            <div className="absolute bottom-1/3 left-1/4 w-8 h-8 bg-blue-500/15 rounded-full animate-bounce" style={{animationDuration: '3s'}}></div>
            <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>

          <Container maxWidth="2xl" className="relative z-10">
            <div className="text-center text-white">
              {/* Titre avec effet futuriste */}
              <div className="mb-8">
                <h2 className="mb-4 text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent" style={{
                  textShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                  filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.2))'
                }}>
                  {user
                    ? "Continuez l'aventure d'apprentissage"
                    : "Offrez à votre enfant le meilleur de l'éducation"}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-400 mx-auto rounded-full animate-pulse"></div>
              </div>

              {/* Description */}
              <p className="mx-auto mb-12 max-w-3xl text-xl text-blue-100 leading-relaxed" style={{
                textShadow: '0 0 15px rgba(59, 130, 246, 0.2)'
              }}>
                {user
                  ? 'Découvrez nos nouveaux cours et continuez à grandir avec nous.'
                  : 'Rejoignez des milliers de familles qui font confiance à notre plateforme éducative. Apprentissage garanti !'}
              </p>

              {/* Boutons */}
              <div className="flex flex-col justify-center gap-6 sm:flex-row">
                {user ? (
                  <>
                    <Link
                      href="/courses"
                      className="group relative inline-flex h-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 px-12 text-lg font-bold text-white transition-all duration-300 hover:from-blue-400 hover:to-blue-500 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-2"
                      style={{
                        boxShadow: '0 0 25px rgba(59, 130, 246, 0.4)'
                      }}
                    >
                      <span className="mr-3 text-2xl">📚</span>
                      Découvrir les cours
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                    {isStudent && (
                      <Link
                        href="/payment"
                        className="group relative inline-flex h-16 items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-12 text-lg font-bold text-white transition-all duration-300 hover:from-green-400 hover:to-green-500 hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-2"
                        style={{
                          boxShadow: '0 0 25px rgba(34, 197, 94, 0.4)'
                        }}
                      >
                        <span className="mr-3 text-2xl">👨‍👩‍👧‍👦</span>
                        Mon abonnement
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/payment"
                      className="group relative inline-flex h-16 items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-green-600 px-12 text-lg font-bold text-white transition-all duration-300 hover:from-green-400 hover:to-green-500 hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-2"
                      style={{
                        boxShadow: '0 0 25px rgba(34, 197, 94, 0.4)'
                      }}
                    >
                      <span className="mr-3 text-2xl">🚀</span>
                      Commencer l&apos;abonnement
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                    <Link
                      href="/signup"
                      className="group relative inline-flex h-16 items-center justify-center rounded-2xl border-2 border-white px-12 text-lg font-bold text-white transition-all duration-300 hover:bg-white hover:text-blue-500 hover:shadow-2xl hover:shadow-white/30 hover:-translate-y-2"
                      style={{
                        boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <span className="mr-3 text-2xl">🔐</span>
                      Créer un compte gratuit
                      <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
