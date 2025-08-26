# Database Schema & Security Implementation Documentation

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ COURSES : creates
    USERS ||--o{ ENROLLMENTS : enrolls
    COURSES ||--o{ SECTIONS : contains
    COURSES ||--o{ ENROLLMENTS : has
    SECTIONS ||--o{ SUBTITLES : has
    
    USERS {
        UUID id PK
        TEXT role
        TEXT name
        TEXT email
        TEXT photo_url
        TIMESTAMP created_at
    }
    
    COURSES {
        UUID id PK
        TEXT title
        TEXT description
        TEXT thumbnail_url
        NUMERIC price
        UUID creator_id FK
        TIMESTAMP created_at
    }
    
    SECTIONS {
        UUID id PK
        UUID course_id FK
        TEXT title
        INTEGER order
        TEXT playback_id
        NUMERIC duration
    }
    
    SUBTITLES {
        UUID id PK
        UUID section_id FK
        TEXT language_code
        TEXT subtitle_url
    }
    
    ENROLLMENTS {
        UUID id PK
        UUID user_id FK
        UUID course_id FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
        -- TEXT paddle_transaction_id (removed)
        TEXT status
    }
```

## Table Structure

### 1. Users Table

**Purpose**: Stores user profiles and role information.

**Fields**:
- `id` (UUID, Primary Key): Links to auth.users, serving as the user's unique identifier
- `role` (TEXT, NOT NULL): User's role - must be one of: 'admin', 'teacher', 'student'
- `membership` (TEXT, NOT NULL, DEFAULT 'free'): must be one of: 'free', 'subscribed'
- `name` (TEXT, NOT NULL): User's full name
- `email` (TEXT, NOT NULL): User's email address
- `photo_url` (TEXT): Optional URL to the user's profile photo
- `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL): When the user profile was created

**Indexes**:
- Primary Key on `id`
- Index on `role` for role-based queries

### 2. Courses Table

**Purpose**: Stores course information created by instructors.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier for the course
- `title` (TEXT, NOT NULL): Course title
- `description` (TEXT, NOT NULL): Course description
- `thumbnail_url` (TEXT): Optional URL to course thumbnail image
- -- price removed from schema
- `creator_id` (UUID, NOT NULL): Foreign key reference to the creator's user ID
- `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL): When the course was created

**Indexes**:
- Primary Key on `id`
- Index on `creator_id` for efficient querying of a teacher's courses

### 3. Sections Table

**Purpose**: Stores individual content sections within a course.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier for the section
- `course_id` (UUID, NOT NULL): Foreign key reference to the course ID
- `title` (TEXT, NOT NULL): Section title
- `order` (INTEGER, NOT NULL): Section order within the course
- `playback_id` (TEXT): Optional reference to Mux video content
- `duration` (NUMERIC): Optional section duration in seconds

**Indexes**:
- Primary Key on `id`
- Index on `course_id` for efficient section lookup by course
- Composite index on `(course_id, order)` for ordered section retrieval
- Unique constraint on `(course_id, order)` to prevent duplicate order numbers

### 4. Subtitles Table

**Purpose**: Stores subtitle/caption files for section videos.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier for the subtitle
- `section_id` (UUID, NOT NULL): Foreign key reference to the section ID
- `language_code` (TEXT, NOT NULL): Language code (e.g., 'en', 'es', 'fr')
- `subtitle_url` (TEXT, NOT NULL): URL to the subtitle file

**Indexes**:
- Primary Key on `id`
- Index on `section_id` for efficient subtitle lookup by section
- Composite index on `(section_id, language_code)` for language-specific subtitle retrieval
- Unique constraint on `(section_id, language_code)` to prevent duplicate language captions

### 5. Enrollments Table

**Purpose**: Tracks user enrollment in courses, including payment status.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier for the enrollment
- `user_id` (UUID, NOT NULL): Foreign key reference to the user ID
- `course_id` (UUID, NOT NULL): Foreign key reference to the course ID
- `created_at` (TIMESTAMP WITH TIME ZONE, NOT NULL): When the enrollment was created
- `updated_at` (TIMESTAMP WITH TIME ZONE, NOT NULL): When the enrollment was last updated
- -- paddle_transaction_id removed from schema
- `status` (TEXT, NOT NULL): Enrollment status - must be one of: 'active', 'refunded', 'disputed'

**Indexes**:
- Primary Key on `id`
- Index on `user_id` for efficient enrollment lookup by user
- Index on `course_id` for efficient enrollment lookup by course
- Index on `status` for filtering by enrollment status
- Composite index on `(user_id, course_id, status)` for optimized access checks
- Unique constraint on `(user_id, course_id)` to prevent duplicate enrollments

## Row-Level Security (RLS) Policies

### Access Control Model

Our security model implements three distinct user roles:

1. **Admin**: Full access to all data and operations
2. **Creator**: Can manage their own courses and view related data
3. **Student**: Can access courses they're enrolled in with 'active' status

### Role-Based Permissions Matrix

| Resource | Admin | Creator | Student | Anonymous |
|----------|-------|---------|---------|-----------|
| Users | CRUD all | Read all | Read all | Read all |
| Courses | CRUD all | CRUD own, Read all | Read all | Read all |
| Sections | CRUD all | Read own | Read enrolled | No access |
| Subtitles | CRUD all | Read own | Read enrolled | No access |
| Enrollments | CRUD all | Read related to own courses | Read own | No access |
| Transaction IDs | Read all | No access | No access | No access |

### Detailed Policy Descriptions

#### Users Table Policies

1. **Users are viewable by everyone**
   - **Effect**: Everyone can read basic user information
   - **Scope**: SELECT
   - **Target**: authenticated, anon
   - **Condition**: true
   - **Security Impact**: Allows public profiles

2. **Users can create their initial profile**
   - **Effect**: New users can create their own profile during signup
   - **Scope**: INSERT
   - **Target**: authenticated, anon
   - **Condition**: Auth ID matches user ID or is null for signup, role must be 'student'
   - **Security Impact**: Controls who can create accounts

3. **Users can update their own profile**
   - **Effect**: Users can modify their own profile information
   - **Scope**: UPDATE
   - **Target**: authenticated
   - **Condition**: Auth ID matches user ID
   - **Security Impact**: Prevents modifying other users' profiles

4. **Only admins can delete users**
   - **Effect**: Restricts user deletion to admins only
   - **Scope**: DELETE
   - **Target**: authenticated
   - **Condition**: Authenticated user role is 'admin'
   - **Security Impact**: Prevents unauthorized account removal

#### Courses Table Policies

1. **Courses are viewable by everyone**
   - **Effect**: All users can browse available courses
   - **Scope**: SELECT
   - **Target**: authenticated, anon
   - **Condition**: true
   - **Security Impact**: Enables course discovery

2. **Only admins can create courses**
   - **Effect**: Restricts course creation to admins
   - **Scope**: INSERT
   - **Target**: authenticated
   - **Condition**: Authenticated user role is 'admin'
   - **Security Impact**: Controls who can add courses

3. **Admins can update any course, creators their own**
   - **Effect**: Allows creators to modify only their courses
   - **Scope**: UPDATE
   - **Target**: authenticated
   - **Condition**: User is admin OR (user is creator AND user ID matches course creator_id)
   - **Security Impact**: Prevents unauthorized course modifications

4. **Only admins can delete courses**
   - **Effect**: Restricts course deletion to admins only
   - **Scope**: DELETE
   - **Target**: authenticated
   - **Condition**: Authenticated user role is 'admin'
   - **Security Impact**: Prevents unauthorized course removal

#### Sections Table Policies

1. **Sections are viewable by enrolled students, creators, and admins**
   - **Effect**: Controls who can see course content
   - **Scope**: SELECT
   - **Target**: authenticated
   - **Condition**: User is admin OR (user is creator AND created the course) OR (user is student AND has active enrollment)
   - **Security Impact**: Restricts content to paying customers and course owners

[Similar detailed descriptions for Subtitles and Enrollments policies...]

## Developer Guidelines

### Querying Secured Tables

#### Basic Principles

1. **Auth Context**: Always ensure the user's auth context is set when making queries
2. **Role Awareness**: Write queries with awareness of the user's role and its limitations
3. **Status Sensitivity**: Remember that enrollment status affects content access

#### Example Patterns

**Checking User Enrollment Status**:

```javascript
// Correct pattern - uses RLS to filter based on authenticated user
const { data, error } = await supabase
  .from('enrollments')
  .select('status')
  .eq('course_id', courseId)
  .single();

// Status will only be returned if the user is enrolled in this course
if (data?.status === 'active') {
  // User has active access
}
```

**Accessing Course Content**:

```javascript
// RLS will filter sections based on user's enrollment status
const { data, error } = await supabase
  .from('sections')
  .select('*')
  .eq('course_id', courseId)
  .order('order', { ascending: true });

// Only returns sections the user has access to
```

**Admin-Only Operations**:

```javascript
// This operation will only succeed if the user is an admin
const { data, error } = await supabase
  .from('enrollments')
  .update({ status: 'refunded' })
  .eq('id', enrollmentId);

// Handle potential permission error
if (error?.message.includes('new row violates row-level security')) {
  // User lacks admin privileges
}
```

### Common Pitfalls

1. **Forgetting User Context**: Operations fail without proper authentication
2. **Over-restrictive Client Logic**: Don't duplicate RLS logic client-side
3. **Hidden Security Errors**: RLS policy violations return empty results, not errors
4. **Stale Auth State**: Always refresh auth tokens appropriately

## Maintenance Procedures

### Adding New Tables

1. **Create Table**: Define table with appropriate relationships
2. **Enable RLS**: Always enable RLS for new tables
   ```sql
   ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
   ```
3. **Default Policy**: Start with restrictive default policy
   ```sql
   CREATE POLICY "Default deny" ON new_table FOR ALL USING (false);
   ```
4. **Access Policies**: Add specific policies following role patterns above

### Modifying RLS Policies

1. **Review Impact**: Consider all access paths before changing policies
2. **Temporary Logging**: Consider temporary audit policies during development
3. **Test Thoroughly**: Validate with multiple user roles
4. **Update Documentation**: Keep this document updated with policy changes

### Performance Monitoring

1. **Watch for Slow Queries**: RLS can impact query performance
2. **Index for Common Filters**: Add indexes for fields used in RLS conditions
3. **Analyze Usage Patterns**: Monitor which tables/queries are most affected by RLS
4. **Consider Denormalization**: For read-heavy tables, consider denormalizing to reduce joins

## Troubleshooting Guide

### Common Issues

#### Empty Results When Data Should Exist

**Symptoms**: Queries return empty results despite knowing data exists

**Potential Causes**:
- RLS policy blocks access
- User not authenticated
- User lacks required role
- For students: enrollment status not 'active'

**Resolution Steps**:
1. Verify authentication status
2. Check user role in the database
3. For course content, confirm enrollment status is 'active'
4. If admin, ensure admin role is properly set in database

#### Permission Errors on Insert/Update

**Symptoms**: Operation fails with permission error

**Potential Causes**:
- User lacks required role for operation
- User attempting to modify data they don't own
- WITH CHECK clause preventing operation

**Resolution Steps**:
1. Verify user's role in the database
2. Check ownership of the resource being modified
3. Review policy WITH CHECK clauses for the operation
4. Ensure operation complies with RLS policy conditions

### Support and Documentation

For additional assistance:
- Review this documentation and the SQL schema file
- Use dbdiagram.io to visualize the ER diagram
- Refer to the test scripts for examples of correct access patterns
- Contact the database administrator for policy modifications

---

## Changelog

| Date | Author | Description |
|------|--------|-------------|
| YYYY-MM-DD | [Your Name] | Initial documentation |
| YYYY-MM-DD | [Your Name] | Added troubleshooting section |
| YYYY-MM-DD | [Your Name] | Updated ERD and fixed policy descriptions |

---

*This document should be reviewed and updated whenever database schema or security policies change.*