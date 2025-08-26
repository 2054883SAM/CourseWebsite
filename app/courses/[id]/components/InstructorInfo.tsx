import Image from 'next/image';
import Link from 'next/link';
import { User } from '@/lib/supabase/types';

interface InstructorInfoProps {
  creator?: User;
}

export function InstructorInfo({ creator }: InstructorInfoProps) {
  if (!creator) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
          <span className="mr-2">👨‍🏫</span>
          À propos de l'instructeur
        </h2>
        <div className="text-gray-600 dark:text-gray-400 text-center py-8">
          <div className="text-4xl mb-4">🤔</div>
          <p className="text-lg font-medium">Informations de l'instructeur non disponibles</p>
          <p className="text-sm mt-2">Le profil du créateur du cours n'est pas accessible pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
          <span className="mr-2">👨‍🏫</span>
          À propos de l'instructeur
        </h2>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center">
          <div className="mb-4 sm:mb-0 sm:mr-6">
            {creator.photo_url ? (
              <div className="relative">
                <Image
                  src={creator.photo_url}
                  alt={creator.name}
                  width={80}
                  height={80}
                  className="rounded-full border-2 border-blue-100 shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 text-blue-800 rounded-full flex items-center justify-center text-xl font-semibold shadow-sm border-2 border-blue-100">
                {creator.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">{creator.name}</h3>
            <p className="text-blue-600 dark:text-blue-400 font-medium mb-2 capitalize">
              {creator.role === 'teacher' ? 'Enseignant' : creator.role === 'admin' ? 'Administrateur' : 'Étudiant'}
            </p>
            
            <div className="flex items-center mt-3">
              <Link 
                href={`/courses?creator=${creator.id}`}
                className="text-sm bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 text-gray-700 py-2 px-4 rounded-full transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                📚 Voir tous les cours
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium mb-2 flex items-center text-gray-900 dark:text-white">
            À propos
            {creator.bio && (
              <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                Bio personnalisée
              </span>
            )}
          </h4>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {creator.bio ? (
              creator.bio
            ) : (
              <>
                {creator.name} est un éducateur passionné avec une expertise dans divers domaines de la technologie et de la programmation.
                Avec des années d'expérience dans l'industrie, il apporte des connaissances pratiques et des meilleures pratiques à ses cours.
              </>
            )}
          </p>
        </div>
        
        <div className="mt-4">
          <h4 className="font-medium mb-2 flex items-center text-gray-900 dark:text-white">
            📧 Contact
          </h4>
          <p className="text-gray-700 dark:text-gray-300">
            <a 
              href={`mailto:${creator.email}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors duration-200 flex items-center"
            >
              <span className="mr-2">✉️</span>
              {creator.email}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 