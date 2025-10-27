# Cryptoriez Learning Platform

A comprehensive video trading course platform built with Next.js 15 and Supabase.

## 🎯 Overview

This is an MVP online learning platform for Cryptoriez where students learn trading through videos. The platform includes:

- Module overview with lessons
- Individual lesson pages with Vimeo video players
- Progress tracking integration with Supabase
- Clean, modern UI with dark theme

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase project with the following tables:
  - `modules`
  - `lessons`
  - `students`
  - `progress`
  - `exams`
  - `exam_questions`
  - `exam_results`

### Setup

1. Clone the repository:
```bash
git clone https://github.com/6ftwardje/video-trading-course.git
cd video-trading-course
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables by editing `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                 # Dashboard (modules overview)
│   ├── module/[id]/page.tsx     # Lessons overview
│   └── lesson/[id]/page.tsx     # Vimeo player + progress tracking
├── lib/
│   └── supabaseClient.ts        # Supabase client configuration
└── globals.css                   # Global styles with Tailwind
```

## 🎨 Features

- **Module Dashboard**: View all available modules
- **Lesson Overview**: Browse lessons within a module
- **Video Player**: Integrated Vimeo player with progress tracking
- **Progress Tracking**: Automatically saves progress when videos are completed
- **Dark Theme**: Modern dark UI with custom Cryptoriez colors

## 🛠️ Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase (Database + API)
- Vimeo Player
- Radix UI (Progress components)
- Lucide Icons

## 📝 Environment Variables

Make sure to set up these environment variables in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 🔐 Supabase Setup

The backend includes the following tables:

- **modules**: Course modules
- **lessons**: Individual lessons with video URLs
- **students**: Student information
- **progress**: Track lesson completion
- **exams**: Exam information
- **exam_questions**: Questions for exams
- **exam_results**: Exam results

Public policies are already configured for SELECT and INSERT operations.

## 🚀 Deployment

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com):

```bash
npm run build
```

Or deploy directly to Vercel by connecting your GitHub repository.

## 📄 License

This project is private and proprietary to Cryptoriez.
