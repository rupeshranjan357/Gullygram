# 🚀 GullyGram Deployment Guide (GitFlow Strategy)

> Professional workflow: Deploys to **Staging** via `dev` branch, then to **Production** via `main` branch.

---

## Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **Render Account** - [render.com](https://render.com) (free tier supports Java 21)
3. **Vercel Account** - [vercel.com](https://vercel.com) (free tier)

---

## Step 1: Git Setup (Branching)

We need two branches: `main` (Production) and `dev` (Staging).

```bash
# Initialize and commit
git init
git add .
git commit -m "Initial setup"

# Create/Switch to dev branch
git checkout -b dev

# Push both branches
git remote add origin https://github.com/YOUR_USERNAME/gullygram.git
git push -u origin dev
git push origin main:main
```

---

## Step 2: Set up STAGING Environment

### Backend (Render)
1. Create New Web Service -> "Blueprint" or Manual.
2. Name: `gullygram-api-staging`
3. Branch: `dev` (Important!)
4. Env Vars:
   - `JWT_SECRET`: (Random string)
   - `FRONTEND_URL`: `https://gullygram-staging.vercel.app`

### Frontend (Vercel)
1. Import Project.
2. Project Name: `gullygram-staging`
3. Branch: `dev`
4. Env Var: `VITE_API_URL` = `https://gullygram-api-staging.onrender.com/api`

---

## Step 3: Set up PRODUCTION Environment

### Backend (Render)
1. Create **Second** Web Service.
2. Name: `gullygram-api-prod`
3. Branch: `main`
4. Env Vars:
   - `JWT_SECRET`: (Unique random string)
   - `FRONTEND_URL`: `https://gullygram.vercel.app`

### Frontend (Vercel)
1. Import Project (**Second** project).
2. Project Name: `gullygram-prod`
3. Branch: `main`
4. Env Var: `VITE_API_URL` = `https://gullygram-api-prod.onrender.com/api`

---

## Step 4: Configure CI/CD Secrets

Go to GitHub Repo -> Settings -> Secrets -> Actions. Add:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `RENDER_DEPLOY_HOOK_STAGING` | (From Render `staging` service) | Triggers Staging deploy |
| `RENDER_DEPLOY_HOOK_PROD` | (From Render `prod` service) | Triggers Prod deploy |
| `VITE_API_URL` | (Leave empty if handling via Vercel env vars) | Optional for build time |

---

## 🔄 The Workflow

### 1. Develop & Deploy to Staging
- Make changes locally.
- Push to `dev` branch:
  ```bash
  git checkout dev
  git add .
  git commit -m "New features"
  git push origin dev
  ```
- **Action**: GitHub Actions deploys to **Staging** environment.
- **Verify**: Test on your staging URL.

### 2. Promote to Production
- When Staging is verified, create a Pull Request (PR) from `dev` to `main`.
- Approve and Merge the PR.
- **Action**: GitHub Actions deploys to **Production** environment.

```bash
# Or manual merge
git checkout main
git merge dev
git push origin main
```
