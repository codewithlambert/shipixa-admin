# Shipixa Admin Dashboard

Standalone admin dashboard for managing shipments, tracking updates, and packages.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase credentials (SAME as main site)
   - Update `NEXT_PUBLIC_SITE_URL` to your admin dashboard URL

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Admin dashboard will run on `http://localhost:3001`

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Features

- ✅ Admin authentication with role-based access
- ✅ Create and manage shipments
- ✅ Add tracking updates with timeline
- ✅ Upload shipment images
- ✅ Manage packages
- ✅ Email notifications to customers
- ✅ Dashboard with statistics

## Admin Login

Default admin credentials need to be created in Supabase:
1. Create user in Supabase Auth
2. Add user to `user_roles` table with role='admin'

## Tech Stack

- Next.js 16
- React 19
- Supabase (Database + Auth + Storage)
- Tailwind CSS
- TypeScript
- Resend (Email)

## Deployment

Deploy to Vercel, Netlify, or any Node.js hosting platform.

**Important:** Use the SAME Supabase credentials as the main site!
