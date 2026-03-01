# Automater: Node-Based Workflow Automation Tool

Automater is a powerful, visual, node-based workflow automation tool. It features a modern React frontend and a robust Django REST backend, designed for easy deployment and scalability.

## 📁 Project Structure

This is a **Monorepo** containing both the frontend and backend:

- `frontend/`: React + Vite application (Workflow Builder UI).
- `backend/`: Django REST Framework (API, Workflow Engine, and Database).
- `Dockerfile`: Unified Docker configuration for production.
- `docker-compose.yml`: For local containerized development.
- `render.yaml`: Configuration for one-click deployment on Render.

---

## 💻 Requirements

To run this project locally, ensure you have the following installed:

- **Node.js**: v18 or higher
- **Python**: v3.12 or higher
- **Git**: For version control
- **Docker & Docker Compose** (Optional, but recommended for production-like environments)

---

## 🚀 Local Development (Manual Setup)

Follow these steps to run both parts of the application as separate services.

### 1. Backend Setup (Django)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
The backend will be available at `http://localhost:8000`.

### 2. Frontend Setup (React)
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

---

## 🐳 Running with Docker

You can run the entire system with a single command using Docker. This is the closest environment to the production deployment.

```bash
docker-compose up --build
```
- **App URL**: `http://localhost:8080` (Both frontend and backend on one port)

---

## 🌍 Deployment on Render

This project is optimized for **Render Blueprint** deployment.

1.  Push this code to your GitHub repository.
2.  Go to your [Render Dashboard](https://dashboard.render.com).
3.  Click **"New +"** and select **"Blueprint"**.
4.  Connect your GitHub repository.
5.  Render will detect the `render.yaml` and prompt you to create the `automation-tool-all-in-one` service.
6.  Click **"Apply"**.

---

## 🛠️ Key Commands Summary

| Task | Command |
| :--- | :--- |
| **Backend Migration** | `python manage.py migrate` |
| **Backend Start** | `python manage.py runserver` |
| **Frontend Install** | `npm install` |
| **Frontend Start** | `npm run dev` |
| **Full Build (Docker)**| `docker-compose up --build` |

---

## 📝 License
This project is for demonstration and development purposes.
