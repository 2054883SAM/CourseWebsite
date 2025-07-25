'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Course, Section } from '@/lib/supabase/types';

interface CourseActionsProps {
  course: Course;
  sections: Section[];
}

export function CourseActions({ course, sections }: CourseActionsProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleEnrollClick = () => {
    if (!user) {
      // Store the current course URL in session storage for redirect after login
      sessionStorage.setItem('redirectAfterLogin', `/courses/${course.id}`);
      router.push('/signin');
      return;
    }

    // Rediriger vers la page de lecture vidéo avec le playbackId
    if (course.playback_id) {
      router.push(`/video-player?playbackId=${course.playback_id}&courseId=${course.id}&courseTitle=${encodeURIComponent(course.title)}`);
    } else {
      // Fallback si pas de playbackId
      console.log('Enrolling in course:', course.id);
      alert('Vidéo non disponible pour le moment.');
    }
  };

  // Calculate total duration from sections
  const totalDuration = Math.round(
    sections.reduce((total, section) => total + (section.duration || 0), 0) / 60
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="text-2xl font-bold mb-4">${course.price.toFixed(2)}</div>
      
      <button 
        onClick={handleEnrollClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors mb-4"
        disabled={loading}
      >
        {loading ? 'Chargement...' : course.playback_id ? 'Regarder la vidéo' : 'S\'inscrire maintenant'}
      </button>
      
      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Sections totales :</span>
          <span className="font-semibold">{sections.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Durée totale :</span>
          <span className="font-semibold">
            {totalDuration} min
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Créé par :</span>
          <span className="font-semibold">{course.creator?.name || 'Inconnu'}</span>
        </div>
        {course.playback_id && (
          <div className="flex justify-between">
            <span className="text-gray-600">Statut vidéo :</span>
            <span className="font-semibold text-green-600">Disponible</span>
          </div>
        )}
      </div>
    </div>
  );
} 