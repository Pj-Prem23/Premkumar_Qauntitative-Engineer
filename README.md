# StreamVision AI Insights

A full-stack analytics dashboard with an AI chat assistant for streaming platform data.  
**Stack:** React + Vite (frontend) · FastAPI + Python (backend) · Docker Compose

---

## Quick Start (local dev)

### Prerequisites
- Node.js 20+
- Python 3.12+
- Docker & Docker Compose (optional, for containerised run)

---

### 1 — Clone and configure

```bash
git clone https://github.com/YOUR_USERNAME/streamvision-insights.git
cd streamvision-insights

cp .env.example .env
# Edit .env if you want a custom API_KEY
```

---

### 2 — Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API is now live at http://localhost:8000  
Swagger docs: http://localhost:8000/docs

---

### 3 — Run the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

App is now live at http://localhost:3000

---

### 4 — Run with Docker Compose (production-like)

```bash
# From the project root
docker compose up --build
```

- Frontend → http://localhost:3000  
- Backend  → http://localhost:8000

---

## Project Structure

```
streamvision-insights/
├── backend/
│   ├── main.py              # FastAPI app — all endpoints
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/client.js    # Axios API layer
│   │   ├── components/
│   │   │   ├── Chat.jsx     # AI assistant UI
│   │   │   └── Dashboard.jsx# Analytics charts
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── nginx.conf           # Used by Docker build
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `API_KEY` | `dev-secret-key-change-in-production` | Backend auth key |
| `VITE_API_KEY` | same as above | Frontend sends this in `X-API-Key` header |
| `VITE_API_URL` | `""` (empty = same host) | Override backend URL for production |

---

## Extending the Backend

`backend/main.py` contains stub responses. Replace the `chat()` endpoint with real logic:

```python
# Example: call an LLM
import anthropic
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
response = client.messages.create(model="claude-opus-4-20250514", ...)
```

---

## License

MIT
