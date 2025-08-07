import { NextResponse } from 'next/server';

/**
 * API route to upload video file to VdoCipher using upload credentials
 * Step 2 of VdoCipher upload process
 */
export async function POST(req: Request) {
  console.log('📤 [VdoCipher Upload] API route called');
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const uploadCredentials = JSON.parse(formData.get('uploadCredentials') as string);
    
    console.log('📤 [VdoCipher Upload] Request data:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
      hasCredentials: !!uploadCredentials,
      uploadLink: uploadCredentials?.uploadLink
    });
    
    if (!file) {
      console.log('❌ [VdoCipher Upload] Missing file');
      return NextResponse.json(
        { error: 'Video file is required' },
        { status: 400 }
      );
    }

    if (!uploadCredentials) {
      console.log('❌ [VdoCipher Upload] Missing upload credentials');
      return NextResponse.json(
        { error: 'Upload credentials are required' },
        { status: 400 }
      );
    }

    console.log('📤 [VdoCipher Upload] Creating FormData for VdoCipher...');

    // Create form data for VdoCipher upload
    const vdoCipherFormData = new FormData();
    vdoCipherFormData.append('policy', uploadCredentials.policy);
    vdoCipherFormData.append('key', uploadCredentials.key);
    vdoCipherFormData.append('x-amz-signature', uploadCredentials['x-amz-signature']);
    vdoCipherFormData.append('x-amz-algorithm', uploadCredentials['x-amz-algorithm']);
    vdoCipherFormData.append('x-amz-date', uploadCredentials['x-amz-date']);
    vdoCipherFormData.append('x-amz-credential', uploadCredentials['x-amz-credential']);
    vdoCipherFormData.append('success_action_status', '201');
    vdoCipherFormData.append('success_action_redirect', '');
    vdoCipherFormData.append('file', file);

    console.log('📤 [VdoCipher Upload] Uploading to VdoCipher at:', uploadCredentials.uploadLink);

    // Upload to VdoCipher
    const uploadResponse = await fetch(uploadCredentials.uploadLink, {
      method: 'POST',
      body: vdoCipherFormData,
    });

    console.log('📤 [VdoCipher Upload] VdoCipher upload response status:', uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('❌ [VdoCipher Upload] VdoCipher upload error:', uploadResponse.status, errorText);
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    const responseText = await uploadResponse.text();
    console.log('✅ [VdoCipher Upload] Upload successful, response:', responseText);

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
    }, {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('❌ [VdoCipher Upload] Error uploading video to VdoCipher:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
