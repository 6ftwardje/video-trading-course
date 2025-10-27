# Exam Feature Setup Guide

The exam feature requires database tables in your Supabase project. Follow these steps to set it up.

## Quick Setup Steps

### 1. Open Supabase SQL Editor
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project: `trogwrgxxhsvixzglzpn`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### 2. Run the Migration
Copy and paste the contents of `supabase_migrations.sql` into the SQL Editor and click **Run** (or press Cmd/Ctrl + Enter).

This will create:
- `exams` table - stores exam information per module
- `exam_questions` table - stores questions for each exam
- `exam_results` table - stores student exam results

### 3. Insert Sample Data (or create your own)
After running the migration, you can either:
- Use the sample exam included in the SQL (Module 1)
- Create your own exams via the Supabase Table Editor or SQL

### 4. Create Your Own Exam Questions
You can add questions via SQL:

```sql
-- First, get your exam_id
SELECT id FROM exams WHERE module_id = 1;

-- Then insert questions (replace EXAM_ID with the actual ID)
INSERT INTO exam_questions (exam_id, question, options, correct_answer)
VALUES 
  (1, 'Your question here?', 
   ARRAY['Option 1', 'Option 2', 'Option 3', 'Option 4'],
   'Correct Answer'),
  (1, 'Another question?', 
   ARRAY['Option A', 'Option B', 'Option C', 'Option D'],
   'Correct Answer');
```

### 5. Verify It Works
1. Go back to your module page (http://localhost:3000/module/1)
2. If you've completed all lessons, you should now see the exam CTA
3. Click "Start examen" to test

## Troubleshooting

### Error: 406 Not Acceptable
This means the tables don't exist yet. Run the migration in step 2.

### Error: Permission denied
Check your RLS (Row Level Security) policies in Supabase:
1. Go to **Authentication** > **Policies**
2. Make sure the policies from the migration are applied

### No exam button showing
- Make sure you've watched ALL lessons in the module
- Check browser console for errors
- Verify the exam exists: `SELECT * FROM exams WHERE module_id = 1;`

## Testing the Setup

After setup, test the flow:
1. Complete all lessons in module 1
2. Refresh the module page
3. You should see "Examen van deze module is klaar"
4. Click "Start examen"
5. Answer the questions and submit

