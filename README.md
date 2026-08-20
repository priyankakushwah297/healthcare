# 🏥 Healthcare Center - Full-Stack Hospital & EHR Management System

A modern, production-grade Healthcare and Electronic Health Records (EHR) Platform built with React, TypeScript, Tailwind CSS, Django REST Framework, Supabase PostgreSQL, and Cloudinary.

---

## 🚀 Architecture & Services

- **Frontend**: React + TypeScript + Vite + Tailwind CSS (Deploy on **Vercel**)
- **Backend**: Django REST Framework + WhiteNoise (Deploy on **Vercel** as Serverless WSGI)
- **Database**: **Supabase** (Managed PostgreSQL)
- **Media Storage**: **Cloudinary** (Secure image & avatar storage)

---

## 🛠️ Deployment Guide (Vercel)

### 1. Deploying the Backend on Vercel
1. In Vercel, click **Add New Project** and import the `backend` directory from your repository.
2. In **Environment Variables**, add the following:
   - `SECRET_KEY`: `your-django-secret-key`
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `*`
   - `CORS_ALLOW_ALL_ORIGINS`: `True`
   - `DATABASE_URL`: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require`
   - `SUPABASE_URL`: `https://[PROJECT_REF].supabase.co`
   - `SUPABASE_KEY`: `your-supabase-publishable-or-anon-key`
   - `CLOUDINARY_URL`: `cloudinary://[API_KEY]:[API_SECRET]@[CLOUD_NAME]`
   - `CLOUDINARY_CLOUD_NAME`: `your-cloud-name`
   - `CLOUDINARY_API_KEY`: `your-api-key`
   - `CLOUDINARY_API_SECRET`: `your-api-secret`
3. Click **Deploy**. Your backend API will be live at `https://your-backend-project.vercel.app`.

---

### 2. Deploying the Frontend on Vercel
1. In Vercel, click **Add New Project** and import the `frontend` directory.
2. Framework Preset: **Vite**
3. In **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-backend-project.vercel.app/api`
4. Click **Deploy**. Your hospital portal will be live!

---

## 💻 Local Development Setup

### Backend (Django)
```bash
cd backend
python -m venv env
# On Windows:
env\Scripts\activate
# On Mac/Linux:
source env/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Security Best Practices
- All secret credentials, API keys, database connection strings, and Cloudinary tokens are strictly stored in `.env` files and omitted from version control.
- `.env.example` templates are provided in both `frontend` and `backend` for seamless configuration.
