# Technische Documentatie - Cryptoriez Video Trading Course Platform

## 📋 Inhoudsopgave

1. [Overzicht](#overzicht)
2. [Technologie Stack](#technologie-stack)
3. [Architectuur](#architectuur)
4. [Authenticatie Systeem](#authenticatie-systeem)
5. [Database Schema](#database-schema)
6. [Project Structuur](#project-structuur)
7. [Belangrijke Features & Flows](#belangrijke-features--flows)
8. [Environment Variables](#environment-variables)
9. [Dependencies](#dependencies)
10. [Bekende Issues & Verbeterpunten](#bekende-issues--verbeterpunten)

---

## Overzicht

Dit is een Next.js 16 applicatie voor een online leerplatform waar studenten trading leren via video modules. Het platform biedt:

- **Module-gebaseerd leren**: Studenten volgen modules met video lessen
- **Progress tracking**: Automatische tracking van bekeken lessen
- **Examen systeem**: Examens per module met 75% slaagpercentage
- **Access levels**: 3 niveaus (Basic=1, Full=2, Mentor=3)
- **Mentorship**: Integratie met Calendly voor mentor sessies
- **Praktijklessen**: Extra praktijkcases per module

**Platform naam**: "Het Trade Platform" (Cryptoriez)

---

## Technologie Stack

### Core
- **Next.js 16.0.0** (App Router)
- **React 19.2.0**
- **TypeScript 5**
- **Node.js 18+**

### Styling
- **Tailwind CSS v4** (met PostCSS)
- Custom CSS variabelen voor theming
- Dark theme met custom kleuren

### Backend & Database
- **Supabase** (PostgreSQL database + Auth)
- **@supabase/auth-helpers-nextjs v0.10.0**
- **@supabase/supabase-js v2.76.1**

### UI Libraries
- **Radix UI** (@radix-ui/react-progress)
- **Lucide React** (icons)
- **Framer Motion** (animations)

### Video
- **@vimeo/player v2.30.0** (Vimeo video integratie)

### Development
- **ESLint** (Next.js config)
- **TypeScript strict mode**

---

## Architectuur

### Application Flow

```
User Request
    ↓
Next.js Middleware (src/middleware.ts)
    ↓
Route Protection Check
    ↓
App Shell (src/components/AppShell.tsx)
    ├── StudentGate (sync student data)
    ├── Navbar (navigation)
    ├── ChatbotOverlay
    └── Main Content (page components)
    ↓
Page Component
    ├── Client Component (data fetching)
    ├── Supabase Client (browser/server)
    └── LocalStorage (student caching)
```

### Client vs Server Components

- **Server Components**: Layout, metadata
- **Client Components**: Alle interactieve pagina's (`'use client'`)
- **API Routes**: `/api/mentorship/access-check` (server-side)

### Data Flow

1. **Authentication**: Supabase Auth → User object
2. **Student Sync**: Auth user_id → `students` table lookup
3. **Caching**: Student data in localStorage (id, email, access_level)
4. **Data Fetching**: Direct Supabase queries in client components
5. **Progress Tracking**: Real-time updates naar `progress` table

---

## Authenticatie Systeem

### Huidige Implementatie

#### 1. Supabase Auth Setup

**Client Creation** (`src/utils/supabase/client.ts`):
```typescript
- Gebruikt `createBrowserSupabaseClient` van @supabase/auth-helpers-nextjs
- Environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- Singleton pattern (cached client)
```

**Server Creation** (`src/utils/supabase/server.ts`):
```typescript
- Gebruikt `createServerComponentClient` met cookies
- Server-only (import 'server-only')
- Cookie-based session management
```

**Wrapper** (`src/lib/supabaseClient.ts`):
```typescript
- Cached browser client wrapper
- getSupabaseClient() functie voor consistent gebruik
```

#### 2. Middleware Protection (`src/middleware.ts`)

**Beschermde Routes**:
- `/dashboard`
- `/module/*`
- `/lesson/*`
- `/exam/*`
- `/praktijk/*`
- `/mentorship`

**Flow**:
1. Check Supabase auth session via `createMiddlewareClient`
2. Als geen user → redirect naar `/login?redirectedFrom={pathname}`
3. Anders → door naar route

**Probleem**: Gebruikt deprecated `createMiddlewareClient` van auth-helpers-nextjs v0.10.0

#### 3. Login/Register Flow (`src/app/login/LoginClient.tsx`)

**Login Flow**:
1. User vult email/password in
2. `supabase.auth.signInWithPassword({ email, password })`
3. Rate limiting check (429 errors → 5 min cooldown)
4. Na succesvol login:
   - Haal user op via `supabase.auth.getUser()`
   - Zoek student record via `auth_user_id`
   - Als niet gevonden → zoek via email
   - Als nog niet gevonden → maak nieuwe student aan (access_level=1)
   - Update `auth_user_id` als student bestaat maar geen link heeft
   - Sla student data op in localStorage
   - Redirect naar `/dashboard`

**Register Flow**:
1. User vult email/password/fullName in
2. `supabase.auth.signUp({ email, password, options: { data: { full_name } } })`
3. Rate limiting check
4. Als email confirmation vereist → toon bericht
5. Als session direct beschikbaar:
   - Zoek/bepaal student record (zelfde logica als login)
   - Sla op in localStorage
   - Redirect naar `/dashboard`

**Problemen**:
- Complexe fallback logica (email lookup, create fallback)
- Geen proper error handling voor edge cases
- Rate limiting is client-side alleen
- Geen email verification flow
- Student record kan out-of-sync raken met auth

#### 4. Student Data Management (`src/lib/student.ts`)

**LocalStorage Keys**:
- `cryptoriez_student_id`
- `cryptoriez_student_email`
- `cryptoriez_student_access_level`

**Functies**:
- `getStoredStudentId()` / `setStoredStudent()`
- `getStoredStudentEmail()`
- `getStoredStudentAccessLevel()` / `setStoredStudentAccessLevel()`
- `clearStoredStudent()` (bij logout)
- `getStudentByAuthUserId(authUserId)` - Supabase query
- `ensureStudentByEmail(email)` - Find or create

**StudentGate Component** (`src/components/StudentGate.tsx`):
- Sync student data op elke page load
- Alleen als localStorage leeg is
- Voorkomt stale data

#### 5. Session Management

**Logout** (`src/components/Navbar.tsx`):
```typescript
await supabase.auth.signOut()
clearStoredStudent() // Clear localStorage
router.replace('/login')
```

**Session Check**:
- Elke protected page checkt `supabase.auth.getUser()`
- Als geen user → redirect naar login
- Student data wordt gesynced via StudentGate of direct in component

### Authenticatie Problemen & Verbeterpunten

#### Huidige Problemen:

1. **Deprecated Auth Helpers**:
   - `@supabase/auth-helpers-nextjs v0.10.0` is verouderd
   - Nieuwe versie: `@supabase/ssr` (server-side rendering)
   - Middleware gebruikt oude API

2. **Complexe Student Sync Logica**:
   - Te veel fallbacks en edge cases
   - Email lookup als fallback is fragiel
   - Auto-create student bij login kan problemen geven

3. **LocalStorage Dependency**:
   - Student data cached in localStorage
   - Kan out-of-sync raken
   - Geen server-side validation

4. **Geen Proper Error States**:
   - Rate limiting alleen client-side
   - Geen retry mechanisme
   - Error messages niet altijd duidelijk

5. **Security Concerns**:
   - Access level check alleen client-side
   - Geen server-side validation in API routes (behalve mentorship)
   - Middleware checkt alleen auth, niet access level

6. **Email Verification**:
   - Geen duidelijke flow voor email confirmation
   - Users kunnen mogelijk zonder verificatie inloggen

#### Aanbevolen Verbeteringen:

1. **Upgrade naar @supabase/ssr**:
   - Modernere API
   - Betere TypeScript support
   - Server components support

2. **Server-side Student Validation**:
   - API route voor student data fetching
   - Server-side access level checks
   - Betere error handling

3. **Database Triggers**:
   - Auto-create student record bij auth user creation
   - Sync auth_user_id automatisch

4. **Session Management**:
   - Server-side session checks
   - Refresh token handling
   - Proper logout flow

5. **Access Control**:
   - Middleware check voor access levels
   - Server-side route protection
   - API route authentication

---

## Database Schema

### Supabase Tables

#### 1. `students`
```sql
- id: uuid (primary key)
- email: text (unique)
- auth_user_id: uuid (foreign key naar auth.users)
- access_level: integer (1=Basic, 2=Full, 3=Mentor)
- created_at: timestamp
- updated_at: timestamp
```

**Relationships**:
- One-to-one met `auth.users` (via `auth_user_id`)
- One-to-many met `progress` (via `student_id`)
- One-to-many met `exam_results` (via `student_id`)

#### 2. `modules`
```sql
- id: integer (primary key)
- title: text
- description: text (nullable)
- order: integer (nullable) - voor sortering
- created_at: timestamp
```

**Relationships**:
- One-to-many met `lessons` (via `module_id`)
- One-to-many met `exams` (via `module_id`)
- One-to-many met `practical_lessons` (via `module_id`)

#### 3. `lessons`
```sql
- id: integer (primary key)
- module_id: integer (foreign key)
- title: text
- description: text (nullable)
- video_url: text (nullable) - Vimeo URL
- order: integer (nullable) - voor sortering binnen module
- thumbnail_url: text (nullable)
- created_at: timestamp
```

**Relationships**:
- Many-to-one met `modules` (via `module_id`)
- One-to-many met `progress` (via `lesson_id`)

#### 4. `progress`
```sql
- id: integer (primary key)
- student_id: uuid (foreign key)
- lesson_id: integer (foreign key)
- watched: boolean
- watched_at: timestamp (nullable)
- created_at: timestamp
- updated_at: timestamp
```

**Unique Constraint**: `(student_id, lesson_id)` - één record per student/les combinatie

**Relationships**:
- Many-to-one met `students` (via `student_id`)
- Many-to-one met `lessons` (via `lesson_id`)

#### 5. `exams`
```sql
- id: integer (primary key)
- module_id: integer (foreign key)
- title: text (nullable)
- active: boolean (nullable) - optioneel, voor actieve exam selectie
- created_at: timestamp
```

**Relationships**:
- Many-to-one met `modules` (via `module_id`)
- One-to-many met `exam_questions` (via `exam_id`)
- One-to-many met `exam_results` (via `exam_id`)

#### 6. `exam_questions`
```sql
- id: integer (primary key)
- exam_id: integer (foreign key)
- question: text
- options: jsonb - array van strings ["Option 1", "Option 2", ...]
- correct_answer: text - moet matchen met één van de options
- order: integer (nullable)
- created_at: timestamp
```

**Relationships**:
- Many-to-one met `exams` (via `exam_id`)

#### 7. `exam_results`
```sql
- id: integer (primary key)
- student_id: uuid (foreign key)
- exam_id: integer (foreign key)
- score: integer - aantal correcte antwoorden
- passed: boolean - true als score >= 75%
- submitted_at: timestamp (nullable)
- created_at: timestamp
```

**Relationships**:
- Many-to-one met `students` (via `student_id`)
- Many-to-one met `exams` (via `exam_id`)

#### 8. `practical_lessons`
```sql
- id: integer (primary key)
- module_id: integer (foreign key)
- title: text
- description: text (nullable)
- location: text (nullable) - video URL of andere locatie
- video_url: text (nullable) - alias voor location
- created_at: timestamp
```

**Relationships**:
- Many-to-one met `modules` (via `module_id`)

### Supabase Storage Buckets

#### `Cryptoriez`
- **Purpose**: Logo en andere platform assets
- **RLS Policy**: Public read

### Row Level Security (RLS)

**Aannames** (niet volledig gedocumenteerd in code):
- `students`: Users kunnen alleen hun eigen record lezen
- `progress`: Users kunnen alleen hun eigen progress lezen/schrijven
- `exams`, `exam_questions`: Public read, authenticated write
- `exam_results`: Users kunnen alleen hun eigen results lezen/schrijven
- `modules`, `lessons`: Public read
- `practical_lessons`: Public read

---

## Project Structuur

```
/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (metadata, AppShell)
│   │   ├── page.tsx                  # Homepage (redirect naar dashboard?)
│   │   ├── globals.css                # Global styles + CSS variables
│   │   │
│   │   ├── login/
│   │   │   ├── page.tsx              # Login page wrapper (Suspense)
│   │   │   └── LoginClient.tsx       # Login/Register form (client component)
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Dashboard met module overview
│   │   │
│   │   ├── modules/
│   │   │   └── page.tsx              # Alle modules overzicht
│   │   │
│   │   ├── module/[id]/
│   │   │   └── page.tsx              # Module detail (lessen lijst + exam CTA)
│   │   │
│   │   ├── lesson/[id]/
│   │   │   └── page.tsx              # Les detail (Vimeo player + progress)
│   │   │
│   │   ├── exam/[id]/
│   │   │   └── page.tsx              # Examen interface
│   │   │
│   │   ├── praktijk/[id]/
│   │   │   └── page.tsx              # Praktijkles detail
│   │   │
│   │   ├── mentorship/
│   │   │   └── page.tsx              # Mentorship overzicht (Calendly)
│   │   │
│   │   ├── updates/
│   │   │   └── page.tsx              # Community page (Discord CTA, auth required)
│   │   │
│   │   ├── confirmed/
│   │   │   └── page.tsx              # Email confirmation page?
│   │   │
│   │   ├── privacy/
│   │   │   └── page.tsx              # Privacy policy
│   │   │
│   │   ├── terms/
│   │   │   └── page.tsx              # Terms of service
│   │   │
│   │   └── api/
│   │       └── mentorship/
│   │           └── access-check/
│   │               └── route.ts     # API route voor access level check
│   │
│   ├── components/
│   │   ├── AppShell.tsx              # Root shell (Navbar, Footer, StudentGate)
│   │   ├── Navbar.tsx                # Sidebar navigation (desktop) + topbar (mobile)
│   │   ├── StudentGate.tsx           # Student data sync component
│   │   ├── Footer.tsx                # Footer component
│   │   ├── ChatbotOverlay.tsx        # Chatbot integratie
│   │   │
│   │   ├── DashboardProgress.tsx     # Progress component voor dashboard
│   │   ├── HeroDashboard.tsx        # Dashboard hero section
│   │   ├── ModuleProgressCard.tsx    # Module card met progress
│   │   ├── MentorCard.tsx            # Mentor card component
│   │   ├── CalendlyModal.tsx         # Calendly booking modal
│   │   ├── TradingSessionClock.tsx   # Trading session timer?
│   │   ├── ImageModal.tsx             # Fullscreen image modal (o.a. landing testimonials)
│   │   │
│   │   └── ui/
│   │       ├── Brand.tsx             # Brand logo + naam
│   │       ├── Buttons.tsx          # Button components
│   │       └── Container.tsx         # Container wrapper
│   │
│   ├── lib/
│   │   ├── supabaseClient.ts         # Supabase client wrapper (cached)
│   │   ├── student.ts                # Student data management (localStorage + Supabase)
│   │   ├── progress.ts               # Progress tracking functies
│   │   ├── exam.ts                   # Exam functies (fetch, submit, results)
│   │   └── practical.ts              # Practical lessons functies
│   │
│   ├── utils/
│   │   └── supabase/
│   │       ├── client.ts             # Browser Supabase client creation
│   │       └── server.ts             # Server Supabase client creation
│   │
│   └── middleware.ts                  # Route protection middleware
│
├── public/                            # Static assets
│   ├── file.svg, globe.svg, etc.
│
├── package.json                       # Dependencies
├── tsconfig.json                      # TypeScript config
├── next.config.ts                     # Next.js config (image domains)
├── postcss.config.mjs                # PostCSS config (Tailwind)
├── eslint.config.mjs                 # ESLint config
│
└── README.md                          # Basic README
└── EXAM_SETUP.md                      # Exam setup guide
```

---

## Belangrijke Features & Flows

### 1. Module & Lesson Flow

**Dashboard** (`/dashboard`):
- Toont alle modules met progress percentage
- Toont volgende les link (als access level >= 2)
- Active module highlight
- Progress stats (totaal bekeken/totaal lessen)

**Module Detail** (`/module/[id]`):
- Lijst van lessen in module
- Progress bar (watched/total)
- Les unlocking: les N is unlocked als alle vorige lessen watched zijn
- Access level check: Basic users zien lessen maar kunnen niet openen
- Module locking: Module N is locked als exam van Module N-1 niet geslaagd is
- Exam CTA: Toont "Start examen" als alle lessen watched zijn
- Praktijklessen sectie (alleen voor Full access)

**Lesson Detail** (`/lesson/[id]`):
- Vimeo video player (alleen voor access level >= 2)
- Basic users zien lock screen
- Auto-save progress wanneer video ended
- Vorige/Volgende navigatie
- Les lijst sidebar met progress indicators
- Exam link na laatste les (als exam bestaat)
- Volgende module link (als exam geslaagd)

### 2. Exam Flow

**Exam Access**:
- Alleen voor access level >= 2
- Alle lessen in module moeten watched zijn
- Exam wordt geladen via `getExamByModuleId(moduleId)`

**Exam Interface**:
- Intro screen met aantal vragen en passing threshold (75%)
- Question-by-question navigatie
- Mini-map voor snel navigeren
- Progress bar
- Keyboard shortcuts (pijltjes links/rechts)
- Confirmation modal voor submit

**Exam Submission**:
- Score berekening (correct/total)
- Pass/fail check (>= 75%)
- Result opslaan in `exam_results` table
- Question breakdown na submit
- Volgende module unlock als geslaagd

**Module Progression**:
- Module 1: Altijd unlocked voor access level >= 2
- Module N: Unlocked als exam van Module N-1 geslaagd is

### 3. Progress Tracking

**Automatic Tracking**:
- Vimeo player `ended` event → upsert in `progress` table
- `watched: true`, `watched_at: timestamp`
- Unique constraint op `(student_id, lesson_id)`

**Progress Queries**:
- `getWatchedLessonIds(studentId, lessonIds)` → Set van watched lesson IDs
- Gebruikt voor unlocking logic
- Gebruikt voor progress percentages

### 4. Access Level System

**Levels**:
- **1 (Basic)**: Basis toegang, geen video's, geen examens
- **2 (Full)**: Volledige toegang, alle video's, examens, mentorship
- **3 (Mentor)**: Zelfde als Full, extra mentor privileges (mogelijk)

**Access Checks**:
- Client-side: `getStoredStudentAccessLevel()` of `student.access_level`
- Server-side: Alleen in `/api/mentorship/access-check` route
- Middleware: Checkt alleen auth, niet access level

**UI Differences**:
- Basic: Lock icons, upgrade messages, disabled buttons
- Full: Alle features unlocked (behalve module gating)
- Mentor: Zelfde als Full + admin panel (students)

### 5. Community Page (`/updates`)

- Protected route (auth required). Toont een **Community** pagina met uitleg en een CTA-knop "Join de Discord" (free invite link, opent in new tab). Geen feed, geen Supabase updates-data. Navigatie toont dit als "Community".

### 6. Mentorship Flow

**Mentorship Page** (`/mentorship`):
- Grid van mentor cards
- Alleen zichtbaar voor access level >= 2
- API check: `/api/mentorship/access-check` (server-side validation)

**Mentor Types**:
- Technical Trading Mentors (Rousso, Jason): Unlocked bij 100% progress
- Mindset Coaches (Arno, Chris Henry): Always locked (isAlwaysLocked: true)

**Calendly Integration**:
- Modal met Calendly embed
- Mentor-specifieke Calendly URLs
- Direct booking vanuit platform

### 7. Student Data Sync

**Sync Points**:
1. Login/Register: Direct sync naar localStorage
2. StudentGate component: Sync op elke page load (als localStorage leeg)
3. Page components: Manual sync als studentId/accessLevel null

**Sync Logic**:
- Haal auth user op
- Query `students` table via `auth_user_id`
- Als niet gevonden → fallback naar email lookup
- Als nog niet gevonden → create (alleen bij login/register)
- Update localStorage

**Probleem**: Te veel sync points, kan inconsistent zijn

---

## Environment Variables

### Vereist

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

### Supabase Project

**Project ID**: `trogwrgxxhsvixzglzpn` (zichtbaar in next.config.ts image domain)

**Storage Buckets**:
- `Cryptoriez`: Logo en andere platform assets (public read)

---

## Dependencies

### Production

```json
{
  "@radix-ui/react-progress": "^1.1.7",
  "@supabase/auth-helpers-nextjs": "^0.10.0",  // ⚠️ DEPRECATED
  "@supabase/supabase-js": "^2.76.1",
  "@supabase/ssr": "^0.5.2",
  "@vimeo/player": "^2.30.0",
  "framer-motion": "^12.23.24",
  "lucide-react": "^0.548.0",
  "next": "16.0.7",
  "react": "19.2.0",
  "react-dom": "19.2.0"
}
```

### Development

```json
{
  "@tailwindcss/postcss": "^4",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "eslint": "^9",
  "eslint-config-next": "16.0.7",
  "tailwindcss": "^4",
  "typescript": "^5"
}
```

### Upgrade Aanbevelingen

1. **@supabase/auth-helpers-nextjs → @supabase/ssr**: 
   - Modernere API
   - Betere Next.js 16 support
   - Server components support

2. **Next.js 16.0.0**: Check voor updates (mogelijk 16.1+ beschikbaar)

---

## Bekende Issues & Verbeterpunten

### Kritieke Issues

1. **Deprecated Auth Helpers**
   - `@supabase/auth-helpers-nextjs v0.10.0` is verouderd
   - Upgrade naar `@supabase/ssr` vereist
   - Middleware moet worden aangepast

2. **Authenticatie Flow Complexiteit**
   - Te veel fallback logica in LoginClient
   - Student sync op meerdere plekken
   - Geen duidelijke error states

3. **Security Gaps**
   - Access level checks vooral client-side
   - Geen server-side route protection voor access levels
   - Middleware checkt alleen auth, niet access level

### Medium Priority

4. **LocalStorage Dependency**
   - Student data cached in localStorage
   - Kan out-of-sync raken
   - Geen server-side validation

5. **Rate Limiting**
   - Alleen client-side
   - Geen server-side rate limiting
   - Cooldown timer is basic

6. **Email Verification**
   - Geen duidelijke flow
   - Users kunnen mogelijk zonder verificatie inloggen

### Low Priority / Nice to Have

7. **Error Handling**
   - Inconsistente error messages
   - Geen retry mechanisme
   - Geen error logging service

8. **Type Safety**
   - Veel `any` types in Supabase queries
   - Geen database type generation
   - Type definitions kunnen beter

9. **Performance**
   - Geen data caching (React Query/SWR)
   - Elke page load = nieuwe queries
   - Geen optimistic updates

10. **Testing**
    - Geen tests aanwezig
    - Geen E2E tests
    - Geen unit tests

### Verbeter Suggesties

#### Authenticatie Refactor

```typescript
// Nieuwe structuur:
// 1. Upgrade naar @supabase/ssr
// 2. Server-side student validation
// 3. Middleware met access level checks
// 4. API routes voor student data
// 5. Database triggers voor auto-sync
```

#### Database Improvements

```sql
-- Trigger voor auto-create student bij auth user creation
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function om student record te maken
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.students (email, auth_user_id, access_level)
  VALUES (NEW.email, NEW.id, 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Type Safety

```typescript
// Genereer types vanuit Supabase schema
// Gebruik Supabase CLI: supabase gen types typescript
// Import in code voor type safety
```

---

## Conclusie

Dit is een functioneel leerplatform met een solide basis, maar de authenticatie flow heeft verbetering nodig. De belangrijkste prioriteit is het upgraden van de auth helpers en het vereenvoudigen van de student sync logica.

**Eerste stappen voor ChatGPT project**:
1. Analyseer huidige authenticatie flow in detail
2. Plan upgrade naar @supabase/ssr
3. Vereenvoudig student sync logica
4. Voeg server-side access level checks toe
5. Test alle edge cases

---

**Laatste update**: 2024
**Versie**: 1.1
**Auteur**: Technische documentatie voor ChatGPT project setup

**Changelog v1.1**:
- Toegevoegd: ImageModal component (fullscreen image viewing, o.a. landing)
- Toegevoegd: `@supabase/ssr` dependency
- Updated: Next.js naar 16.0.7

**Changelog v1.2** (Updates feature removed):
- Verwijderd: Updates feed; `/updates` is nu Community-pagina met Discord CTA
- Verwijderd: `updates` en `update_reads` tabellen (migratie), `update-images` bucket (handmatig in Dashboard verwijderen)
- Verwijderd: MarkdownRenderer, `src/lib/updates.ts`; dependencies `marked`, `dompurify`, `@types/dompurify`

