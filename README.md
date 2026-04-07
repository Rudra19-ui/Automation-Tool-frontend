# Automater - Node-Based Workflow Automation Tool

Automater is a powerful, web-based workflow builder that allows users to create automation pipelines using a drag-and-drop node editor. Built with **React** on the frontend and **Django (Python)** on the backend, it enables seamless data flow between various automation steps.

## � Key Features

- **Drag-and-Drop Editor**: Intuitive canvas built with `reactflow`.
- **Diverse Node Types**:
  - ⚡ **Trigger Node**: Start your workflow with custom initial data.
  - 🌐 **HTTP Request**: Call external APIs (GET, POST, etc.).
  - ⚖️ **Condition Node**: Branching logic based on data fields.
  - 📧 **Email Node**: Bulk email sending (up to 500) with Excel support and personalization.
  - ✨ **AI Node**: Intelligent data processing using GPT models.
  - 📜 **Logger Node**: Detailed execution tracking.
- **Bulk Email Automation**:
  - Support for manual recipients (up to 5) or Excel upload (`.xlsx`).
  - Dynamic content using `{{name}}` placeholders.
  - Smart batching (20 emails/batch) to prevent SMTP throttling.
- **Real-Time Monitoring**: Interactive execution timeline with detailed logs, error hints, and resizable panels.

---

## �️ Prerequisites

Before running the project, ensure you have the following installed:
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **Gmail Account** (for Email Automation)

---

## ⚙️ Setup & Installation

### 1. Backend Setup (Django)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the `backend/` folder:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   OPENAI_API_KEY=your-api-key (optional)
   ```
   > **Note**: For Gmail, you must use an **App Password** if 2-Step Verification is enabled.
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the backend server:
   ```bash
   python manage.py runserver
   ```

### 2. Frontend Setup (React)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🧪 How to Use

1. Open your browser to `http://localhost:5173`.
2. **Build**: Drag nodes from the sidebar onto the canvas.
3. **Connect**: Link the output of one node to the input of another.
4. **Configure**: Click a node to open the "Node Settings" panel on the right.
5. **Run**: Click the **Run Workflow** button at the top right.
6. **Debug**: Use the **Execution Timeline** at the bottom to see progress and fix any errors using the provided hints.

---

## � Requirements Summary

### Backend (`backend/requirements.txt`)
- `django`: Web framework.
- `djangorestframework`: API toolkit.
- `python-dotenv`: Environment variable management.
- `openpyxl`: Excel file parsing for bulk emails.
- `nodemailer`: SMTP email delivery.

### Frontend (`frontend/package.json`)
- `reactflow`: Workflow canvas engine.
- `axios`: API communication.
- `tailwindcss`: Modern styling.
- `vite`: Fast development environment.
