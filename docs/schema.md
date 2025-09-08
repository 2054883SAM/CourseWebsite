## **Supabase Database Schema**

---

### `users`

| Column       | Type      | Description                         |
| ------------ | --------- | ----------------------------------- |
| `id`         | UUID (PK) | Linked to Supabase Auth             |
| `role`       | text      | `'admin'`, `'creator'`, `'student'` |
| `name`       | text      | Full name                           |
| `email`      | text      | User email                          |
| `photo_url`  | text      | Profile                             |
| `created_at` | timestamp | Timestamp of user registration      |

---

### `courses`

| Column          | Type      | Description                |
| --------------- | --------- | -------------------------- |
| `id`            | UUID (PK) | Unique course ID           |
| `title`         | text      | Course title               |
| `description`   | text      | Course description         |
| `thumbnail_url` | text      | Stored in Supabase Storage |
| `price`         | numeric   | Course price               |
| `creator_id`    | UUID (FK) | Linked to `users.id`       |
| `created_at`    | timestamp | Timestamp                  |

---

### `sections`

| Column        | Type      | Description                           |
| ------------- | --------- | ------------------------------------- |
| `id`          | UUID (PK) | Unique section ID                     |
| `course_id`   | UUID (FK) | Linked to `courses.id`                |
| `title`       | text      | Section title                         |
| `order`       | integer   | Position within the course            |
| `playback_id` | text      | Mux `playbackId` for video playback   |
| `duration`    | numeric   | Optional: video duration (in seconds) |

---

### `subtitles`

| Column          | Type      | Description                          |
| --------------- | --------- | ------------------------------------ |
| `id`            | UUID (PK) | Subtitle ID                          |
| `section_id`    | UUID (FK) | Linked to `sections.id`              |
| `language_code` | text      | e.g., `'en'`, `'fr'`, `'es'`         |
| `subtitle_url`  | text      | URL to `.vtt` file (Supabase or Mux) |

---

### `enrollments`

| Column           | Type      | Description                         |
| ---------------- | --------- | ----------------------------------- |
| `id`             | UUID (PK) | Enrollment ID                       |
| `user_id`        | UUID (FK) | Linked to `users.id`                |
| `course_id`      | UUID (FK) | Linked to `courses.id`              |
| `enrolled_at`    | timestamp | When student enrolled               |
| `payment_status` | text      | `'paid'`, `'pending'` (from Paddle) |
