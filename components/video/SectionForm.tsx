'use client';

import { useState, useRef } from 'react';
import { VideoSection, VideoChapter } from '@/lib/types/vdocipher';
import Image from 'next/image';

interface SectionFormProps {
  section: VideoSection;
  sectionIndex: number;
  onSectionChange: (index: number, updatedSection: VideoSection) => void;
  onRemoveSection: (index: number) => void;
  canRemove: boolean;
}

export function SectionForm({
  section,
  sectionIndex,
  onSectionChange,
  onRemoveSection,
  canRemove
}: SectionFormProps) {
  const [currentChapter, setCurrentChapter] = useState<Omit<VideoChapter, 'id'> & { 
    startTimeFormatted: string; 
    durationFormatted: string; 
  }>({
    title: '',
    startTime: 0,
    startTimeFormatted: '00:00',
    duration: undefined,
    durationFormatted: '',
    description: undefined,
    thumbnail: undefined,
    flashcard: false
  });

  const videoInputRef = useRef<HTMLInputElement>(null);

  const updateSection = (updates: Partial<VideoSection>) => {
    onSectionChange(sectionIndex, { ...section, ...updates });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSection({ title: e.target.value });
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateSection({ videoFile: file });
      console.log(`Section ${sectionIndex} - Vidéo sélectionnée:`, file.name, 'Taille:', file.size);
    }
  };

  const handleAiGeneratedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSection({ aiGeneratedChapters: e.target.checked });
  };

  const handleChapterInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const target = e.target as HTMLInputElement;

    if (name === 'flashcard' && target.type === 'checkbox') {
      setCurrentChapter(prev => ({
        ...prev,
        flashcard: target.checked
      }));
      return;
    }

    if (name === 'startTimeFormatted') {
      setCurrentChapter(prev => ({
        ...prev,
        startTimeFormatted: value,
        startTime: timeToSeconds(value)
      }));
    } else if (name === 'durationFormatted') {
      setCurrentChapter(prev => ({
        ...prev,
        durationFormatted: value,
        duration: value ? timeToSeconds(value) : undefined
      }));
    } else {
      setCurrentChapter(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addChapter = () => {
    if (!currentChapter.title) {
      alert('Le titre du chapitre est obligatoire');
      return;
    }
    
    const newChapter: VideoChapter = {
      id: crypto.randomUUID(),
      title: currentChapter.title,
      startTime: currentChapter.startTime,
      duration: currentChapter.duration,
      description: currentChapter.description,
      thumbnail: currentChapter.thumbnail,
      flashcard: !!currentChapter.flashcard
    };
    
    const updatedChapters = [...section.chapters, newChapter];
    updateSection({ chapters: updatedChapters });
    
    // Calculate next logical start time based on the end of this chapter
    const nextStartTime = currentChapter.startTime + (currentChapter.duration || 300);
    const nextStartTimeFormatted = formatTime(nextStartTime);
    
    setCurrentChapter({
      title: '',
      startTime: nextStartTime,
      startTimeFormatted: nextStartTimeFormatted,
      duration: undefined,
      durationFormatted: '',
      description: undefined,
      thumbnail: undefined,
      flashcard: false
    });
  };

  const removeChapter = (chapterId: string) => {
    const updatedChapters = section.chapters.filter(chapter => chapter.id !== chapterId);
    updateSection({ chapters: updatedChapters });
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const timeToSeconds = (timeString: string): number => {
    const parts = timeString.split(':').map(part => parseInt(part, 10));
    
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 1 && !isNaN(parts[0])) {
      return parts[0];
    }
    return 0;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <span className="mr-3">🎬</span>
          Section {sectionIndex + 1}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemoveSection(sectionIndex)}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            🗑️ Supprimer
          </button>
        )}
      </div>

             {/* Enhanced Upload Progress */}
       {section.status !== 'pending' && section.status !== 'completed' && (
         <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
           <div className="flex items-center justify-between mb-2">
             <div className="flex items-center">
               <div className="mr-2">
                 {section.status === 'uploading' && '📤'}
                 {section.status === 'processing' && '⚙️'}
                 {section.status === 'transcribing' && '🎤'}
                 {section.status === 'translating' && '🌍'}
                 {section.status === 'error' && '❌'}
               </div>
               <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                 Section {sectionIndex + 1}: {section.currentStep}
               </span>
             </div>
             <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
               {section.uploadProgress}%
             </span>
           </div>
           <div className="w-full bg-blue-200 rounded-full h-3 dark:bg-blue-800">
             <div 
               className={`h-3 rounded-full transition-all duration-300 ${
                 section.status === 'error' 
                   ? 'bg-red-500' 
                   : 'bg-gradient-to-r from-blue-500 to-blue-600'
               }`}
               style={{ width: `${section.uploadProgress}%` }}
             ></div>
           </div>
           {section.error && (
             <div className="mt-2 text-sm text-red-600 dark:text-red-400">
               Erreur: {section.error}
             </div>
           )}
         </div>
       )}

       {/* Completion Status */}
       {section.status === 'completed' && (
         <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
           <div className="flex items-center">
             <span className="mr-2">✅</span>
             <span className="text-sm font-medium text-green-700 dark:text-green-300">
               Section {sectionIndex + 1} terminée avec succès
             </span>
           </div>
         </div>
       )}

      <div className="space-y-6">
        {/* Section Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Titre de la section *
          </label>
          <input
            type="text"
            value={section.title}
            onChange={handleTitleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
            placeholder={`Ex: Introduction - Partie ${sectionIndex + 1}`}
          />
        </div>

        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vidéo de la section *
          </label>
          <input
            type="file"
            ref={videoInputRef}
            onChange={handleVideoChange}
            accept="video/*"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
          />
          {section.videoFile && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Vidéo sélectionnée: {section.videoFile.name} ({(section.videoFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* AI Generated Chapters Toggle */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl dark:border-gray-700">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={section.aiGeneratedChapters}
              onChange={handleAiGeneratedChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Générer les chapitres automatiquement avec l&apos;IA
            </span>
          </label>
          {section.aiGeneratedChapters && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Les chapitres seront générés à partir de la transcription.
            </span>
          )}
        </div>
        

        {/* Chapter List */}
        {section.chapters.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Chapitres ({section.chapters.length})
            </h4>
            
            <div className="border rounded-xl overflow-hidden dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Titre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Début
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Durée
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                  {section.chapters.map((chapter) => (
                    <tr key={chapter.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {chapter.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatTime(chapter.startTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {chapter.duration ? formatTime(chapter.duration) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {chapter.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => removeChapter(chapter.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
