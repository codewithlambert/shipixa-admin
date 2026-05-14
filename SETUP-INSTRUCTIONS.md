# Admin Dashboard Setup Instructions

## Files Already Created ✅

The following files have been created in the `admin-dashboard/` folder:
- `package.json`
- `.env.local.example`
- `README.md`
- `tsconfig.json`
- `next.config.ts`
- `postcss.config.mjs`
- `.gitignore`
- `app/globals.css`
- `app/layout.tsx`
- `app/page.tsx`
- `app/login/page.tsx`
- `app/orders/page.tsx`

## Files You Need to Copy Manually

### 1. Copy Remaining App Routes

From `app/admin/orders/` to `admin-dashboard/app/orders/`:

```bash
# Create page
cp app/admin/orders/create/page.tsx admin-dashboard/app/orders/create/page.tsx

# Detail page
cp app/admin/orders/[id]/page.tsx admin-dashboard/app/orders/[id]/page.tsx

# Update page
cp app/admin/orders/[id]/update/page.tsx admin-dashboard/app/orders/[id]/update/page.tsx
```

**IMPORTANT:** After copying, update all route references:
- Change `/admin/orders` → `/orders`
- Change `/admin/login` → `/login`

### 2. Copy API Routes

From `app/api/` to `admin-dashboard/app/api/`:

```bash
# Copy entire API folder structure
cp -r app/api/check-role admin-dashboard/app/api/
cp -r app/api/orders admin-dashboard/app/api/
cp -r app/api/packages admin-dashboard/app/api/
cp -r app/api/tracking-updates admin-dashboard/app/api/
cp -r app/api/send-email admin-dashboard/app/api/
cp -r app/api/preview-email admin-dashboard/app/api/
```

### 3. Copy Components

From `components/` to `admin-dashboard/components/`:

```bash
cp components/AdminLayout.tsx admin-dashboard/components/
cp components/DeleteOrderButton.tsx admin-dashboard/components/
cp components/OrderImages.tsx admin-dashboard/components/
cp components/PackagesList.tsx admin-dashboard/components/
cp components/StatusBadge.tsx admin-dashboard/components/
cp components/TrackingTimeline.tsx admin-dashboard/components/
cp components/CopyButton.tsx admin-dashboard/components/
```

**IMPORTANT:** Update `AdminLayout.tsx` route references:
- Change `/admin/orders` → `/orders`
- Change `/admin/orders/create` → `/orders/create`
- Change `/admin/login` → `/login`

### 4. Copy Lib Files

From `lib/` to `admin-dashboard/lib/`:

```bash
cp lib/supabase.ts admin-dashboard/lib/
cp lib/supabase-admin.ts admin-dashboard/lib/
cp lib/supabase-browser.ts admin-dashboard/lib/
cp lib/supabase-server.ts admin-dashboard/lib/
cp lib/auth.ts admin-dashboard/lib/
cp lib/email-template.ts admin-dashboard/lib/
cp -r lib/emails admin-dashboard/lib/
```

### 5. Copy Middleware

```bash
cp middleware.ts admin-dashboard/middleware.ts
```

**IMPORTANT:** Update middleware to remove `/admin` prefix checks:

```typescript
// Change this:
if (!pathname.startsWith('/admin') || pathname === '/admin/login' || pathname.startsWith('/api/')) {
  return NextResponse.next()
}

// To this:
if (pathname === '/login' || pathname.startsWith('/api/')) {
  return NextResponse.next()
}

// And change redirect:
loginUrl.pathname = '/login'  // Remove /admin prefix
```

### 6. Create .env.local

```bash
cp admin-dashboard/.env.local.example admin-dashboard/.env.local
```

Then edit `admin-dashboard/.env.local` with your actual Supabase credentials (SAME as main site).

## Quick Copy Script (Bash/Linux/Mac)

Save this as `copy-admin-files.sh` and run it:

```bash
#!/bin/bash

# Create directories
mkdir -p admin-dashboard/app/orders/create
mkdir -p admin-dashboard/app/orders/[id]/update
mkdir -p admin-dashboard/app/api
mkdir -p admin-dashboard/components
mkdir -p admin-dashboard/lib/emails

# Copy app routes
cp app/admin/orders/create/page.tsx admin-dashboard/app/orders/create/
cp app/admin/orders/[id]/page.tsx admin-dashboard/app/orders/[id]/
cp app/admin/orders/[id]/update/page.tsx admin-dashboard/app/orders/[id]/update/

# Copy API routes
cp -r app/api/check-role admin-dashboard/app/api/
cp -r app/api/orders admin-dashboard/app/api/
cp -r app/api/packages admin-dashboard/app/api/
cp -r app/api/tracking-updates admin-dashboard/app/api/
cp -r app/api/send-email admin-dashboard/app/api/
cp -r app/api/preview-email admin-dashboard/app/api/

# Copy components
cp components/*.tsx admin-dashboard/components/

# Copy lib files
cp lib/*.ts admin-dashboard/lib/
cp -r lib/emails admin-dashboard/lib/

# Copy middleware
cp middleware.ts admin-dashboard/

echo "✅ Files copied! Now update route references in:"
echo "  - admin-dashboard/components/AdminLayout.tsx"
echo "  - admin-dashboard/middleware.ts"
echo "  - admin-dashboard/app/orders/create/page.tsx"
echo "  - admin-dashboard/app/orders/[id]/page.tsx"
echo "  - admin-dashboard/app/orders/[id]/update/page.tsx"
```

## Quick Copy Script (Windows PowerShell)

Save this as `copy-admin-files.ps1` and run it:

```powershell
# Create directories
New-Item -ItemType Directory -Force -Path "admin-dashboard/app/orders/create"
New-Item -ItemType Directory -Force -Path "admin-dashboard/app/orders/[id]/update"
New-Item -ItemType Directory -Force -Path "admin-dashboard/app/api"
New-Item -ItemType Directory -Force -Path "admin-dashboard/components"
New-Item -ItemType Directory -Force -Path "admin-dashboard/lib/emails"

# Copy app routes
Copy-Item "app/admin/orders/create/page.tsx" "admin-dashboard/app/orders/create/"
Copy-Item "app/admin/orders/[id]/page.tsx" "admin-dashboard/app/orders/[id]/"
Copy-Item "app/admin/orders/[id]/update/page.tsx" "admin-dashboard/app/orders/[id]/update/"

# Copy API routes
Copy-Item -Recurse "app/api/check-role" "admin-dashboard/app/api/"
Copy-Item -Recurse "app/api/orders" "admin-dashboard/app/api/"
Copy-Item -Recurse "app/api/packages" "admin-dashboard/app/api/"
Copy-Item -Recurse "app/api/tracking-updates" "admin-dashboard/app/api/"
Copy-Item -Recurse "app/api/send-email" "admin-dashboard/app/api/"
Copy-Item -Recurse "app/api/preview-email" "admin-dashboard/app/api/"

# Copy components
Copy-Item "components/*.tsx" "admin-dashboard/components/"

# Copy lib files
Copy-Item "lib/*.ts" "admin-dashboard/lib/"
Copy-Item -Recurse "lib/emails" "admin-dashboard/lib/"

# Copy middleware
Copy-Item "middleware.ts" "admin-dashboard/"

Write-Host "✅ Files copied! Now update route references."
```

## Route Reference Updates

After copying files, use Find & Replace in your editor:

### In all copied files:
- Find: `/admin/orders` → Replace: `/orders`
- Find: `/admin/login` → Replace: `/login`
- Find: `href="/admin/` → Replace: `href="/`
- Find: `router.push('/admin/` → Replace: `router.push('/`
- Find: `window.location.href = '/admin/` → Replace: `window.location.href = '/`

### Specific file updates:

**admin-dashboard/components/AdminLayout.tsx:**
```typescript
const navItems = [
  { href: '/orders', label: 'Dashboard', icon: '▦', exact: true },
  { href: '/orders', label: 'All Orders', icon: '📦', exact: false },
  { href: '/orders/create', label: 'Create Shipment', icon: '➕', exact: true },
]
```

**admin-dashboard/middleware.ts:**
```typescript
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname === '/login' || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // ... rest of auth logic

  if (!user) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|login).*)'],
}
```

## Final Steps

1. **Install dependencies:**
   ```bash
   cd admin-dashboard
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```
   Admin dashboard will run on `http://localhost:3001`

4. **Test login:**
   - Go to `http://localhost:3001`
   - Should redirect to `/login`
   - Login with admin credentials
   - Should redirect to `/orders`

## Deployment

Deploy to Vercel:
```bash
vercel
```

Or any other hosting platform that supports Next.js.

**Remember:** Use the SAME Supabase credentials as your main site!

## Troubleshooting

### "Module not found" errors
- Make sure all files are copied
- Check that `@/` path alias is working (tsconfig.json)

### "Supabase connection failed"
- Verify `.env.local` has correct credentials
- Check that credentials match main site

### "Access denied" on login
- Verify user exists in Supabase Auth
- Check `user_roles` table has admin entry

### Routes not working
- Make sure all `/admin/` prefixes are removed
- Check middleware matcher pattern
- Verify Next.js app directory structure

## Need Help?

Check the main `ADMIN-SEPARATION-GUIDE.md` for detailed architecture and deployment instructions.
