# Deployment Guide (Vercel / v0)

This project is prepared for deployment to Vercel. Follow these steps to ensure a smooth deployment.

## 1. Environment Variables

Vercel needs the following environment variables to connect to your Supabase instance. You can find these in your `.env` file or Supabase project settings.

| Variable | Description |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Project Anon/Public Key |

**Note**: In Vercel, make sure to add these in the **Project Settings > Environment Variables** section.

## 2. Configuration Files

- **`vercel.json`**: Included in the root directory. It handles client-side routing so that refreshing pages (like `/dashboard`) works correctly.
- **`.env.example`**: Included as a template for required variables.

## 3. Deployment Steps

1. **Connect to GitHub**: Link your repository to Vercel.
2. **Framework Preset**: Vercel should automatically detect **Vite**.
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**: Add the variables listed above.
6. **Deploy**: Click deploy!

## 4. GitHub Branching

As requested, ensure you are working on a single branch (usually `main`). 
- If you have multiple branches, merge them into `main`:
  ```bash
  git checkout main
  git merge your-feature-branch
  ```
- To keep the repo clean, you can delete other branches once merged.

## 5. Voiceflow Chatbot

The chatbot is integrated via a React component and will work automatically on the deployed URL. No additional setup is required for the chatbot to appear on the production site.
