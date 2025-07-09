📄 Product Requirements Document (PRD)
Project: Course-Selling Platform MVP
Version: 1.0
Date: July 9, 2025

1. 🎯 Purpose
   The goal is to build a professional, secure, and scalable MVP platform that allows a single course creator to sell online video-based courses. The MVP will include basic account roles, course management, secure video streaming, payment processing, and subtitle translation support.

2. 🧑‍🤝‍🧑 User Roles
   Role Description
   Admin Manages all content. Can create, edit, and delete courses and sections.
   Creator Can edit course and section information. Cannot publish new content.
   Student Can register, purchase courses, and access video content post-payment.

3. 🧩 Features & Functionality
   3.1 Authentication
   Sign in/up via NextAuth (email/password or OAuth)

Role-based access control: admin, creator, student

3.2 Course Management (Admin)
Create/edit/delete courses

Upload course thumbnail (via Supabase Storage)

Assign courses to the creator

3.3 Section Management (Admin)
Add/edit sections to each course

Upload videos via Mux (DRM-protected)

Generate playback_id and store it in the database

Attach translated subtitles per section

3.4 Student Experience
Browse course list with thumbnails

View course detail page (preview only if not purchased)

Pay for a course via Paddle

Access purchased content:

Stream video (via Mux Player)

Switch between subtitle languages

3.5 Subtitles & Translation
Transcribe each section video using Whisper

Translate subtitle text via DeepL API

Serve subtitle .vtt files from Supabase or Mux Tracks

Students can toggle subtitle language in the player

3.6 Payments
Use Paddle for course purchases

Handle payment success/failure webhooks

On success, add student to enrollments table

4. 🧰 Tech Stack
   Layer Technology
   Frontend Next.js + TypeScript
   UI Framework Tailwind CSS + React-Bits
   Auth NextAuth
   Backend Supabase (Postgres + Auth)
   Storage Supabase Storage
   Video Hosting Mux (DRM + subtitle support)
   Translation Whisper (transcribe), DeepL (translate)
   Payments Paddle

5. 🗄️ Database Schema Overview
   users
   id, role, name, email, created_at

courses
id, title, description, thumbnail_url, price, creator_id, created_at

sections
id, course_id, title, order, playback_id, duration

subtitles
id, section_id, language_code, subtitle_url

enrollments
id, user_id, course_id, enrolled_at, payment_status

6. 🔐 Security Considerations
   Video streaming is protected via Mux DRM

Videos cannot be downloaded or screen-recorded with tools like OBS

(Optional): Add user watermark overlays per session

Apply Supabase Row-Level Security (RLS) to restrict access to paid students

7. 🌍 Internationalization
   Subtitle support for multiple languages

DeepL translations per section

User-selectable subtitles in the video player

8. 🚫 Out of Scope for MVP
   Instructor registration or multiple creators

Quizzes, certifications, or progress tracking

Attachments like PDFs or worksheets

Reviews or ratings

9. 📆 Timeline (Suggested)
   Week Milestone
   1 Setup project structure, auth, DB
   2 Course & section management (admin)
   3 Mux integration + video player
   4 Paddle payment & enrollments
   5 Subtitles (Whisper + DeepL) + Player UI
   6 Testing, polish, deploy
