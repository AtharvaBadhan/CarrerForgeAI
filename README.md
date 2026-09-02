# CareerForge AI

CareerForge AI is a full-stack job application assistant that helps candidates organize their search and improve application materials. It combines an SSR React application with Supabase authentication and storage, plus server-side OpenAI-powered analysis and content generation.

## Features

- Secure email/password authentication
- Career dashboard with application activity and totals
- Job description analysis
- Resume storage, selection, and tailoring
- Resume-to-job match scoring and keyword analysis
- AI-assisted cover letter generation
- Application tracking by status and category
- Career analytics and progress visualizations
- Responsive, dark-themed interface

## Technology stack

- **Frontend:** React 19, TypeScript, TanStack Router, TanStack Start
- **Styling:** Tailwind CSS 4, Radix UI, Framer Motion
- **Data fetching:** TanStack Query
- **Backend:** TanStack Start server functions
- **Database and authentication:** Supabase
- **AI:** OpenAI Chat Completions API
- **Build tooling:** Vite 7
- **Deployment target:** Cloudflare Workers

## Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) 22.12 or newer
- npm 10 or newer
- A [Supabase](https://supabase.com/) project
- An [OpenAI API](https://platform.openai.com/) key for AI-powered features

## Run locally

### 1. Open the project directory

```powershell
cd "C:\path\to\CarrerForge.AI"
```

### 2. Install dependencies

On Windows PowerShell:

```powershell
npm.cmd install
```

On macOS, Linux, or a shell where npm scripts are enabled:

```bash
npm install
```

### 3. Create the environment file

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Open `.env` and provide your own credentials:

```dotenv
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key

VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key

OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-5-mini
```

You can find the Supabase URL and publishable key in the project's **Connect** dialog or under **Settings → API Keys**. The `VITE_` values are used by the browser client; the unprefixed values are used by server-side code.

`OPENAI_API_KEY` is read only by server-side code. `OPENAI_MODEL` is optional and defaults to `gpt-5-mini`.

> Never add secret or service-role keys to a `VITE_` variable. Variables prefixed with `VITE_` are included in the browser bundle.

### 4. Prepare Supabase

The database migrations are stored in [`supabase/migrations`](supabase/migrations). If you are connecting a new Supabase project, apply the SQL migration files in timestamp order before using authenticated application features.

If you are using the Supabase project already configured for this application, no additional database setup is required.

### 5. Start the development server

On Windows PowerShell:

```powershell
npm.cmd run dev
```

On macOS or Linux:

```bash
npm run dev
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080) in your browser.

### Run on your local network

To make the development server available to other devices on the same network:

```powershell
npm.cmd run dev -- --host 0.0.0.0
```

Then open `http://<your-computer-ip>:8080` from the other device. Windows Firewall may ask you to permit local network access.

## Production build

Create an optimized production build:

```powershell
npm.cmd run build
```

Preview the production build locally:

```powershell
npm.cmd run preview
```

Build output is written to `dist/`.

## Available scripts

| Command             | Purpose                              |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the local development server   |
| `npm run build`     | Create the production build          |
| `npm run build:dev` | Create a development-mode build      |
| `npm run preview`   | Preview the production build locally |
| `npm run lint`      | Run ESLint and Prettier checks       |
| `npm run format`    | Format the repository with Prettier  |

On Windows systems where PowerShell blocks `npm.ps1`, replace `npm` with `npm.cmd`.

## Project structure

```text
.
├── src/
│   ├── components/          Reusable application and UI components
│   ├── integrations/        Supabase clients and authentication middleware
│   ├── lib/                 AI, authentication, errors, and shared utilities
│   ├── routes/              TanStack file-based routes
│   ├── router.tsx           Application router configuration
│   └── server.ts            Server entry and SSR error handling
├── supabase/
│   ├── migrations/          Database migrations
│   └── config.toml          Supabase project configuration
├── .env.example             Environment variable template
├── vite.config.ts           Vite and TanStack Start configuration
└── wrangler.jsonc           Cloudflare Workers configuration
```

## Troubleshooting

### The `npm` command is blocked in PowerShell

Use the executable directly:

```powershell
npm.cmd install
npm.cmd run dev
```

### Vite reports an unsupported Node.js version

Check the active version:

```powershell
node --version
```

Upgrade or switch to Node.js 22.12 or newer, then reinstall dependencies.

### Supabase configuration is missing

Confirm that both the browser-facing `VITE_SUPABASE_*` values and server-side `SUPABASE_*` values are present in `.env`. Restart the development server after changing environment variables.

### AI features report a missing API key

Set `OPENAI_API_KEY` in `.env`, confirm that the API project has access and billing configured, and restart the server. Do not expose this key through a `VITE_` variable.

## Security

- `.env` is ignored by Git and must never be committed.
- OpenAI keys remain server-side.
- Only Supabase publishable keys belong in browser-facing variables.
- Supabase Row Level Security policies protect user-owned data.
- Review environment configuration and dependency audits before production deployment.

## License

No license has been specified for this repository. Add a `LICENSE` file before distributing the project publicly.
