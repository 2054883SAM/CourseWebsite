# Feature Requirements Document

## Course Enrollment, Payment and Course Access

### 1. Overview

This feature enables students to enroll in courses through Paddle V2 payment processing, access a personalized learning dashboard, and view course content they've purchased. It forms the core business functionality of the platform by connecting payment processing to content access.

### 2. User Requirements

#### 2.1 Enrollment Eligibility
- Only authenticated users with the "student" role can enroll in courses
- Users with other roles should see appropriate messaging when attempting to enroll
- Unauthenticated users should be redirected to sign in

#### 2.2 Payment Process
- Students purchase courses via **one-time payments** through Paddle V2 billing integration
- Implementation uses **Paddle-hosted checkout** for simplified integration and security
- Paddle serves as Merchant of Record, handling most security and compliance requirements
- Payment confirmation must trigger enrollment record creation

#### 2.3 Course Access
- Enrolled students must have immediate access to purchased course content
- "My Learning" section in navigation to show all enrolled courses
- Detailed course view must show all available sections with their individual video content
- Each section's video is displayed using the Mux Player with its corresponding playbackId

### 3. Technical Requirements

#### 3.1 Database Schema

*Note: The required database schema has already been implemented in Supabase, including the enrollments table with appropriate fields and RLS policies. No additional schema changes are needed.*

Key aspects of the existing schema:
- Enrollments table links users to courses with transaction tracking
- Sections table stores individual video content for each course with its own Mux playbackId
- Status values include 'active', 'refunded', 'disputed'
- Row-level security policies are in place to ensure students can only access their own enrollments
- Appropriate indexes have been created for performance optimization

#### 3.2 API Endpoints

1. **Course Enrollment**
   - `POST /api/checkout/:courseId`
   - Creates Paddle checkout session for one-time purchase

2. **Enrollment Status Check**
   - `GET /api/courses/enrollment/:id`
   - Returns enrollment status for the specified course

3. **Paddle Webhook Handler**
   - `POST /api/webhooks/paddle`
   - Processes transaction_completed events and creates enrollment records

#### 3.3 Components

1. **EnrollButton Component**
   - Conditionally renders based on user authentication and role
   - Initiates Paddle-hosted checkout flow
   - Shows enrollment status if already enrolled

2. **MyLearningPage Component**
   - Grid/list view of enrolled courses
   - Direct Supabase query to fetch user enrollments and corresponding courses
   - Progress tracking for each course
   - Sorting and filtering options

3. **CourseAccess Component**
   - Controls access to course content based on enrollment status
   - Integrates with existing authentication system

4. **CourseContentPlayer Component**
   - Displays all sections of an enrolled course
   - Renders Mux Player for each section using the section's unique playbackId
   - Handles section navigation and progress tracking

5. **EnrollmentService**
   - Manages enrollment records in Supabase
   - Handles webhook processing from Paddle
   - Provides enrollment status checking

### 4. User Flow

1. **Enrollment Flow**
   - User browses course catalog
   - User views course details page
   - User clicks "Enroll" button
   - System verifies authentication status and role
   - If not authenticated, redirect to sign-in
   - If authenticated as non-student, show error message
   - If authenticated as student, initiate Paddle-hosted checkout
   - User completes one-time payment through Paddle overlay
   - Paddle sends webhook with transaction_completed event
   - System creates enrollment record
   - User is redirected to course content or confirmation page

2. **Course Access Flow**
   - User navigates to "My Learning" in navbar
   - Client directly queries Supabase for user's enrollments
   - System displays all enrolled courses based on enrollment records
   - User selects course
   - System verifies enrollment status
   - System loads all sections for the selected course
   - User can navigate between sections, with each section displaying its video content via the Mux Player
   - System tracks progress through individual sections and overall course completion

### 5. Integration Points

1. **Supabase Integration**
   - Use existing client for authentication checks and enrollment queries
   - Store enrollment records in Supabase
   - Query sections table to fetch all sections with their playbackIds for enrolled courses
   - Leverage existing RLS policies for secure access

2. **Paddle Integration**
   - Use Paddle V2 client for one-time purchase checkout
   - Implement Paddle-hosted checkout flow
   - Process webhooks for transaction events
   - Store transaction IDs with enrollment records

3. **Mux Integration**
   - Use existing MuxPlayer component for video delivery
   - Each section has its own unique Mux playbackId stored in the sections table
   - Configure player with appropriate section playbackId
   - Access control for video playback based on enrollment status

### 6. Testing Requirements

1. **Authentication Testing**
   - Verify only students can enroll
   - Test redirect behavior for unauthenticated users

2. **Payment Testing**
   - Verify Paddle-hosted checkout flow using sandbox environment
   - Test webhook processing for transaction_completed events
   - Test refund and dispute handling
   - Verify enrollment record creation after successful payment

3. **Access Control Testing**
   - Verify enrolled users can access course content across all sections
   - Verify non-enrolled users cannot access restricted sections
   - Test My Learning page displays correct enrolled courses
   - Verify each section correctly loads its specific video using the appropriate playbackId

4. **Edge Cases**
   - Payment failure handling
   - Refund processing
   - Course removal handling
   - Missing playbackId handling

### 7. Implementation Milestones

1. **API Endpoint Development**
   - Implement checkout endpoint for Paddle integration
   - Complete webhook handler for enrollment creation

2. **Enrollment Flow Implementation**
   - Create EnrollButton component with Paddle-hosted checkout
   - Configure one-time purchase product in Paddle dashboard
   - Integrate with existing authentication system

3. **My Learning Page**
   - Create page at /my-learning
   - Implement direct Supabase queries for user enrollments and related courses
   - Design and implement UI for course listing

4. **Course Content Access Implementation**
   - Add enrollment checks to course content pages
   - Implement section listing and navigation for enrolled courses
   - Configure Mux Player for each section using the section's playbackId
   - Implement progress tracking across sections

### 8. Success Metrics

- Successful enrollment rate (enrollments/checkout attempts)
- Average time from course view to enrollment
- Enrollment completion rate
- Student engagement with enrolled courses
- Section completion rates
- Technical errors during enrollment process
