# TaskFlow - Collaborative Task Management Platform

<div align="center">

![TaskFlow Banner](https://img.shields.io/badge/TaskFlow-Task%20Management-blue?style=for-the-badge)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

**A modern, real-time collaborative task management application inspired by Trello and Notion**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

TaskFlow is a full-stack, production-ready task management platform that enables teams to organize work using intuitive Kanban boards. With real-time synchronization, drag-and-drop functionality, and seamless team collaboration, TaskFlow brings modern project management to your fingertips.

### Key Highlights

- 🎯 **Kanban Boards** - Visual task organization with customizable lists
- 🔄 **Real-Time Sync** - Live updates across all team members using Pusher
- 🎨 **Drag & Drop** - Intuitive task and list reordering
- 👥 **Team Collaboration** - Invite members and manage permissions
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt password hashing
- 💬 **Comments System** - Discuss tasks with your team
- 📱 **Responsive Design** - Beautiful UI that works on all devices

---

## 🚀 Features

### ✅ Implemented Features

#### Authentication & User Management

- Custom JWT-based authentication system
- Secure password hashing with bcryptjs
- User registration and login
- Protected routes with middleware
- Auto-login on page refresh
- Token-based session management

#### UI/UX

- Professional landing page with hero section
- Feature showcase and statistics
- Responsive navigation
- Toast notifications for user feedback
- Loading states and error handling
- Modern gradient designs

#### Real-Time Infrastructure

- Pusher WebSocket integration
- Server and client-side real-time setup
- Live connection testing verified

#### Database

- PostgreSQL database on Supabase
- Prisma ORM with type-safe queries
- 6 relational models (User, Board, BoardMember, List, Card, Comment)
- Database migrations managed

### 🚧 In Development

#### Boards Management

- Create, read, update, delete boards
- Board customization and colors
- User dashboard with all boards

#### Kanban Functionality

- List (column) management
- Card (task) creation and editing
- Drag-and-drop reordering
- Move cards between lists

#### Advanced Collaboration

- Team member invitations
- Role-based permissions
- Real-time activity indicators
- Comment threads on cards

---

## 🛠️ Tech Stack

### Frontend

| Technology        | Version | Purpose                              |
| ----------------- | ------- | ------------------------------------ |
| **Next.js**       | 16.0.4  | React framework with App Router      |
| **React**         | 19      | UI component library                 |
| **TypeScript**    | 5.9.3   | Type safety and developer experience |
| **Tailwind CSS**  | Latest  | Utility-first styling                |
| **Pusher Client** | Latest  | Real-time WebSocket client           |

### Backend

| Technology        | Version | Purpose                        |
| ----------------- | ------- | ------------------------------ |
| **Node.js**       | Latest  | JavaScript runtime             |
| **Express.js**    | Latest  | REST API framework             |
| **TypeScript**    | 5.9.3   | Type-safe backend code         |
| **Prisma**        | Latest  | Database ORM and migrations    |
| **PostgreSQL**    | Latest  | Relational database (Supabase) |
| **bcryptjs**      | Latest  | Password hashing               |
| **jsonwebtoken**  | Latest  | JWT token management           |
| **Pusher Server** | Latest  | Real-time WebSocket server     |

### Development Tools

- **ESLint** - Code linting and formatting
- **Git** - Version control (branch: `dev/1`)
- **npm** - Package management
- **ts-node-dev** - TypeScript hot reload

---

## 📁 Project Structure

### Frontend (`D:\Projects\Next Js\TaskFlow\taskflow`)

```
taskflow/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── page.tsx              # Custom login page
│   │   └── sign-up/
│   │       └── page.tsx              # Custom registration page
│   ├── boards/
│   │   └── [id]/
│   │       └── page.tsx              # Individual board view (Kanban)
│   ├── dashboard/
│   │   └── page.tsx                  # User dashboard (all boards)
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Landing page
├── components/
│   ├── ui/                           # Reusable UI components
│   └── ...                           # Feature components
├── contexts/
│   └── AuthContext.tsx               # Global auth state
├── lib/
│   └── pusher.ts                     # Pusher client configuration
├── prisma/
│   └── schema.prisma                 # Database schema
├── public/                           # Static assets
├── .env.local                        # Environment variables
├── next.config.js                    # Next.js configuration
├── tailwind.config.js                # Tailwind CSS configuration
└── package.json                      # Dependencies
```

### Backend (`D:\Projects\Next Js\TaskFlow\TaskFlow-backend`)

```
TaskFlow-backend/
├── src/
│   ├── controllers/
│   │   └── auth.controller.ts        # Authentication logic
│   ├── middleware/
│   │   └── auth.ts                   # JWT verification middleware
│   ├── routes/
│   │   └── auth.routes.ts            # Auth API routes
│   ├── utils/
│   │   └── jwt.ts                    # JWT helper functions
│   └── index.ts                      # Express server entry point
├── prisma/
│   └── schema.prisma                 # Database schema (synced with frontend)
├── .env                              # Backend environment variables
├── package.json                      # Backend dependencies
└── tsconfig.json                     # TypeScript configuration
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Board : owns
    User ||--o{ BoardMember : "member of"
    User ||--o{ Comment : writes
    Board ||--o{ BoardMember : has
    Board ||--o{ List : contains
    List ||--o{ Card : contains
    Card ||--o{ Comment : has

    User {
        string id PK
        string email UK
        string password
        string name
        string clerkId
    }

    Board {
        string id PK
        string title
        string ownerId FK
    }

    BoardMember {
        string id PK
        string boardId FK
        string userId FK
        string role
    }

    List {
        string id PK
        string title
        int order
        string boardId FK
    }

    Card {
        string id PK
        string title
        string description
        int order
        string listId FK
        string[] labels
        datetime dueDate
    }

    Comment {
        string id PK
        string text
        string cardId FK
        string authorId FK
        datetime createdAt
    }
```

### Models

#### User

Stores user account information with JWT authentication support.

| Field      | Type   | Constraints | Description            |
| ---------- | ------ | ----------- | ---------------------- |
| `id`       | String | PK, CUID    | Unique identifier      |
| `email`    | String | Unique      | User email address     |
| `password` | String | Required    | Bcrypt hashed password |
| `name`     | String | Optional    | Display name           |
| `clerkId`  | String | Optional    | Legacy Clerk ID        |

**Relations:**

- `boards` - Boards owned by user
- `memberIn` - Boards user is a member of
- `comments` - Comments authored by user

#### Board

Represents a project board (workspace).

| Field     | Type   | Constraints | Description       |
| --------- | ------ | ----------- | ----------------- |
| `id`      | String | PK, CUID    | Unique identifier |
| `title`   | String | Required    | Board name        |
| `ownerId` | String | FK → User   | Board creator     |

**Relations:**

- `owner` - User who owns the board
- `members` - Team members with access
- `lists` - Kanban columns in the board

#### BoardMember

Manages team collaboration and permissions.

| Field     | Type   | Constraints       | Description       |
| --------- | ------ | ----------------- | ----------------- |
| `id`      | String | PK, CUID          | Unique identifier |
| `boardId` | String | FK → Board        | Associated board  |
| `userId`  | String | FK → User         | Team member       |
| `role`    | String | Default: "member" | Permission level  |

**Unique Constraint:** `[boardId, userId]` - Prevents duplicate memberships

#### List

Kanban columns (e.g., "To Do", "In Progress", "Done").

| Field     | Type   | Constraints | Description       |
| --------- | ------ | ----------- | ----------------- |
| `id`      | String | PK, CUID    | Unique identifier |
| `title`   | String | Required    | Column name       |
| `order`   | Int    | Required    | Display order     |
| `boardId` | String | FK → Board  | Parent board      |

**Unique Constraint:** `[boardId, order]` - Ensures unique ordering per board

#### Card

Individual tasks within lists.

| Field         | Type     | Constraints | Description       |
| ------------- | -------- | ----------- | ----------------- |
| `id`          | String   | PK, CUID    | Unique identifier |
| `title`       | String   | Required    | Task title        |
| `description` | String   | Optional    | Task details      |
| `order`       | Int      | Required    | Position in list  |
| `listId`      | String   | FK → List   | Parent list       |
| `labels`      | String[] | Optional    | Category tags     |
| `dueDate`     | DateTime | Optional    | Deadline          |

**Unique Constraint:** `[listId, order]` - Ensures unique ordering per list

#### Comment

Discussion threads on cards.

| Field       | Type     | Constraints | Description       |
| ----------- | -------- | ----------- | ----------------- |
| `id`        | String   | PK, CUID    | Unique identifier |
| `text`      | String   | Required    | Comment content   |
| `cardId`    | String   | FK → Card   | Associated card   |
| `authorId`  | String   | FK → User   | Comment author    |
| `createdAt` | DateTime | Auto        | Timestamp         |

---

## 🔌 API Documentation

### Base URLs

- **Frontend:** `http://localhost:3000`
- **Backend:** `http://localhost:5000`

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "clxxx...",
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Planned Endpoints

#### Boards

- `GET /api/boards` - Get all user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get single board with lists/cards
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

#### Lists

- `POST /api/boards/:id/lists` - Create list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list
- `PUT /api/lists/:id/reorder` - Reorder lists

#### Cards

- `POST /api/lists/:id/cards` - Create card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `PUT /api/cards/:id/move` - Move card between lists

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **PostgreSQL** database (Supabase account)
- **Pusher** account for real-time features

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd TaskFlow
```

#### 2. Frontend Setup

```bash
cd taskflow
npm install
```

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://postgres.ocrtdkvivmakzijzxove:Abcd%401234@db.ocrtdkvivmakzijzxove.supabase.co:5432/postgres"

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000

# Pusher (Client)
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
```

Generate Prisma Client:

```bash
npx prisma generate
npx prisma db push
```

#### 3. Backend Setup

```bash
cd ../TaskFlow-backend
npm install
```

Create `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres.ocrtdkvivmakzijzxove:Abcd%401234@db.ocrtdkvivmakzijzxove.supabase.co:5432/postgres"

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Server
PORT=5000

# Pusher (Server)
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster
```

Generate Prisma Client:

```bash
npx prisma generate
```

### Running the Application

#### Start Backend Server

```bash
cd TaskFlow-backend
npm run dev
```

Server runs on `http://localhost:5000`

#### Start Frontend

```bash
cd taskflow
npm run dev
```

Frontend runs on `http://localhost:3000`

### Database Management

#### View Database

```bash
npx prisma studio
```

#### Create Migration

```bash
npx prisma migrate dev --name migration_name
```

#### Reset Database

```bash
npx prisma migrate reset
```

---

## 🔐 Environment Variables

### Frontend (`.env.local`)

| Variable                     | Description                  | Example                               |
| ---------------------------- | ---------------------------- | ------------------------------------- |
| `DATABASE_URL`               | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXT_PUBLIC_API_URL`        | Backend API base URL         | `http://localhost:5000`               |
| `NEXT_PUBLIC_PUSHER_KEY`     | Pusher application key       | `abc123def456`                        |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster region        | `us2`                                 |

### Backend (`.env`)

| Variable         | Description                  | Example                               |
| ---------------- | ---------------------------- | ------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET`     | Secret key for JWT signing   | `your_secret_key_min_32_chars`        |
| `PORT`           | Server port                  | `5000`                                |
| `PUSHER_APP_ID`  | Pusher application ID        | `123456`                              |
| `PUSHER_KEY`     | Pusher application key       | `abc123def456`                        |
| `PUSHER_SECRET`  | Pusher secret key            | `secret123`                           |
| `PUSHER_CLUSTER` | Pusher cluster region        | `us2`                                 |

---

## 📚 Development Roadmap

### Phase 1: Core Functionality ✅ (Completed)

- [x] Project setup and configuration
- [x] Database schema design
- [x] Authentication system (JWT)
- [x] Real-time infrastructure (Pusher)
- [x] Landing page and UI foundation

### Phase 2: Board Management 🔄 (In Progress)

- [ ] Boards CRUD API endpoints
- [ ] User dashboard with board list
- [ ] Create/edit/delete boards UI
- [ ] Board customization (colors, icons)

### Phase 3: Kanban Features 📋 (Planned)

- [ ] Lists CRUD API endpoints
- [ ] Cards CRUD API endpoints
- [ ] Kanban board view
- [ ] Drag-and-drop functionality
- [ ] Card details modal

### Phase 4: Collaboration 👥 (Planned)

- [ ] Team member invitations
- [ ] Role-based permissions
- [ ] Real-time activity feed
- [ ] Comment system

### Phase 5: Polish & Production 🚀 (Future)

- [ ] Advanced search and filters
- [ ] Card attachments
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Performance optimization
- [ ] Deployment to production

---

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
cd taskflow
npm test

# Backend tests
cd TaskFlow-backend
npm test
```

### Test Coverage

- Unit tests for controllers
- Integration tests for API endpoints
- E2E tests for critical user flows

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

- **Your Name** - _Initial work_ - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Inspired by [Trello](https://trello.com) and [Notion](https://notion.so)
- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- Real-time sync via [Pusher](https://pusher.com/)

---

## 📞 Support

For support, email support@taskflow.com or join our Slack channel.

---

<div align="center">

**[⬆ Back to Top](#taskflow---collaborative-task-management-platform)**

Made with ❤️ by the TaskFlow Team

</div>
