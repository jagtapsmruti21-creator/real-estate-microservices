# RealEstate Frontend (React + Vite)

## Backend compatibility (NO Kafka)
This frontend is configured to call the **Core Service (Spring Boot)** directly.

- Core Service: `http://localhost:8080`
- Payment Service (called internally by core): `http://localhost:8081`

API base URL is controlled by `.env`:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## How to run (final)
### 1) Start backend
- Start **payment-service** on `8081`
- Start **core-service** on `8080`

### 2) Start frontend
```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

> If you get CORS issues, make sure you are running the **no-kafka** backend zips I provided (they already enable CORS).

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
