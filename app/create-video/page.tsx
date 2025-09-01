'use client';

import { useState, useRef } from 'react';
import { PageLayout, Container, Section } from '@/components/layout';
import { useAuth } from '@/lib/auth/hooks';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { VideoChapter, VideoSection } from '@/lib/types/vdocipher';
import { SectionForm } from '@/components/video/SectionForm';
import Image from 'next/image';
// import { useToast, ToastContainer } from '../../../components/ui/Toast';

export default function CreateVideoPage() {
  const { user, dbUser, loading } = useAuth();
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Initialize all state hooks first (React hooks must be called in the same order)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isFeatured: false,
    aiGenerated: false,
    thumbnailUrl: '',
    thumbnailDescription: '',
    primary_language: 'fr' as 'fr' | 'en' | 'es',
    // Nouveaux champs
    ceQueVousAllezApprendre: '',
    prerequis: '',
    publicCible: '',
    dureeEstimee: '',
    niveauDifficulte: 'debutant' as 'debutant' | 'intermediaire' | 'avance',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  // Replace single video management with sections management
  const [sections, setSections] = useState<VideoSection[]>([
    {
      id: crypto.randomUUID(),
      title: '',
      videoFile: null,
      aiGeneratedChapters: false,
      chapters: [],
      uploadProgress: 0,
      status: 'pending',
      currentStep: 'En attente',
    },
  ]);

  const [translationProgress, setTranslationProgress] = useState(0);
  const translationProgressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Temporary toast replacements
  const success = (message: string) => {
    console.log('Success:', message);
    alert(message);
  };
  const error = (message: string) => {
    console.error('Error:', message);
    alert('Erreur: ' + message);
  };

  // Check authorization - only admins and creators can create courses
  if (loading) {
    return (
      <PageLayout>
        <Section className="py-8">
          <Container>
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
            </div>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  if (!user || !dbUser) {
    return (
      <PageLayout>
        <Section className="py-8">
          <Container>
            <div className="p-8 text-center">
              <div className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
                Non authentifié
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Veuillez vous connecter pour créer un cours.
              </p>
            </div>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  if (!['admin', 'teacher'].includes(dbUser.role)) {
    return (
      <PageLayout>
        <Section className="py-8">
          <Container>
            <div className="p-8 text-center">
              <div className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-300">
                Accès non autorisé
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Seuls les administrateurs et les enseignants peuvent créer des cours.
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                Votre rôle actuel: {dbUser.role}
              </p>
            </div>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Section management functions
  const addSection = () => {
    const newSection: VideoSection = {
      id: crypto.randomUUID(),
      title: '',
      videoFile: null,
      aiGeneratedChapters: false,
      chapters: [],
      uploadProgress: 0,
      status: 'pending',
      currentStep: 'En attente',
    };
    setSections((prev) => [...prev, newSection]);
  };

  const removeSection = (index: number) => {
    if (sections.length > 1) {
      setSections((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateSection = (index: number, updatedSection: VideoSection) => {
    setSections((prev) => prev.map((section, i) => (i === index ? updatedSection : section)));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedThumbnail(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadVideoToVdoCipher = async (
    file: File,
    title: string,
    onProgress: (progress: number) => void
  ): Promise<string> => {
    try {
      // STEP 1: Obtain upload credentials (align with test page behavior)
      console.log('VDOCIPHER: Requesting upload credentials...');
      onProgress(10);

      const credentialsResponse = await fetch('/api/upload-video/vdocipher-credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title?.trim() || 'Untitled video',
          folderId: 'root',
        }),
      });

      if (!credentialsResponse.ok) {
        const errorText = await credentialsResponse.text();
        throw new Error(`Credentials request failed: ${credentialsResponse.status} - ${errorText}`);
      }

      const { clientPayload, videoId } = await credentialsResponse.json();
      console.log('VDOCIPHER: Upload credentials received', { videoId });
      onProgress(25);

      // STEP 2: Upload file to VdoCipher
      console.log('VDOCIPHER: Uploading file to VdoCipher...');
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('uploadCredentials', JSON.stringify(clientPayload));

      const uploadResponse = await fetch('/api/upload-video/vdocipher-upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      // Even if the endpoint returns a body, we don't need it here; align with test page behavior
      try {
        await uploadResponse.json();
      } catch (_) {
        // Ignore non-JSON responses gracefully
      }

      console.log('VDOCIPHER: Upload completed');
      onProgress(50);

      // STEP 3: Monitor processing status (limit to ~10 minutes like test page)
      console.log('VDOCIPHER: Monitoring processing status (up to ~10 minutes)...');
      let videoReady = false;
      let attempts = 0;
      const maxAttempts = 60; // 10 minutes @ 10s interval
      const checkInterval = 10000; // 10 seconds
      const startTime = Date.now();

      while (!videoReady && attempts < maxAttempts) {
        attempts++;
        const elapsedTime = Date.now() - startTime;
        const elapsedMinutes = (elapsedTime / (1000 * 60)).toFixed(1);

        // Progress from 50% -> 90%
        const progressPercent = 50 + (attempts / maxAttempts) * 40;
        onProgress(progressPercent);

        if (attempts > 1) {
          await new Promise((resolve) => setTimeout(resolve, checkInterval));
        }

        const statusResponse = await fetch(
          `/api/upload-video/vdocipher-status?videoId=${videoId}`,
          { method: 'GET' }
        );

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          console.warn('VDOCIPHER: Status check failed', {
            status: statusResponse.status,
            error: errorText,
          });
          continue;
        }

        const statusData = await statusResponse.json();
        console.log('VDOCIPHER: Status check', {
          attempt: attempts,
          ...statusData,
          elapsedMinutes,
        });

        if (statusData.isReady) {
          videoReady = true;
          console.log(`VDOCIPHER: Video is ready after ${elapsedMinutes} minutes`);
        } else if (statusData.status === 'Error' || statusData.status === 'Failed') {
          throw new Error(`Video processing failed with status: ${statusData.status}`);
        }
      }

      if (!videoReady) {
        const elapsedMinutes = ((Date.now() - startTime) / (1000 * 60)).toFixed(1);
        console.warn(
          `VDOCIPHER: Video still processing after ${elapsedMinutes} minutes. Proceeding with course creation; processing continues in background.`
        );
      }

      onProgress(100);
      return videoId; // Use videoId as playback_id
    } catch (err) {
      console.error('VDOCIPHER: Upload error', err);
      throw err;
    }
  };

  const uploadThumbnail = async (file: File): Promise<string> => {
    console.log('Starting thumbnail upload for file:', file.name, 'Size:', file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Le fichier doit être une image');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("L'image doit faire moins de 5MB");
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `course-thumbnails/${fileName}`;

    console.log('Uploading to path:', filePath);
    console.log('User role:', dbUser?.role);
    console.log('User ID:', user?.id);

    const { data, error: uploadError } = await supabase.storage
      .from('course-thumbnails')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      throw new Error(`Erreur lors de l'upload de la thumbnail: ${uploadError.message}`);
    }

    console.log('Upload successful:', data);

    const {
      data: { publicUrl },
    } = supabase.storage.from('course-thumbnails').getPublicUrl(filePath);

    console.log('Generated public URL:', publicUrl);
    return publicUrl;
  };

  const updateSectionStatus = (sectionIndex: number, updates: Partial<VideoSection>) => {
    setSections((prev) =>
      prev.map((section, i) => (i === sectionIndex ? { ...section, ...updates } : section))
    );
  };

  const getVideoDurationFromFile = async (file: File): Promise<number> => {
    return new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(file);
        const videoEl = document.createElement('video');
        videoEl.preload = 'metadata';
        videoEl.onloadedmetadata = () => {
          const durationSec = videoEl.duration;
          URL.revokeObjectURL(url);
          if (!isNaN(durationSec) && isFinite(durationSec) && durationSec > 0) {
            const durationMinutes = Math.max(1, Math.round(durationSec / 60));
            console.log('LOCAL DURATION: Extracted from file', {
              seconds: durationSec,
              minutes: durationMinutes,
            });
            resolve(durationMinutes);
          } else {
            resolve(1); // Fallback: 1 minute
          }
        };
        videoEl.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(1); // Fallback: 1 minute
        };
        videoEl.src = url;
      } catch (error) {
        console.warn('LOCAL DURATION: Error extracting duration from file', error);
        resolve(1); // Fallback: 1 minute
      }
    });
  };

  const processSection = async (
    section: VideoSection,
    sectionIndex: number,
    totalSections: number
  ): Promise<{ playbackId: string; chapters: VideoChapter[]; duration?: number }> => {
    if (!section.videoFile) {
      throw new Error('Aucun fichier vidéo sélectionné');
    }

    try {
      // Step 0: Try to get duration from local file first
      const localDurationMinutes = await getVideoDurationFromFile(section.videoFile);
      console.log('DURATION: Local file analysis result', { minutes: localDurationMinutes });
      // Step 1: Upload video to VdoCipher
      updateSectionStatus(sectionIndex, {
        status: 'uploading',
        currentStep: 'Upload de la vidéo...',
        uploadProgress: 0,
      });

      const videoPlaybackId = await uploadVideoToVdoCipher(
        section.videoFile,
        section.title,
        (progress) => {
          updateSectionStatus(sectionIndex, {
            uploadProgress: Math.round(progress * 0.4), // 40% for video upload
            currentStep: `Upload de la vidéo... ${Math.round(progress)}%`,
          });
        }
      );

      updateSectionStatus(sectionIndex, {
        playbackId: videoPlaybackId,
        status: 'processing',
        currentStep: 'Vidéo uploadée, obtention de la durée...',
        uploadProgress: 40,
      });

      // Step 1.5: Get video duration (prefer local, fallback to VdoCipher)
      let videoDurationMinutes: number = localDurationMinutes; // Use local duration as primary

      // If local duration is the fallback value (1), try to get from VdoCipher
      if (localDurationMinutes === 1) {
        try {
          const statusResponse = await fetch(
            `/api/upload-video/vdocipher-status?videoId=${videoPlaybackId}`,
            { method: 'GET' }
          );
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            if (typeof statusData.duration === 'number' && statusData.duration > 0) {
              // Convert from seconds to minutes and ensure minimum of 1 minute
              videoDurationMinutes = Math.max(1, Math.round(statusData.duration / 60));
              console.log('DURATION: Got duration from VdoCipher', {
                seconds: statusData.duration,
                minutes: videoDurationMinutes,
              });
            }
          }
        } catch (durationError) {
          console.warn(
            'DURATION: Could not get duration from VdoCipher, using local duration',
            durationError
          );
        }
      }

      console.log('DURATION: Final duration for section', {
        minutes: videoDurationMinutes,
        source: localDurationMinutes > 1 ? 'local' : 'vdocipher',
      });

      updateSectionStatus(sectionIndex, {
        currentStep: 'Durée obtenue, génération des sous-titres...',
        uploadProgress: 45,
      });

      // Step 2: Generate captions via Deepgram
      updateSectionStatus(sectionIndex, {
        status: 'transcribing',
        currentStep: 'Génération des sous-titres...',
        uploadProgress: 50,
      });

      // We need a temporary courseId for storage path - we'll use a placeholder
      const tempCourseId = 'temp_' + crypto.randomUUID();
      const tempSectionId = section.id;

      const form = new FormData();
      form.append('file', section.videoFile);
      form.append('format', 'vtt');
      form.append('language', formData.primary_language);
      form.append('courseId', tempCourseId);
      form.append('sectionId', tempSectionId);
      form.append('videoId', videoPlaybackId);

      const capRes = await fetch('/api/upload-video/deepgram-captions', {
        method: 'POST',
        body: form,
      });

      if (!capRes.ok) {
        const t = await capRes.text();
        throw new Error(`Erreur lors de la génération des sous-titres: ${t}`);
      }

      const captionData = await capRes.json();
      console.log('CAPTIONS: Generated for section', tempSectionId);

      updateSectionStatus(sectionIndex, {
        currentStep: 'Sous-titres générés...',
        uploadProgress: 65,
      });

      // Step 3: Generate AI chapters if requested
      let generatedChapters: VideoChapter[] = section.chapters;

      if (section.aiGeneratedChapters && captionData?.captions) {
        updateSectionStatus(sectionIndex, {
          currentStep: 'Génération des chapitres IA...',
          uploadProgress: 70,
        });

        try {
          const genRes = await fetch('/api/upload-video/generate-chapters', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              captions: String(captionData.captions),
              language: formData.primary_language,
            }),
          });

          if (genRes.ok) {
            const { chapters: aiChapters } = await genRes.json();
            if (Array.isArray(aiChapters)) {
              generatedChapters = aiChapters.map((c: any) => ({
                id: crypto.randomUUID(),
                title: String(c.title || '').trim(),
                startTime: Math.max(0, Math.floor(Number(c.startTime) || 0)),
                duration:
                  c.duration != null ? Math.max(1, Math.floor(Number(c.duration))) : undefined,
                description: c.description != null ? String(c.description) : undefined,
                flashcard: typeof c.flashcard === 'boolean' ? c.flashcard : false,
              }));

              // Update the section with AI-generated chapters
              updateSectionStatus(sectionIndex, { chapters: generatedChapters });
              console.log('CHAPTERS: AI chapters generated for section', section.title);
            }
          }
        } catch (genErr) {
          console.warn('CHAPTERS: Error during AI generation', genErr);
        }
      }

      updateSectionStatus(sectionIndex, {
        currentStep: 'Chapitres traités...',
        uploadProgress: 80,
      });

      // Step 4: Translate captions
      updateSectionStatus(sectionIndex, {
        status: 'translating',
        currentStep: 'Traduction des sous-titres...',
        uploadProgress: 85,
      });

      try {
        const translateRes = await fetch('/api/upload-video/translate-and-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: tempCourseId,
            sectionId: tempSectionId,
            videoId: videoPlaybackId,
            sourceLanguage: formData.primary_language,
          }),
        });

        if (translateRes.ok) {
          console.log('CAPTIONS: Translation completed for section', section.title);
        }
      } catch (trErr) {
        console.warn('CAPTIONS: Error in translate/upload step', trErr);
      }

      // Step 5: Complete
      updateSectionStatus(sectionIndex, {
        status: 'completed',
        currentStep: 'Section terminée',
        uploadProgress: 100,
      });

      return {
        playbackId: videoPlaybackId,
        chapters: generatedChapters,
        duration: videoDurationMinutes, // Duration in minutes for database
      };
    } catch (error) {
      updateSectionStatus(sectionIndex, {
        status: 'error',
        currentStep: 'Erreur',
        uploadProgress: 0,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      });
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate sections
    const validSections = sections.filter((section) => section.title.trim() && section.videoFile);

    if (validSections.length === 0) {
      error('Au moins une section avec un titre et une vidéo est requise');
      return;
    }

    setIsSubmitting(true);
    // Ensure the user sees the progress bar by scrolling to the top smoothly
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setUploadProgress(0);

    try {
      let thumbnailUrl = formData.thumbnailUrl;

      // Step 1: Upload thumbnail if selected
      if (selectedThumbnail) {
        setUploadProgress(5);
        thumbnailUrl = await uploadThumbnail(selectedThumbnail);
        setUploadProgress(10);
      }

      // Step 2: Process all sections sequentially
      console.log(`Starting processing of ${validSections.length} sections...`);
      const processedSections: Array<{
        originalSection: VideoSection;
        playbackId: string;
        chapters: VideoChapter[];
        duration?: number;
      }> = [];

      const sectionProgressWeight = 80 / validSections.length; // 80% total for sections processing

      for (let i = 0; i < validSections.length; i++) {
        const section = validSections[i];
        const sectionIndex = sections.findIndex((s) => s.id === section.id);

        console.log(`Processing section ${i + 1}/${validSections.length}: ${section.title}`);

        try {
          const result = await processSection(section, sectionIndex, validSections.length);
          processedSections.push({
            originalSection: section,
            ...result,
          });

          // Update overall progress
          const currentProgress = 10 + (i + 1) * sectionProgressWeight;
          setUploadProgress(Math.round(currentProgress));
        } catch (sectionError) {
          console.error(`Error processing section ${section.title}:`, sectionError);
          error(
            `Erreur lors du traitement de la section "${section.title}": ${sectionError instanceof Error ? sectionError.message : 'Erreur inconnue'}`
          );
          throw sectionError;
        }
      }

      console.log('All sections processed successfully. Creating course...');
      setUploadProgress(90);

      // Step 3: Create course in database with all section data
      const courseInsertPayload: Record<string, any> = {
        title: formData.title,
        description: formData.description,
        thumbnail_url: thumbnailUrl || null,
        creator_id: user.id,
        is_featured: formData.isFeatured,
        ce_que_vous_allez_apprendre: formData.ceQueVousAllezApprendre || null,
        niveau_difficulte: formData.niveauDifficulte,
      };

      let { data: course, error: courseError } = await supabase
        .from('courses')
        .insert(courseInsertPayload)
        .select()
        .single();

      if (courseError) {
        console.error('Course insert error details:', courseError);
        throw new Error('Erreur lors de la création du cours');
      }

      console.log('Course created:', course.id);
      setUploadProgress(95);

      // Step 4: Create all sections in database
      const sectionInserts = processedSections.map((processedSection, index) => {
        const duration =
          processedSection.duration && processedSection.duration > 0
            ? processedSection.duration
            : 1;
        console.log(
          `SECTION INSERT: Section ${index + 1} - Duration: ${duration} minutes (original: ${processedSection.duration})`
        );

        return {
          course_id: course.id,
          title: processedSection.originalSection.title,
          section_number: index + 1,
          playback_id: processedSection.playbackId,
          chapters:
            processedSection.chapters.length > 0 ? JSON.stringify(processedSection.chapters) : '[]',
          duration: duration, // Duration in minutes, guaranteed to be a positive number
        };
      });

      const { data: createdSections, error: sectionsError } = await supabase
        .from('sections')
        .insert(sectionInserts)
        .select();

      if (sectionsError) {
        console.error('Sections insert error:', sectionsError);
        throw new Error('Erreur lors de la création des sections');
      }

      console.log(`Created ${createdSections.length} sections in database`);

      // Step 4.5: Move captions from temporary sectionId to real DB sectionId
      try {
        console.log('Attempting to move captions from temp sectionIds to DB sectionIds...');
        for (let i = 0; i < processedSections.length; i++) {
          const tempSectionId = processedSections[i].originalSection.id; // temporary client-side id
          const dbSection = createdSections[i]; // assumes same order
          if (!dbSection?.id) continue;
          const fromPath = `${tempSectionId}/captions.vtt`;
          const toPath = `${dbSection.id}/captions.vtt`;
          if (fromPath === toPath) continue;
          const { data: moveResult, error: moveError } = await supabase.storage
            .from('translations')
            .move(fromPath, toPath);
          if (moveError) {
            console.warn('CAPTIONS MOVE: Failed to move captions', {
              fromPath,
              toPath,
              error: moveError.message,
            });
          } else {
            console.log('CAPTIONS MOVE: Moved captions', { fromPath, toPath, result: moveResult });
          }
        }
      } catch (moveErr) {
        console.warn('CAPTIONS MOVE: Error while moving captions to DB section ids', moveErr);
      }

      // Step 4.6: Generate and store mixed questions for each section (max 8)
      try {
        console.log('QUESTIONS: Generating mixed questions for each section...');
        for (let i = 0; i < createdSections.length; i++) {
          const dbSection = createdSections[i];
          if (!dbSection?.id) continue;
          try {
            const res = await fetch('/api/video/generate-questions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sectionId: dbSection.id, maxQuestions: 8 }),
            });
            if (!res.ok) {
              console.warn(
                'QUESTIONS: Generation failed for section',
                dbSection.id,
                await res.text()
              );
              continue;
            }
            const data = await res.json();
            const questions = Array.isArray(data?.questions) ? data.questions : [];
            const payload = {
              questions: questions.length > 0 ? JSON.stringify(questions.slice(0, 8)) : '[]',
            } as Record<string, any>;
            const { error: qUpdateError } = await supabase
              .from('sections')
              .update(payload)
              .eq('id', dbSection.id);
            if (qUpdateError) {
              console.warn('QUESTIONS: Failed to save questions', {
                sectionId: dbSection.id,
                error: qUpdateError.message,
              });
            } else {
              console.log('QUESTIONS: Saved questions for section', dbSection.id);
            }
          } catch (qErr) {
            console.warn(
              'QUESTIONS: Error generating/saving questions for section',
              dbSection?.id,
              qErr
            );
          }
        }
      } catch (allQErr) {
        console.warn('QUESTIONS: Batch generation encountered an error', allQErr);
      }

      setUploadProgress(100);
      success(
        `Cours créé avec succès ! ${validSections.length} section(s) ont été uploadées sur VdoCipher et seront bientôt disponibles.`
      );

      // Redirect to courses page after successful creation
      router.push('/courses');

      // Reset form
      setFormData({
        title: '',
        description: '',
        isFeatured: false,
        aiGenerated: false,
        thumbnailUrl: '',
        thumbnailDescription: '',
        primary_language: 'fr',
        ceQueVousAllezApprendre: '',
        prerequis: '',
        publicCible: '',
        dureeEstimee: '',
        niveauDifficulte: 'debutant',
      });
      setSelectedThumbnail(null);
      setThumbnailPreview('');
      setSections([
        {
          id: crypto.randomUUID(),
          title: '',
          videoFile: null,
          aiGeneratedChapters: false,
          chapters: [],
          uploadProgress: 0,
          status: 'pending',
          currentStep: 'En attente',
        },
      ]);
      setTranslationProgress(0);
    } catch (err) {
      console.error('Erreur lors de la création du cours:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      error('Erreur lors de la création du cours: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <PageLayout>
      <Section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Container>
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-12 text-center">
              <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
                Créer un nouveau cours
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Partagez vos connaissances avec le monde en créant un cours vidéo interactif
              </p>
            </div>

            {/* Enhanced Progress Bar */}
            {isSubmitting && (
              <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Création du cours en cours...
                  </span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>

                {/* Section Status Overview */}
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {sections
                    .filter((s) => s.title.trim() && s.videoFile)
                    .map((section, index) => (
                      <div
                        key={section.id}
                        className={`flex items-center rounded border p-2 text-xs ${
                          section.status === 'completed'
                            ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : section.status === 'error'
                              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
                              : section.status === 'pending'
                                ? 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
                                : 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                        }`}
                      >
                        <div className="mr-2">
                          {section.status === 'pending' && '⏳'}
                          {section.status === 'uploading' && '📤'}
                          {section.status === 'processing' && '⚙️'}
                          {section.status === 'transcribing' && '🎤'}
                          {section.status === 'translating' && '🌍'}
                          {section.status === 'completed' && '✅'}
                          {section.status === 'error' && '❌'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">Section {index + 1}</div>
                          <div className="truncate text-xs opacity-75">{section.currentStep}</div>
                        </div>
                        {section.status !== 'pending' && section.status !== 'completed' && (
                          <div className="ml-2 text-xs font-medium">{section.uploadProgress}%</div>
                        )}
                      </div>
                    ))}
                </div>

                {translationProgress > 0 && translationProgress < 100 && (
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Traduction des sous-titres...
                      </span>
                      <span className="text-xs text-purple-600 dark:text-purple-400">
                        {translationProgress}%
                      </span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-1 rounded-full bg-purple-500 transition-all duration-300"
                        style={{ width: `${translationProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
                <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
                  <span className="mr-3">📝</span>
                  Informations de base
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Titre du cours *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Ex: Introduction à React"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Décrivez votre cours..."
                    />
                  </div>

                  {/* Price field removed from schema */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Langue principale du cours *
                    </label>
                    <select
                      name="primary_language"
                      value={formData.primary_language}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="fr">Français</option>
                      <option value="en">Anglais</option>
                      <option value="es">Espagnol</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Niveau de difficulté
                    </label>
                    <select
                      name="niveauDifficulte"
                      value={formData.niveauDifficulte}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="debutant">Débutant</option>
                      <option value="intermediaire">Intermédiaire</option>
                      <option value="avance">Avancé</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Mettre en vedette ce cours
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Detailed Information Section */}
              <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
                <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
                  <span className="mr-3">📋</span>
                  Informations détaillées
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ce que vous allez apprendre
                    </label>
                    <textarea
                      name="ceQueVousAllezApprendre"
                      value={formData.ceQueVousAllezApprendre}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Listez les compétences que les étudiants acquerront..."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Prérequis
                    </label>
                    <textarea
                      name="prerequis"
                      value={formData.prerequis}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Quelles connaissances préalables sont nécessaires ?"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Public cible
                    </label>
                    <textarea
                      name="publicCible"
                      value={formData.publicCible}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="À qui s'adresse ce cours ?"
                    />
                  </div>
                </div>
              </div>

              {/* Thumbnail Section */}
              <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
                <h2 className="mb-6 flex items-center text-2xl font-bold text-gray-900 dark:text-white">
                  <span className="mr-3">🖼️</span>
                  Image de couverture
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      URL de l&apos;image
                    </label>
                    <input
                      type="url"
                      name="thumbnailUrl"
                      value={formData.thumbnailUrl}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ou télécharger une image
                    </label>
                    <input
                      type="file"
                      ref={thumbnailInputRef}
                      onChange={handleThumbnailChange}
                      accept="image/*"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {thumbnailPreview && (
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Aperçu
                      </label>
                      <div className="relative w-full max-w-md">
                        <Image
                          src={thumbnailPreview}
                          alt="Aperçu de la thumbnail"
                          width={400}
                          height={200}
                          className="h-48 w-full rounded-xl border border-gray-300 object-cover dark:border-gray-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sections Management */}
              <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
                    <span className="mr-3">🎬</span>
                    Sections du cours
                  </h2>
                  <button
                    type="button"
                    onClick={addSection}
                    className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    ➕ Ajouter une section
                  </button>
                </div>

                <div className="space-y-6">
                  {sections.map((section, index) => (
                    <SectionForm
                      key={section.id}
                      section={section}
                      sectionIndex={index}
                      onSectionChange={updateSection}
                      onRemoveSection={removeSection}
                      canRemove={sections.length > 1}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex transform items-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Création en cours...
                    </>
                  ) : (
                    'Créer le cours'
                  )}
                </button>
              </div>
            </form>
          </div>
        </Container>
      </Section>

      {/* Toast Container */}
      {/* <ToastContainer toasts={toasts} onRemove={removeToast} /> */}
    </PageLayout>
  );
}
