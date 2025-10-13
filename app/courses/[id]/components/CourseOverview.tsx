import { Course } from '@/lib/supabase/types';

interface CourseOverviewProps {
  course: Course;
}

export function CourseOverview({ course }: CourseOverviewProps) {
  // Fonction pour convertir le texte en liste d'éléments
  const parseTextToList = (text: string | undefined): string[] => {
    if (!text) return [];
    // Divise le texte par les retours à la ligne et filtre les lignes vides
    return text.split('\n').filter((line) => line.trim().length > 0);
  };

  // Icônes pour différents types de contenu
  const getIconForItem = (item: string, index: number) => {
    const icons = ['📘', '🔢', '📐', '🎲', '✨', '🎯', '🌟', '💡'];

    // Assigner des icônes basées sur le contenu
    if (
      item.toLowerCase().includes('mathématique') ||
      item.toLowerCase().includes('calcul') ||
      item.toLowerCase().includes('nombre')
    )
      return '🔢';
    if (item.toLowerCase().includes('géométrie') || item.toLowerCase().includes('forme'))
      return '📐';
    if (item.toLowerCase().includes('jeu') || item.toLowerCase().includes('ludique')) return '🎲';
    if (item.toLowerCase().includes('pratique') || item.toLowerCase().includes('exercice'))
      return '✨';
    if (item.toLowerCase().includes('objectif') || item.toLowerCase().includes('but')) return '🎯';

    // Sinon, utiliser l'icône par défaut basée sur l'index
    return icons[index % icons.length];
  };

  // Fonction pour afficher une section avec des données réelles ou un fallback
  const renderSection = (
    title: string,
    data: string | undefined,
    fallbackItems: string[],
    isLearningSection = false
  ) => {
    const items = data ? parseTextToList(data) : fallbackItems;

    if (items.length === 0) return null;

    const sectionIcon = title.includes('apprendre')
      ? '🎓'
      : title.includes('Prérequis')
        ? '📋'
        : title.includes('pour')
          ? '👥'
          : '📝';

    if (isLearningSection) {
      return (
        <div className="mt-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-3xl">{sectionIcon}</span>
            <h3 className="text-2xl font-bold text-sky-700">{title}</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="transform rounded-xl border-2 border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 p-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex-shrink-0 text-2xl">{getIconForItem(item, index)}</span>
                  <p className="font-medium leading-relaxed text-gray-800">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-2xl">{sectionIcon}</span>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        </div>
        <div className="rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 text-lg">{getIconForItem(item, index)}</span>
                <span className="leading-relaxed text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Description du cours */}
      <div className="rounded-2xl border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-3xl">📖</span>
          <h2 className="text-2xl font-bold text-orange-700">À propos de ce cours</h2>
        </div>
        <p className="whitespace-pre-line text-lg leading-relaxed text-gray-800">
          {course.description}
        </p>
      </div>

      {/* Ce que vous allez apprendre */}
      {renderSection(
        'Ce que vous allez apprendre',
        course.ce_que_vous_allez_apprendre,
        [
          `Maîtriser les concepts essentiels de ${course.title}`,
          'Résoudre des exercices pratiques et amusants',
          'Développer ta confiance en mathématiques',
          'Appliquer tes nouvelles compétences au quotidien',
        ],
        true
      )}

      {/* Prérequis */}
      {renderSection('Prérequis', course.prerequis, [
        'Savoir lire et écrire',
        "Avoir envie d'apprendre et de s'amuser",
        'Un cahier et un crayon pour prendre des notes',
      ])}

      {/* Public cible */}
      {renderSection('Ce cours est parfait pour...', course.public_cible, [
        "Les élèves du primaire curieux d'apprendre",
        'Ceux qui veulent améliorer leurs résultats scolaires',
        'Les enfants qui aiment les défis amusants',
        'Tous ceux qui veulent découvrir la magie des mathématiques',
      ])}

      {/* Informations supplémentaires */}
      {(course.duree_estimee || course.niveau_difficulte) && (
        <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <h3 className="text-xl font-bold text-purple-700">Informations du cours</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {course.duree_estimee && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏰</span>
                <div>
                  <div className="text-sm text-gray-600">Durée estimée</div>
                  <div className="font-bold text-gray-800">{course.duree_estimee}</div>
                </div>
              </div>
            )}
            {course.niveau_difficulte && (
              <div className="flex items-center gap-3">
                <span className="text-2xl">📈</span>
                <div>
                  <div className="text-sm text-gray-600">Niveau</div>
                  <div className="font-bold text-gray-800">
                    {course.niveau_difficulte === 'debutant' && '🌱 Débutant'}
                    {course.niveau_difficulte === 'intermediaire' && '🌿 Intermédiaire'}
                    {course.niveau_difficulte === 'avance' && '🌳 Avancé'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
