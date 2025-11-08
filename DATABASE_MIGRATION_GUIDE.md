# 🗄️ BOOMER_ANG DATABASE MIGRATION GUIDE

## Overview

This guide will help you apply the Boomer_Ang database migration to your Supabase instance.

---

## 📋 What Gets Created

### Tables (6)
1. **boomer_angs** - Main AI agent definitions
2. **user_boomer_angs** - User ownership & rentals
3. **boomer_ang_runs** - Execution history
4. **boomer_ang_ratings** - User reviews
5. **marketplace_transactions** - Purchases/rentals
6. **sandbox_sessions** - Testing sessions

### Premade Boomer_Angs (8)
1. ✅ **Code Review Expert** - Security & best practices
2. ✅ **IDE Code Assistant** - Real-time IDE/CLI/Editor integration
3. ✅ **Deep Research Boomer_Ang** - Enterprise multi-source analysis
4. ✅ **App Creation Assistant** - Full-stack application builder
5. ✅ **Course Creator** - Educational content & curriculum design
6. ✅ **Data Analysis Pro** - Statistics & visualizations
7. ✅ **Content Creator AI** - SEO-optimized writing
8. ✅ **Customer Support Bot** - 24/7 assistance

---

## 🚀 Migration Options

### Option 1: Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Visit https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy & Paste Migration**
   - Open `supabase/migrations/0003_boomer_ang.sql`
   - Copy ALL content (400+ lines)
   - Paste into SQL Editor

4. **Run Migration**
   - Click "Run" button
   - Wait for completion (~10 seconds)
   - Should see "Success" message

5. **Verify Tables**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'boomer%';
   ```
   Should return 6 tables.

6. **Verify Seed Data**
   ```sql
   SELECT name, effectiveness_level, is_premade 
   FROM boomer_angs 
   WHERE is_premade = true;
   ```
   Should return 8 premade Boomer_Angs.

---

### Option 2: Supabase CLI (If Installed)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Push migration
supabase db push

# Verify
supabase db pull
```

---

### Option 3: psql Command Line

```bash
# If you have psql installed
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" -f supabase/migrations/0003_boomer_ang.sql

# Verify
psql "postgresql://..." -c "SELECT COUNT(*) FROM boomer_angs WHERE is_premade = true;"
# Should return: 8
```

---

### Option 4: pgAdmin (GUI Tool)

1. **Install pgAdmin**
   - Download from https://www.pgadmin.org/

2. **Connect to Supabase**
   - Get connection string from Supabase Dashboard
   - Settings → Database → Connection string

3. **Run Migration**
   - Right-click database → Query Tool
   - Paste migration SQL
   - Click Execute (F5)

---

## ✅ Post-Migration Checklist

After running the migration, verify:

- [ ] **6 Tables Created**
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN (
    'boomer_angs', 
    'user_boomer_angs', 
    'boomer_ang_runs',
    'boomer_ang_ratings',
    'marketplace_transactions',
    'sandbox_sessions'
  );
  ```

- [ ] **8 Premade Boomer_Angs Seeded**
  ```sql
  SELECT name FROM boomer_angs WHERE is_premade = true;
  ```
  Expected:
  1. Code Review Expert
  2. IDE Code Assistant
  3. Deep Research Boomer_Ang
  4. App Creation Assistant
  5. Course Creator
  6. Data Analysis Pro
  7. Content Creator AI
  8. Customer Support Bot

- [ ] **RLS Policies Enabled**
  ```sql
  SELECT schemaname, tablename, policyname 
  FROM pg_policies 
  WHERE tablename LIKE 'boomer%';
  ```
  Should return ~18 policies.

- [ ] **Triggers Created**
  ```sql
  SELECT trigger_name, event_object_table 
  FROM information_schema.triggers 
  WHERE event_object_table LIKE 'boomer%';
  ```
  Should return ~6 triggers.

- [ ] **Views Created**
  ```sql
  SELECT table_name 
  FROM information_schema.views 
  WHERE table_schema = 'public' 
  AND table_name LIKE '%agent%';
  ```
  Should return 2 views:
  - marketplace_listings
  - user_agent_collection

---

## 🔧 Troubleshooting

### Error: "relation already exists"
**Solution:** Tables already created. Either:
- Drop existing tables and re-run
- Or skip migration (tables exist)

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'boomer_angs';

-- If exists, either continue or drop
DROP TABLE IF EXISTS boomer_angs CASCADE;
```

---

### Error: "permission denied"
**Solution:** Use service role key or database password.

Go to Supabase Dashboard → Settings → API
- Use `service_role` key (not `anon` key)
- Or use database password from Settings → Database

---

### Error: "syntax error near..."
**Solution:** Ensure you copied ENTIRE migration file.

The file is 400+ lines. Make sure you:
1. Selected ALL content (Ctrl+A)
2. Copied everything
3. Pasted into SQL editor
4. Didn't truncate any lines

---

### Verify Seed Data
```sql
-- Should return 8 rows
SELECT 
  name,
  category,
  effectiveness_level,
  array_length(features, 1) as feature_count
FROM boomer_angs 
WHERE is_premade = true
ORDER BY effectiveness_level DESC, name;
```

Expected output:
```
name                      | category           | effectiveness_level | feature_count
--------------------------+--------------------+--------------------+--------------
Deep Research Boomer_Ang  | Research           | Enterprise         | 8
IDE Code Assistant        | Coding Assistant   | Premium            | 8
App Creation Assistant    | Coding Assistant   | Premium            | 8
Data Analysis Pro         | Data Analysis      | Premium            | 5
Code Review Expert        | Coding Assistant   | Advanced           | 5
Course Creator            | Education          | Advanced           | 8
Content Creator AI        | Content Creation   | Advanced           | 5
Customer Support Bot      | Customer Support   | Basic              | 5
```

---

## 🎯 Environment Variables

Ensure these are in your `.env`:

```env
# Supabase (already configured)
VITE_SUPABASE_URL=https://[YOUR_PROJECT].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (for backend)

# R2 Storage (for Boomer_Ang images)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=boomer-ang-images

# Payment (for marketplace)
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
```

---

## 📊 Database Stats

After migration:
- **Tables**: 6
- **Views**: 2
- **Triggers**: 6
- **RLS Policies**: 18
- **Seed Data**: 8 Boomer_Angs
- **Indexes**: 15
- **Functions**: 5

---

## 🚀 Next Steps

1. ✅ **Apply Migration** (using one of the 4 options above)
2. ✅ **Verify Tables** (run checklist queries)
3. ✅ **Test Frontend** - Visit `/boomer-angs` while signed in
4. ✅ **Create Test Boomer_Ang** - Click "Create New Boomer_Ang"
5. ✅ **Explore Premade Library** - Browse 8 professional Boomer_Angs

---

## 📝 Migration File Location

```
c:\Users\rishj\OneDrive\Desktop\Nurds_Code_Dot_Com\supabase\migrations\0003_boomer_ang.sql
```

**Size**: ~25 KB  
**Lines**: ~460  
**Tables**: 6  
**Seed Data**: 8 Boomer_Angs  

---

## ✅ Success Indicators

You'll know the migration succeeded when:

1. **No errors** in SQL execution
2. **6 tables** visible in Supabase Dashboard → Database → Tables
3. **8 premade Boomer_Angs** show in `/boomer-angs` → Premade Library tab
4. **Can create** new Boomer_Ang via dashboard
5. **RLS policies** protect user data (can only see your own Boomer_Angs)

---

## 🆘 Need Help?

If migration fails:
1. Check Supabase logs (Dashboard → Logs)
2. Verify you're using correct database
3. Ensure service role key is correct
4. Try running in smaller chunks (tables first, then seed data)

---

## 🎉 You're Ready!

Once migration completes:
- Visit **`/boomer-angs`** in your app
- See 8 professional Boomer_Angs in Premade Library
- Create your first custom Boomer_Ang
- Test in Testing Lab (Sandbox)
- Explore Creator Economy (Marketplace)

**Happy Building!** 🤖✨
