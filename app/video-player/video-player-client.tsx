'use client';

import React, { useState } from 'react';
import { VdoCipherPlayer } from '@/components/video';
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
      <Section className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Container>
          {/* Header avec navigation améliorée */}
          <div className="sticky top-0 z-40 -mx-4 mb-8 border-b border-gray-200 bg-white/80 px-4 py-4 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href={courseId ? `/courses/${courseId}` : '/courses'}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Retour au cours
                </Link>
                <div className="hidden md:block">
                  <h1 className="max-w-md truncate text-xl font-bold text-gray-900 dark:text-white">
                    {courseTitle ? courseTitle : 'Lecteur Vidéo'}
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {isFullscreen ? 'Mode normal' : 'Plein écran'}
                </button>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div
            className={`transition-all duration-300 ${isFullscreen ? 'max-w-none' : 'mx-auto max-w-7xl'}`}
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* Lecteur vidéo principal */}
              <div className={`${isFullscreen ? 'lg:col-span-4' : 'lg:col-span-3'}`}>
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                  <ClientOnly
                    fallback={
                      <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                        <div className="text-center">
                          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                          <p className="font-medium text-gray-600 dark:text-gray-400">
                            Chargement du lecteur vidéo...
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <VdoCipherPlayer videoId={playbackId} className="w-full" />
                  </ClientOnly>
                </div>

                {/* Informations du cours */}
                {courseTitle && (
                  <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                          <svg
                            className="h-6 w-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                          {courseTitle}
                        </h2>
                        <p className="mb-4 text-gray-600 dark:text-gray-400">
                          Profitez de votre apprentissage ! Cette vidéo a été créée spécialement
                          pour vous aider à maîtriser ce sujet.
                        </p>

                        {/* Statistiques du cours */}
                        <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 dark:border-gray-700 md:grid-cols-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              1
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Vidéo</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              100%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Qualité</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              HD
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Résolution
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              ∞
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Relectures
                            </div>
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
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                        <svg
                          className="mr-2 h-5 w-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Informations techniques
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Lecteur</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Mux Player
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Qualité</span>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            Adaptative
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Format</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            MP4/H.264
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Résolution
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Jusqu'à 4K
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contrôles rapides */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-white">
                        <svg
                          className="mr-2 h-5 w-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Contrôles rapides
                      </h3>
                      <div className="space-y-3">
                        <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700">
                          Reprendre la lecture
                        </button>
                        <button className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                          Remettre à zéro
                        </button>
                        <button className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                          Télécharger
                        </button>
                      </div>
                    </div>

                    {/* Support */}
                    <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6 dark:border-blue-700 dark:from-blue-900/20 dark:to-purple-900/20">
                      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                        Besoin d'aide ?
                      </h3>
                      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                        Si vous rencontrez des problèmes avec la lecture, n'hésitez pas à nous
                        contacter.
                      </p>
                      <button className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors duration-200 hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-800 dark:hover:bg-gray-700">
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
