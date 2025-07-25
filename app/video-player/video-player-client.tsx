'use client';

import React from 'react';
import { MuxPlayer } from '@/components/video';
import ClientOnly from '@/components/video/ClientOnly';
import Link from 'next/link';

interface VideoPlayerClientProps {
  playbackId: string;
  courseId?: string;
  courseTitle?: string;
}

function VideoPlayerClient({ playbackId, courseId, courseTitle }: VideoPlayerClientProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header avec navigation */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link 
            href={courseId ? `/courses/${courseId}` : '/courses'} 
            className="text-blue-600 hover:text-blue-800 mb-2 inline-block"
          >
            ← Retour au cours
          </Link>
          <h1 className="text-2xl font-bold">
            {courseTitle ? courseTitle : 'Video Player'}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        <ClientOnly
          fallback={
            <div className="mb-8 flex aspect-video animate-pulse items-center justify-center rounded-lg bg-gray-200 shadow-lg">
              <p className="text-gray-500">Chargement du lecteur vidéo...</p>
            </div>
          }
        >
          <MuxPlayer
            playbackId={playbackId}
            title={courseTitle || "Vidéo du cours"}
            muted={true}
            autoPlay={false}
            className="mb-8 rounded-lg shadow-lg"
          />
        </ClientOnly>

        {courseTitle && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="mb-4 text-xl font-semibold">À propos de ce cours</h2>
            <p className="mb-4">
              Vous regardez actuellement : <strong>{courseTitle}</strong>
            </p>
            <p className="text-gray-600">
              Profitez de votre apprentissage ! Cette vidéo a été créée spécialement pour vous aider à maîtriser ce sujet.
            </p>
          </div>
        )}

        {!courseTitle && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="mb-4 text-xl font-semibold">Lecteur Vidéo</h2>
            <p className="mb-4">
              Ce lecteur vidéo utilise Mux pour une diffusion de haute qualité.
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Lecture vidéo de haute qualité</li>
              <li>Indicateur de chargement pendant l'initialisation</li>
              <li>Gestion d'erreur avec messages conviviaux</li>
              <li>Design responsive qui maintient le ratio d'aspect</li>
              <li>Suivi de progression avec sauvegarde automatique</li>
              <li>Barre de progression visuelle avec indicateur de pourcentage</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPlayerClient; 