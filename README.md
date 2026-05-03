# 🧠 Mente Activa — Monorepo

Plataforma de bienestar estudiantil con gestión de tareas, hábitos y diario emocional.

## Estructura
```
mente-activa/
├── backend/   → API REST (Node.js + Express + MongoDB + Socket.io)
└── frontend/  → SPA (React 18 + Tailwind CSS)
```

## Levantar el proyecto

### Backend
```bash
cd backend
cp .env.example .env   # Editar con tus credenciales
npm install
npm run dev            # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## Stack tecnológico
| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, Tailwind CSS, Axios, Socket.io-client |
| Backend | Node.js 20, Express 4, Mongoose 8 |
| Base de datos | MongoDB Atlas |
| Auth | JWT + bcryptjs |
| Tiempo real | Socket.io 4 |
| Calidad | ESLint + Prettier |

## Endpoints disponibles

### Auth
| Método | Ruta | Auth |
|--------|------|------|
| POST | `/api/auth/registro` | ❌ |
| POST | `/api/auth/login` | ❌ |
| GET  | `/api/auth/perfil` | ✅ |

### Tareas
| Método | Ruta | Auth |
|--------|------|------|
| GET    | `/api/tareas` | ✅ |
| GET    | `/api/tareas/:id` | ✅ |
| POST   | `/api/tareas` | ✅ |
| PUT    | `/api/tareas/:id` | ✅ |
| PATCH  | `/api/tareas/:id/completar` | ✅ |
| DELETE | `/api/tareas/:id` | ✅ |

## Integrantes
- Nicolás Luna Llanos
- Nicolás Andrés Reyes Suárez

**Corporación Universitaria Iberoamericana — Ingeniería de Software 2026**
