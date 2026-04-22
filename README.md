# 🌳 FamilyRoot — Family Tree Web Application

A full-stack **Family Tree Web Application** built with Next.js 15 (App Router), TypeScript, MongoDB, ReactFlow, Zustand, and PWA capabilities.

---

## ✨ Features

### Authentication
- JWT-based auth stored in httpOnly cookies + localStorage
- Sign up, sign in, sign out
- Password reset flow (token-based)
- Protected routes via layout guards

### Family Tree Management
- Create, edit, delete multiple trees
- Description, public/private toggle, share tokens
- Member count aggregated from DB

### Interactive Tree Visualization (ReactFlow)
- Drag-and-drop nodes with auto-save positions
- Zoom, pan, minimap
- Color-coded nodes by gender (blue = male, pink = female, purple = other)
- Edge types with visual distinction:
  - **Parent→Child**: solid purple arrow
  - **Spouse/Partner**: animated dashed pink
  - **Sibling**: dotted blue
- Click-drag between node handles to create relationships
- In-canvas edit/delete/add-relationship buttons per node

### Member Management
- Full CRUD: first name, last name, gender, DOB, date of death, bio, occupation, birth place, photo URL
- tabbed modal UI (Basic / Details)

### Relationships
- Parent-child, spouse/partner, sibling types
- Notes field per relationship
- Visual sidebar list with delete

### Sharing & Export
- Toggle trees public/private
- Unique shareable URL per tree (`/share/<token>`)
- Read-only public view
- JSON export of full tree data

### PWA
- `manifest.json` with icons
- `sw.js` service worker: network-first for API, cache-first for static
- Background sync stub for offline mutations
- Installable on mobile (Add to Home Screen)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS Variables |
| State | Zustand (persisted) |
| Visualization | ReactFlow v11 |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Fonts | Fraunces (display) + DM Sans (body) |
| Toasts | react-hot-toast |
| PWA | Custom SW + manifest |
| Dates | date-fns |

---

## 📁 Project Structure

```
family-tree/
├── app/
│   ├── (auth)/               # Login & Register pages
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/          # Authenticated area
│   │   ├── layout.tsx        # Nav + auth guard
│   │   ├── dashboard/page.tsx
│   │   └── tree/[id]/page.tsx
│   ├── api/
│   │   ├── auth/             # login, register, logout, reset-password
│   │   ├── trees/            # CRUD trees + members + relationships + export
│   │   └── share/[token]/    # Public share endpoint
│   ├── share/[token]/page.tsx # Public read-only tree view
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Landing / redirect
├── components/
│   ├── tree/
│   │   ├── TreeCanvas.tsx    # ReactFlow wrapper
│   │   ├── MemberNode.tsx    # Custom RF node
│   │   ├── MemberModal.tsx   # Add/edit member
│   │   ├── RelationshipModal.tsx
│   │   ├── TreeSidebar.tsx
│   │   ├── TreeToolbar.tsx
│   │   ├── EditTreeModal.tsx
│   │   └── ShareModal.tsx
│   └── ServiceWorkerRegistrar.tsx
├── lib/
│   ├── api.ts                # Frontend API client
│   ├── auth.ts               # JWT utilities
│   ├── db.ts                 # MongoDB connection
│   └── validation.ts         # Input sanitisation
├── models/
│   ├── User.ts
│   ├── FamilyTree.ts
│   ├── Member.ts
│   └── Relationship.ts
├── store/
│   ├── authStore.ts          # Zustand auth (persisted)
│   └── treeStore.ts          # Zustand tree data
├── types/index.ts
└── public/
    ├── manifest.json
    ├── sw.js
    └── icons/
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.local` and fill in your values:
```env
MONGODB_URI=mongodb://localhost:27017/familytree
JWT_SECRET=your-super-secret-key-min-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Production build
```bash
npm run build
npm start
```

---

## 🗄️ Database Schema

### Users
```
_id, name, email (unique), password (hashed), resetToken?, resetTokenExpiry?, timestamps
```

### FamilyTrees
```
_id, name, description, owner (→User), collaborators[], isPublic, shareToken (unique), timestamps
```

### Members
```
_id, treeId (→FamilyTree), firstName, lastName, gender, dateOfBirth?, dateOfDeath?,
isAlive, bio?, photo?, birthPlace?, occupation?, positionX, positionY, timestamps
```

### Relationships
```
_id, treeId, type (parent-child|spouse|sibling), sourceId (→Member), targetId (→Member),
startDate?, endDate?, notes?, timestamps
Unique index: (treeId, type, sourceId, targetId)
```

---

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens expire in 7 days
- httpOnly cookies for session tokens
- Input sanitisation on all write endpoints
- Route protection via auth guards in layouts
- MongoDB query uses ObjectId — no raw string injection

---

## 📱 PWA Usage

- The service worker (`/public/sw.js`) is auto-registered in production
- API GET responses are cached for offline viewing
- The app is installable via "Add to Home Screen" on mobile browsers

---

## 🎁 Bonus Features Included

- ✅ Shareable public/private links
- ✅ JSON export of full tree
- ✅ Read-only public share view
- ✅ PWA installable + offline cache
- 🔲 PDF export (html2canvas + jspdf installed, UI hookup optional)
- 🔲 Collaboration (collaborators array in model, permission checks in API)
- 🔲 Version history (architectural stub via position saves)

---

## 🌐 Deployment

### Vercel (recommended)
```bash
npx vercel
```
Set environment variables in the Vercel dashboard.

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### MongoDB Atlas
Replace `MONGODB_URI` with your Atlas connection string.

---

## 📄 License

MIT — free to use, modify, and distribute.
