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
  canRemove,
}: SectionFormProps) {
  const [currentChapter, setCurrentChapter] = useState<
    Omit<VideoChapter, 'id'> & {
      startTimeFormatted: string;
      durationFormatted: string;
    }
  >({
    title: '',
    startTime: 0,
    startTimeFormatted: '00:00',
    duration: undefined,
    durationFormatted: '',
    description: undefined,
    thumbnail: undefined,
    flashcard: false,
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

  const handleChapterInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const target = e.target as HTMLInputElement;

    if (name === 'flashcard' && target.type === 'checkbox') {
      setCurrentChapter((prev) => ({
        ...prev,
        flashcard: target.checked,
      }));
      return;
    }

    if (name === 'startTimeFormatted') {
      setCurrentChapter((prev) => ({
        ...prev,
        startTimeFormatted: value,
        startTime: timeToSeconds(value),
      }));
    } else if (name === 'durationFormatted') {
      setCurrentChapter((prev) => ({
        ...prev,
        durationFormatted: value,
        duration: value ? timeToSeconds(value) : undefined,
      }));
    } else {
      setCurrentChapter((prev) => ({
        ...prev,
        [name]: value,
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
      flashcard: !!currentChapter.flashcard,
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
      flashcard: false,
    });
  };

  const removeChapter = (chapterId: string) => {
    const updatedChapters = section.chapters.filter((chapter) => chapter.id !== chapterId);
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
    const parts = timeString.split(':').map((part) => parseInt(part, 10));

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
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="flex items-center text-xl font-bold text-gray-900 dark:text-white">
          <span className="mr-3">🎬</span>
          Section {sectionIndex + 1}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemoveSection(sectionIndex)}
            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-800 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
          >
            🗑️ Supprimer
          </button>
        )}
      </div>

      {/* Enhanced Upload Progress */}
      {section.status !== 'pending' && section.status !== 'completed' && (
        <div className="mb-6 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="mb-2 flex items-center justify-between">
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
          <div className="h-3 w-full rounded-full bg-blue-200 dark:bg-blue-800">
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
        <div className="mb-6 rounded-lg border-l-4 border-green-500 bg-green-50 p-4 dark:bg-green-900/20">
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
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Titre de la section *
          </label>
          <input
            type="text"
            value={section.title}
            onChange={handleTitleChange}
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder={`Ex: Introduction - Partie ${sectionIndex + 1}`}
          />
        </div>

        {/* Video Upload */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Vidéo de la section *
          </label>
          <input
            type="file"
            ref={videoInputRef}
            onChange={handleVideoChange}
            accept="video/*"
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          {section.videoFile && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Vidéo sélectionnée: {section.videoFile.name} (
              {(section.videoFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {/* Chapter List */}
        {section.chapters.length > 0 && (
          <div className="mt-6">
            <h4 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Chapitres ({section.chapters.length})
            </h4>

            <div className="overflow-hidden rounded-xl border dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      Titre
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      Début
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      Durée
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {section.chapters.map((chapter) => (
                    <tr key={chapter.id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {chapter.title}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatTime(chapter.startTime)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {chapter.duration ? formatTime(chapter.duration) : '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {chapter.description || '-'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
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
