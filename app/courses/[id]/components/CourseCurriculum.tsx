'use client';

import { useState } from 'react';
import { Section } from '@/lib/supabase/types';
import { ChevronIcon, PlayIcon } from '../../components/Icons';

interface CourseCurriculumProps {
  sections: Section[];
}

export function CourseCurriculum({ sections }: CourseCurriculumProps) {
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
    sections.length > 0 ? sections[0].id : null
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSectionId(prevId => (prevId === sectionId ? null : sectionId));
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Programme du cours</h2>
        
        {sections.length === 0 ? (
          <div className="text-gray-600 text-center py-6">
            Aucune section disponible pour ce cours pour le moment.
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div 
                key={section.id} 
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  aria-expanded={expandedSectionId === section.id}
                  aria-controls={`section-content-${section.id}`}
                >
                  <div className="flex items-center">
                    <span className="text-blue-600 font-semibold mr-2">{index + 1}.</span>
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <div className="flex items-center">
                    {section.duration && (
                      <span className="text-sm text-gray-600 mr-3">
                        {formatDuration(section.duration)}
                      </span>
                    )}
                    <ChevronIcon 
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        expandedSectionId === section.id ? 'transform rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>
                
                {expandedSectionId === section.id && (
                  <div 
                    id={`section-content-${section.id}`}
                    className="p-4 border-t border-gray-200"
                  >
                    {/* Here you would normally render lesson content or a preview */}
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <div className="mr-4 text-blue-600">
                        <PlayIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-medium">{section.title} Vidéo</div>
                        <div className="text-sm text-gray-600">
                          {formatDuration(section.duration)}
                        </div>
                      </div>
                      <div className="ml-auto text-sm text-gray-500">Aperçu</div>
                    </div>
                    
                    {/* Additional lesson content would go here */}
                    <div className="mt-3 text-sm text-gray-600">
                      <p>Cette section couvre les concepts fondamentaux et les applications pratiques.</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <div className="text-gray-700 text-sm mb-2">
            {sections.length} sections • {Math.round(
              sections.reduce((total, section) => total + (section.duration || 0), 0) / 60
            )} minutes totales
          </div>
          <button className="text-blue-600 font-medium text-sm hover:text-blue-800">
            Développer toutes les sections
          </button>
        </div>
      </div>
    </div>
  );
} 