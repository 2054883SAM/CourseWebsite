import { Course } from '@/lib/supabase/types';

interface CourseOverviewProps {
  course: Course;
}

export function CourseOverview({ course }: CourseOverviewProps) {
  // Fonction pour convertir le texte en liste d'éléments
  const parseTextToList = (text: string | undefined): string[] => {
    if (!text) return [];
    // Divise le texte par les retours à la ligne et filtre les lignes vides
    return text.split('\n').filter(line => line.trim().length > 0);
  };

  // Fonction pour afficher une section avec des données réelles ou un fallback
  const renderSection = (title: string, data: string | undefined, fallbackItems: string[]) => {
    const items = data ? parseTextToList(data) : fallbackItems;
    
    if (items.length === 0) return null;

    return (
      <>
        <h3 className="text-lg font-medium mt-6 mb-2">{title}</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-700">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Aperçu du cours</h2>
        
        <div className="prose prose-blue max-w-none">
          {/* Description du cours */}
          <p className="text-gray-700 whitespace-pre-line">
            {course.description}
          </p>
          
          {/* Ce que vous allez apprendre */}
          {renderSection(
            "Ce que vous allez apprendre",
            course.ce_que_vous_allez_apprendre,
            [
              `Compréhension complète des fondamentaux de ${course.title}`,
              "Expérience pratique avec des exemples et exercices",
              "Meilleures pratiques et standards de l'industrie",
              "Comment appliquer ces concepts à des scénarios réels"
            ]
          )}
          
          {/* Prérequis */}
          {renderSection(
            "Prérequis",
            course.prerequis,
            [
              "Compréhension de base des concepts de programmation",
              "Un ordinateur avec accès à Internet",
              "Enthousiasme pour apprendre et pratiquer"
            ]
          )}
          
          {/* Public cible */}
          {renderSection(
            "Ce cours est pour...",
            course.public_cible,
            [
              `Débutants qui veulent commencer avec ${course.title.split(' ').slice(-1)}`,
              "Apprenants intermédiaires qui veulent renforcer leurs compétences",
              "Toute personne intéressée par l'expansion de ses connaissances dans ce domaine"
            ]
          )}

          {/* Informations supplémentaires */}
          {(course.duree_estimee || course.niveau_difficulte) && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Informations du cours</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.duree_estimee && (
                  <div>
                    <span className="font-medium text-gray-700">Durée estimée :</span>
                    <span className="ml-2 text-gray-600">{course.duree_estimee}</span>
                  </div>
                )}
                {course.niveau_difficulte && (
                  <div>
                    <span className="font-medium text-gray-700">Niveau :</span>
                    <span className="ml-2 text-gray-600 capitalize">
                      {course.niveau_difficulte === 'debutant' && 'Débutant'}
                      {course.niveau_difficulte === 'intermediaire' && 'Intermédiaire'}
                      {course.niveau_difficulte === 'avance' && 'Avancé'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 