'use client';

import { useState, useRef } from 'react';
import { PageLayout, Container, Section } from '@/components/layout';
import { useAuth } from '@/lib/auth/hooks';

export default function TestVdoCipherUploadPage() {
  const { user, dbUser } = useAuth();
  
  const [title, setTitle] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const [captionResult, setCaptionResult] = useState<any>(null);
  
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Helper function to add logs
  const addLog = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage, data || '');
    setLogs(prev => [...prev, data ? `${logMessage} - ${JSON.stringify(data, null, 2)}` : logMessage]);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideo(file);
      addLog('Video file selected', {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        type: file.type
      });
    }
  };

  const testVdoCipherUpload = async () => {
    if (!selectedVideo || !title.trim()) {
      addLog('ERROR: Video file and title are required');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setResult(null);
    addLog('=== STARTING VDOCIPHER UPLOAD TEST ===');

    try {
      // STEP 1: Obtain upload credentials
      addLog('STEP 1: Requesting upload credentials from VdoCipher...');
      setUploadProgress(10);

      const credentialsResponse = await fetch('/api/upload-video/vdocipher-credentials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          folderId: 'root',
        }),
      });

      addLog('STEP 1: Credentials request sent', {
        status: credentialsResponse.status,
        statusText: credentialsResponse.statusText
      });

      if (!credentialsResponse.ok) {
        const errorText = await credentialsResponse.text();
        throw new Error(`Credentials request failed: ${credentialsResponse.status} - ${errorText}`);
      }

      const { clientPayload, videoId } = await credentialsResponse.json();
      addLog('STEP 1: Upload credentials received', {
        videoId,
        hasClientPayload: !!clientPayload,
        uploadLink: clientPayload?.uploadLink
      });

      setUploadProgress(25);

      // STEP 2: Upload file to VdoCipher
      addLog('STEP 2: Uploading video file to VdoCipher...');
      
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedVideo);
      uploadFormData.append('uploadCredentials', JSON.stringify(clientPayload));

      addLog('STEP 2: FormData prepared, sending upload request...');

      const uploadResponse = await fetch('/api/upload-video/vdocipher-upload', {
        method: 'POST',
        body: uploadFormData,
      });

      addLog('STEP 2: Upload request sent', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      addLog('STEP 2: Video upload completed', uploadResult);
      setUploadProgress(50);

      // STEP 3: Check video status
      addLog('STEP 3: Monitoring video processing status...');
      addLog('NOTE: Large videos can take several hours to process. This test will monitor for up to 10 minutes.');
      
      let videoReady = false;
      let attempts = 0;
      const maxAttempts = 60; // Maximum 60 attempts (10 minutes for testing)
      const checkInterval = 10000; // 10 seconds between checks
      const maxTestTime = 10 * 60 * 1000; // 10 minutes max for testing
      const startTime = Date.now();

      while (!videoReady && attempts < maxAttempts) {
        attempts++;
        const elapsedTime = Date.now() - startTime;
        const elapsedMinutes = (elapsedTime / (1000 * 60)).toFixed(1);
        
        // Progress calculation for testing (50% to 90% over 10 minutes)
        const progressPercent = 50 + (attempts / maxAttempts) * 40;
        setUploadProgress(progressPercent);

        // Check if we've exceeded maximum test time
        if (elapsedTime > maxTestTime) {
          addLog('⏰ STEP 3: Maximum test time reached (10 minutes). Stopping monitoring.');
          addLog('NOTE: Video processing may continue in the background for hours.');
          break;
        }

        addLog(`STEP 3: Status check attempt ${attempts}/${maxAttempts} (${elapsedMinutes}m elapsed)...`);

        // Wait before checking (except for first attempt)
        if (attempts > 1) {
          await new Promise(resolve => setTimeout(resolve, checkInterval));
        }

        const statusResponse = await fetch(`/api/upload-video/vdocipher-status?videoId=${videoId}`, {
          method: 'GET',
        });

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          addLog(`STEP 3: Status check ${attempts} failed`, {
            status: statusResponse.status,
            error: errorText
          });
          continue;
        }

        const statusData = await statusResponse.json();
        addLog(`STEP 3: Status check ${attempts} result`, {
          ...statusData,
          elapsedTime: `${elapsedMinutes}m`
        });

        if (statusData.isReady) {
          videoReady = true;
          addLog(`🎉 STEP 3: Video is ready for playback after ${elapsedMinutes} minutes!`);
        } else if (statusData.status === 'Error' || statusData.status === 'Failed') {
          throw new Error(`Video processing failed with status: ${statusData.status}`);
        } else {
          addLog(`STEP 3: Video still processing (status: ${statusData.status}), waiting...`);
          
          // Provide helpful messages for longer processing times
          if (attempts === 12) { // After 2 minutes
            addLog('ℹ️ STEP 3: Processing is taking longer than usual. Large videos can take hours to process.');
          } else if (attempts === 30) { // After 5 minutes
            addLog('ℹ️ STEP 3: Still processing... VdoCipher may need significant time for large/high-quality videos.');
          } else if (attempts === 48) { // After 8 minutes
            addLog('ℹ️ STEP 3: Long processing detected. In production, courses can be created while videos process in background.');
          }
        }
      }

      if (!videoReady) {
        const elapsedMinutes = ((Date.now() - startTime) / (1000 * 60)).toFixed(1);
        addLog(`⚠️ STEP 3: Video is still processing after ${elapsedMinutes} minutes of monitoring.`);
        addLog('✅ STEP 3: Upload was successful! Processing will continue in background.');
        addLog('📝 NOTE: In production, courses are created immediately while videos process separately.');
      }

      setUploadProgress(100);
      
      // Final result
      const finalResult = {
        success: true,
        videoId,
        isReady: videoReady,
        attempts,
        message: videoReady 
          ? 'Video uploaded and processed successfully!' 
          : 'Video uploaded successfully, still processing...'
      };

      setResult(finalResult);
      addLog('=== UPLOAD TEST COMPLETED ===', finalResult);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('❌ ERROR: Upload test failed', { error: errorMessage });
      setResult({
        success: false,
        error: errorMessage
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Step 4/5: Generate captions via Deepgram and upload to VdoCipher for the last uploaded video
  const generateAndUploadCaptions = async () => {
    try {
      setCaptionResult(null);
      addLog('=== STARTING CAPTION GENERATION ===');
      if (!result?.videoId) {
        addLog('ERROR: No videoId available from previous upload');
        return;
      }

      // For testing: we need a URL accessible by Deepgram. If your upload is not publicly accessible,
      // use a sample audio file from Deepgram docs.
      const sampleUrl = 'https://static.deepgram.com/examples/deep-learning-podcast-clip.wav';
      addLog('CAPTIONS: Requesting Deepgram transcription (webvtt)...');

      const capRes = await fetch('/api/upload-video/deepgram-captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sampleUrl, format: 'vtt' }),
      });

      if (!capRes.ok) {
        const t = await capRes.text();
        throw new Error(`Deepgram captions failed: ${capRes.status} - ${t}`);
      }

      const { captions } = await capRes.json();
      addLog('CAPTIONS: Deepgram captions generated. Uploading to VdoCipher...');

      const upRes = await fetch('/api/upload-video/vdocipher-upload-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: result.videoId, captions, language: 'en' }),
      });

      if (!upRes.ok) {
        const t = await upRes.text();
        throw new Error(`VdoCipher caption upload failed: ${upRes.status} - ${t}`);
      }

      const upData = await upRes.json();
      setCaptionResult({ success: true, ...upData });
      addLog('=== CAPTION UPLOAD COMPLETED ===', upData);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setCaptionResult({ success: false, error: msg });
      addLog('❌ ERROR: Caption flow failed', { error: msg });
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setResult(null);
    addLog('Logs cleared');
  };

  const resetTest = () => {
    setTitle('');
    setSelectedVideo(null);
    setUploadProgress(0);
    setLogs([]);
    setResult(null);
    setIsUploading(false);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
    addLog('Test reset');
  };

  // Check authentication
  if (!user) {
    return (
      <PageLayout>
        <Section className="py-8">
          <Container>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Authentication Required
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Please sign in to test VdoCipher upload functionality.
              </p>
            </div>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Section className="py-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🧪 VdoCipher Upload Test
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Test the VdoCipher video upload integration with detailed logging
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Logged in as: <span className="font-semibold">{dbUser?.name || user?.email}</span> ({user?.role})
              </p>
            </div>

            {/* Test Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8 dark:bg-gray-800 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Upload Configuration
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isUploading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                    placeholder="Enter video title for VdoCipher..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video File *
                  </label>
                  <input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoChange}
                    accept="video/*"
                    disabled={isUploading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
                  />
                  {selectedVideo && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Selected: {selectedVideo.name} ({(selectedVideo.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                  <button
                    onClick={testVdoCipherUpload}
                    disabled={isUploading || !selectedVideo || !title.trim()}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Testing Upload... ({uploadProgress.toFixed(0)}%)
                      </>
                    ) : (
                      '🚀 Start VdoCipher Upload Test'
                    )}
                  </button>
                  
                  <button
                    onClick={generateAndUploadCaptions}
                    disabled={isUploading || !result?.videoId}
                    className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                  >
                    Generate & Upload Captions (VTT)
                  </button>
                  
                  <button
                    onClick={clearLogs}
                    disabled={isUploading}
                    className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                  >
                    Clear Logs
                  </button>
                  
                  <button
                    onClick={resetTest}
                    disabled={isUploading}
                    className="px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {isUploading && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl dark:bg-blue-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Upload Progress
                    </span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {uploadProgress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3 dark:bg-blue-800">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Result Display */}
              {result && (
                <div className={`mt-6 p-4 rounded-xl ${result.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <h3 className={`font-semibold mb-2 ${result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {result.success ? '✅ Test Result: SUCCESS' : '❌ Test Result: FAILED'}
                  </h3>
                  <pre className={`text-sm ${result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Debug Logs */}
            <div className="bg-gray-900 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  📋 Debug Logs ({logs.length})
                </h2>
                <span className="text-sm text-gray-400">
                  Real-time logging with console output
                </span>
              </div>
              
              <div className="bg-black rounded-xl p-4 h-96 overflow-y-auto font-mono text-sm">
                {logs.length === 0 ? (
                  <div className="text-gray-500 italic">
                    No logs yet. Start an upload test to see detailed debugging information...
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`mb-1 ${
                        log.includes('ERROR') || log.includes('❌') ? 'text-red-400' :
                        log.includes('SUCCESS') || log.includes('✅') || log.includes('🎉') ? 'text-green-400' :
                        log.includes('STEP') ? 'text-blue-400' :
                        log.includes('⚠️') ? 'text-yellow-400' :
                        'text-gray-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </PageLayout>
  );
}
