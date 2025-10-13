import Link from 'next/link';

interface InstructorInfoProps {
  teacherName?: string;
  creatorId?: string;
}

export function InstructorInfo({ teacherName, creatorId }: InstructorInfoProps) {
  if (!teacherName) {
    return (
      <div className="relative rounded-3xl border-2 border-amber-200/50 bg-white/80 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
        <h2 className="mb-3 flex items-center text-lg font-bold text-gray-800 sm:mb-4 sm:text-xl">
          <span className="hidden sm:inline">À propos du professeur</span>
          <span className="sm:hidden">Professeur</span>
        </h2>
        <div className="py-6 text-center text-gray-600 dark:text-gray-400 sm:py-8">
          <div className="mb-3 text-3xl sm:mb-4 sm:text-4xl">🤔</div>
          <p className="text-base font-medium sm:text-lg">Informations non disponibles</p>
          <p className="mt-2 text-xs sm:text-sm">Le nom du professeur n'est pas spécifié.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl border-2 border-amber-200/50 bg-white/80 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
      <h2 className="mb-3 flex items-center text-lg font-bold text-gray-900 dark:text-white sm:mb-4 sm:text-xl">
        <span className="hidden text-gray-800 sm:inline">À propos du professeur</span>
        <span className="sm:hidden">Professeur</span>
      </h2>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex-shrink-0">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-300 bg-gradient-to-br from-amber-100 to-amber-200 text-2xl shadow-lg sm:h-16 sm:w-16 sm:text-3xl">
            👨‍🏫
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <h3 className="mb-1 text-base font-bold text-gray-800 sm:text-lg">{teacherName}</h3>
          <p className="mb-2 text-sm font-medium text-amber-600 sm:text-base">Professeur(e)</p>
        </div>
      </div>

      {creatorId && (
        <div className="mt-4 sm:mt-6">
          <Link
            href={`/courses?creator=${creatorId}`}
            className="flex w-full transform items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1.5 text-xs text-white shadow-md transition-all duration-200 hover:scale-105 hover:from-amber-600 hover:to-amber-700 hover:shadow-lg sm:px-4 sm:py-2 sm:text-sm"
          >
            📚 <span className="ml-2 sm:py-2">Voir tous les cours de ce professeur</span>
          </Link>
        </div>
      )}

      <div className="mt-4 flex flex-1 flex-col sm:mt-6">
        <h4 className="mb-2 flex items-center text-sm font-medium text-gray-800 sm:text-base">
          <span className="hidden sm:inline">À propos</span>
          <span className="sm:hidden">Bio</span>
        </h4>
        <p className="flex-1 text-xs leading-relaxed text-gray-700 sm:text-sm">
          {teacherName} est un éducateur passionné avec une expertise dans son domaine. Avec des
          années d'expérience dans l'enseignement, il/elle apporte des connaissances pratiques et
          des meilleures pratiques à ses cours.
        </p>
      </div>
    </div>
  );
}
