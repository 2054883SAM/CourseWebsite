'use client';

import React, { useState } from 'react';
import { MuxPlayer } from '@/components/video';
import ClientOnly from '@/components/video/ClientOnly';
import Link from 'next/link';
import { PageLayout, Container, Section } from '@/components/layout';

interface VideoPlayerClientProps {
  playbackId: string;
  courseId?: string;
  courseTitle?: string;
}

function VideoPlayerClient({ playbackId, courseId, courseTitle }: VideoPlayerClientProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <PageLayout>
      <Section className="py-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Container>
          {/* Header avec navigation améliorée */}
          <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700 -mx-4 px-4 py-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  href={courseId ? `/courses/${courseId}` : '/courses'} 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Retour au cours
                </Link>
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-md">
                    {courseTitle ? courseTitle : 'Lecteur Vidéo'}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isFullscreen ? 'Mode normal' : 'Plein écran'}
                </button>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className={`transition-all duration-300 ${isFullscreen ? 'max-w-none' : 'max-w-7xl mx-auto'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Lecteur vidéo principal */}
              <div className={`${isFullscreen ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <ClientOnly
                    fallback={
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-gray-600 dark:text-gray-400 font-medium">Chargement du lecteur vidéo...</p>
                        </div>
                      </div>
                    }
                  >
                    <MuxPlayer
                      playbackId={playbackId}
                      title={courseTitle || "Vidéo du cours"}
                      muted={true}
                      autoPlay={false}
                      className="w-full"
                    />
                  </ClientOnly>
                </div>

                {/* Informations du cours */}
                {courseTitle && (
                  <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {courseTitle}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          Profitez de votre apprentissage ! Cette vidéo a été créée spécialement pour vous aider à maîtriser ce sujet.
                        </p>
                        
                        {/* Statistiques du cours */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Vidéo</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">100%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Qualité</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">HD</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Résolution</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">∞</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Relectures</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar avec informations supplémentaires */}
              {!isFullscreen && (
                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-6">
                    {/* Informations techniques */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Informations techniques
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Lecteur</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Mux Player</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Qualité</span>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">Adaptative</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Format</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">MP4/H.264</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Résolution</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Jusqu'à 4K</span>
                        </div>
                      </div>
                    </div>

                    {/* Contrôles rapides */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Contrôles rapides
                      </h3>
                      <div className="space-y-3">
                        <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                          Reprendre la lecture
                        </button>
                        <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">
                          Remettre à zéro
                        </button>
                        <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors duration-200">
                          Télécharger
                        </button>
                      </div>
                    </div>

                    {/* Support */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Besoin d'aide ?
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Si vous rencontrez des problèmes avec la lecture, n'hésitez pas à nous contacter.
                      </p>
                      <button className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 dark:bg-gray-800 dark:border-blue-700 dark:hover:bg-gray-700 transition-colors duration-200">
                        Contacter le support
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </PageLayout>
  );
}

export default VideoPlayerClient; 