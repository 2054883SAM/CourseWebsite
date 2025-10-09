import Image from 'next/image';
import Link from 'next/link';
import { User } from '@/lib/supabase/types';

interface InstructorInfoProps {
  creator?: User;
}

export function InstructorInfo({ creator }: InstructorInfoProps) {
  if (!creator) {
    return (
      <div className="relative bg-white/80 backdrop-blur-xl border-2 border-amber-200/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800 flex items-center">
          <span className="hidden sm:inline">À propos de l'instructeur</span>
          <span className="sm:hidden">Instructeur</span>
        </h2>
        <div className="text-gray-600 dark:text-gray-400 text-center py-6 sm:py-8">
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🤔</div>
          <p className="text-base sm:text-lg font-medium">Informations non disponibles</p>
          <p className="text-xs sm:text-sm mt-2">Le profil n'est pas accessible pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white/80 backdrop-blur-xl border-2 border-amber-200/50 rounded-3xl p-4 sm:p-6 shadow-2xl">
      <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white flex items-center">
        <span className="hidden sm:inline text-gray-800">À propos de l'instructeur</span>
        <span className="sm:hidden">Instructeur</span>
      </h2>
      
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0">
          {creator.photo_url ? (
            <div className="relative">
              <Image
                src={creator.photo_url}
                alt={creator.name}
                width={60}
                height={60}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-blue-200 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          ) : (
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-purple-100 text-blue-800 rounded-full flex items-center justify-center text-sm sm:text-xl font-bold shadow-lg border-2 border-blue-200">
              {creator.name.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-bold mb-1 text-gray-800">{creator.name}</h3>
          <p className="text-blue-600 font-medium mb-2 text-sm sm:text-base capitalize">
            {creator.role === 'teacher' ? 'Enseignant' : creator.role === 'admin' ? 'Administrateur' : 'Étudiant'}
          </p>
        </div>
      </div>
      
      <div className="mt-4 sm:mt-6">
        <Link 
          href={`/courses?creator=${creator.id}`}
          className="w-full text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-1.5 px-3 sm:py-2 sm:px-4 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center"
        >
          📚 <span className="sm:py-2 hidden sm:inline ml-2">Voir tous les cours</span><span className="sm:hidden ml-2">Cours</span>
        </Link>
      </div>
      
      <div className="mt-4 sm:mt-6 flex-1 flex flex-col">
        <h4 className="font-medium mb-2 flex items-center text-gray-800 text-sm sm:text-base">
          <span className="hidden sm:inline">À propos</span>
          <span className="sm:hidden">Bio</span>
          {creator.bio && (
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Personnalisée
            </span>
          )}
        </h4>
        <p className="text-gray-700 leading-relaxed text-xs sm:text-sm flex-1">
          {creator.bio ? (
            creator.bio
          ) : (
            <>
              {creator.name} est un éducateur passionné avec une expertise dans divers domaines de la technologie et de la programmation.
              Avec des années d'expérience dans l'industrie, il apporte des connaissances pratiques et des meilleures pratiques à ses cours.
            </>
          )}
        </p>
        
        <div className="mt-3 sm:mt-4">
          <h4 className="font-medium mb-2 flex items-center text-gray-800 text-sm sm:text-base">
            📧<span className="hidden sm:inline ml-2">Contact</span>
          </h4>
          <p className="text-gray-700">
            <a 
              href={`mailto:${creator.email}`}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 flex items-center text-xs sm:text-sm"
            >
              <span className="mr-1 sm:mr-2">✉️</span>
              <span className="truncate">{creator.email}</span>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 