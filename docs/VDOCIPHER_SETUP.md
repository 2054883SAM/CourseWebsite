# VdoCipher Integration Setup

This document explains how to set up the VdoCipher integration for video uploads and playback in this application.

## Required Environment Variables

Add this to your `.env` file:

```env
# VdoCipher Configuration
VDO_API_SECRET=your-vdocipher-api-secret-here
```

## VdoCipher API Setup

### Step 1: Get VdoCipher Account
1. Sign up at [vdocipher.com](https://vdocipher.com)
2. Navigate to your dashboard
3. Go to **Settings** → **API**

### Step 2: Generate API Secret
1. In the API settings, generate a new API secret
2. Copy the API secret key
3. Add it to your environment variables as `VDO_API_SECRET`

## Features Implemented

### ✅ Video Upload (3-Step Process)
1. **Obtain Upload Credentials**: Request signed upload URL from VdoCipher
2. **Upload Video File**: Upload video file directly to VdoCipher servers
3. **Check Upload Status**: Monitor video processing status

### ✅ Video Playback
- Secure OTP-based video streaming
- Watermark support
- Chapter navigation
- Progress tracking

## API Endpoints

### Upload Process
- `PUT /api/upload-video/vdocipher-credentials` - Get upload credentials
- `POST /api/upload-video/vdocipher-upload` - Upload video file
- `GET /api/upload-video/vdocipher-status` - Check video status

### Playback
- `POST /api/video/vdocipher-otp` - Generate OTP for secure playback

## Usage in Course Creation

When creating a course with video:

1. Select video file in the course creation form
2. System automatically:
   - Obtains VdoCipher upload credentials
   - Uploads the video file
   - Monitors processing status
   - Stores the video ID as `playback_id` in the course record

## Video Processing States

- **Uploading**: File being uploaded to VdoCipher
- **Processing**: Video being processed/encoded (can take several hours for large files)
- **VideoReady/Ready**: Video ready for playback
- **Error/Failed**: Processing failed

### Processing Time Expectations

- **Small videos (< 100MB)**: Usually ready within 5-15 minutes
- **Medium videos (100MB - 1GB)**: May take 30 minutes to 2 hours
- **Large videos (> 1GB)**: Can take 2-6+ hours depending on length and quality
- **Course creation**: Happens immediately after upload, videos process in background

## Testing the Integration

### Test Video Upload
1. Go to `/create-video` page
2. Fill in course details
3. Select a video file
4. Submit the form
5. Monitor the upload progress and status

### Verify Video Playback
1. After course creation, the video should be playable
2. Video player will automatically generate OTP for secure streaming
3. Check browser console for any playback errors

## Environment Configuration

### Development (.env.local)
```env
VDO_API_SECRET=your_dev_api_secret_here
```

### Production (Vercel/Netlify)
Add the environment variable in your hosting platform:
- Variable name: `VDO_API_SECRET`
- Value: Your production VdoCipher API secret

## Security Features

- API secret-based authentication
- OTP (One-Time Password) for video access
- Secure direct uploads to VdoCipher
- No video files stored on your server

## Troubleshooting

### "API configuration error"
- Ensure `VDO_API_SECRET` is set in your environment
- Restart your development server after adding the variable

### Video Upload Fails
- Check VdoCipher account limits
- Verify API secret is valid
- Check network connectivity to VdoCipher servers

### Video Not Playing
- Ensure video has finished processing (status: Ready/VideoReady)
- Check OTP generation is working
- Verify video ID is correctly stored in course record

## Migration from Mux

If migrating from Mux:

1. ✅ VdoCipher upload implementation replaces Mux upload
2. ✅ Old Mux route backed up as `mux-route.ts.backup`
3. ✅ Course `playback_id` now stores VdoCipher video ID
4. ✅ Video player already supports VdoCipher playback

No database migration needed - the `playback_id` field works with both systems.
