# Testing Documentation

This document describes the available testing pages and utilities in the EzioAcademy application.

## VdoCipher Upload Testing

### Test Page: `/test-vdocipher-upload`

A dedicated testing page for the VdoCipher video upload integration with comprehensive logging and debugging features.

#### Features:
- **Step-by-step upload testing**: Tests the complete 3-step VdoCipher upload process
- **Real-time logging**: Detailed console logs and UI feedback for debugging
- **Progress tracking**: Visual progress indicators for each step
- **Error handling**: Comprehensive error reporting and status checking
- **Authentication required**: Must be signed in with admin or creator role

#### How to Use:

1. **Access the test page**: Navigate to `http://localhost:3000/test-vdocipher-upload`
2. **Sign in**: Must be authenticated (admin or creator role recommended)
3. **Enter video title**: Provide a title for the test video
4. **Select video file**: Choose a video file from your computer
5. **Start test**: Click "🚀 Start VdoCipher Upload Test"
6. **Monitor progress**: Watch the real-time logs and progress bar
7. **Review results**: Check the final result and detailed logs

#### What the Test Does:

1. **Step 1**: Obtains upload credentials from VdoCipher API
2. **Step 2**: Uploads the video file using the credentials
3. **Step 3**: Monitors video processing status for up to 10 minutes (production allows up to 6 hours)

#### Debug Information Provided:

- **Request/Response logs**: All API calls with status codes and data
- **File information**: Video file details (name, size, type)
- **Upload progress**: Real-time progress updates
- **VdoCipher responses**: Detailed API responses from VdoCipher
- **Error details**: Comprehensive error reporting
- **Processing status**: Video encoding status monitoring

#### Console Output:

The test page outputs detailed console logs with emojis for easy identification:
- 🔑 `[VdoCipher Credentials]` - Step 1 operations
- 📤 `[VdoCipher Upload]` - Step 2 operations  
- 📊 `[VdoCipher Status]` - Step 3 operations
- ✅ Success messages
- ❌ Error messages
- ⚠️ Warning messages

#### Expected Results:

**Success Case:**
- Video credentials obtained successfully
- File uploaded to VdoCipher servers
- Video processing completed (status: Ready/VideoReady)
- Final result shows `success: true` with video ID

**Processing Case:**
- Upload successful but video still processing
- Final result shows upload success with processing status
- Video will be available once processing completes (may take hours for large files)
- Course creation proceeds immediately while video processes in background

#### Troubleshooting:

**Common Issues:**
- **"API configuration error"**: Check `VDO_API_SECRET` environment variable
- **"Unauthorized"**: Ensure you're signed in with proper role
- **Upload timeouts**: Large video files may take longer to process
- **Network errors**: Check internet connection and VdoCipher service status

#### Environment Requirements:

```env
VDO_API_SECRET=your-vdocipher-api-secret
```

Make sure the VdoCipher API secret is properly configured in your environment variables.

### API Endpoints Tested:

- `PUT /api/upload-video/vdocipher-credentials` - Get upload credentials
- `POST /api/upload-video/vdocipher-upload` - Upload video file
- `GET /api/upload-video/vdocipher-status` - Check processing status

### Related Documentation:

- [VdoCipher Setup Guide](./VDOCIPHER_SETUP.md) - Complete setup instructions
- [Course Creation Guide](../app/create-video/README.md) - How video upload integrates with course creation

## Other Testing Pages

### Payment Testing: `/payment-test`
- Tests Paddle payment integration
- Includes configuration validation
- See [Paddle Setup Guide](./PADDLE_SETUP.md) for details

### Video Player Testing: `/video-test-vdocipher`
- Tests VdoCipher video playback
- OTP generation and player functionality
- Requires existing video ID for testing
