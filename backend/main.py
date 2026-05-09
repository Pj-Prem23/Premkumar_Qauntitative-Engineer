from fastapi import FastAPI, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader
from pydantic import BaseModel
from typing import Optional
import os
import time

app = FastAPI(title="StreamVision AI Insights", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("API_KEY", "dev-secret-key-change-in-production")
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def verify_key(key: str = Security(api_key_header)):
    if key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return key


# ── Pydantic models ───────────────────────────────────────────────────────────

class ChatPayload(BaseModel):
    message: str
    history: list = []
    filters: dict = {}


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


# ── Chat ──────────────────────────────────────────────────────────────────────

@app.post("/api/chat")
async def chat(payload: ChatPayload, _: str = Security(verify_key)):
    """
    Entry point for the AI assistant.
    Replace the stub below with your real LLM / RAG / tool-use logic.
    The response shape must match what Chat.jsx expects:
      { answer, sources_used, tool_calls }
    """
    message = payload.message.lower()
    filters = payload.filters

    # ── Stub responses (replace with real LLM calls) ──────────────────────────
    if "stellar run" in message:
        answer = (
            "## Stellar Run — Performance Analysis\n\n"
            "**Stellar Run** is currently the top-performing title with a score of **92/100**.\n\n"
            "Key drivers:\n"
            "- Strong Sci-Fi audience (fastest-growing genre in 2025)\n"
            "- High retention in the 18-34 demographic\n"
            "- Viral social media clips boosted discovery by ~34% in the last 30 days\n\n"
            "> Recommendation: Invest in a Season 2 greenlight — churn risk is low at 8%."
        )
        sources = ["Source A: titles_performance_2025.csv", "Source B: marketing_report_Q1.pdf"]
        tool_calls = [
            {"tool_name": "query_sql", "input": {"table": "titles", "filter": "name='Stellar Run'"}, "duration_ms": 42},
            {"tool_name": "read_pdf", "input": {"file": "marketing_report_Q1.pdf", "pages": "12-15"}, "duration_ms": 187},
        ]
    elif "comedy" in message:
        answer = (
            "## Comedy Genre — Weak Performance Analysis\n\n"
            "Comedy is underperforming across all regions with an average score of **55/100**.\n\n"
            "Root causes identified:\n"
            "1. Content fatigue — similar premise comedies released in Q4 2024\n"
            "2. Algorithm de-prioritisation on the recommendation engine\n"
            "3. Marketing spend is 40% lower than Drama at equivalent release stage\n\n"
            "**Suggested actions:** Refresh the content brief and reallocate $50k marketing budget."
        )
        sources = ["Source A: genre_trends.csv", "Source C: internal_strategy_deck.pdf"]
        tool_calls = [
            {"tool_name": "query_sql", "input": {"table": "genre_metrics", "filter": "genre='Comedy'"}, "duration_ms": 38},
        ]
    elif "dark orbit" in message and "last kingdom" in message:
        answer = (
            "## Dark Orbit vs Last Kingdom\n\n"
            "| Metric | Dark Orbit | Last Kingdom |\n"
            "|--------|-----------|---------------|\n"
            "| Score | 88 | 84 |\n"
            "| Genre | Action | Drama |\n"
            "| Retention (30d) | 72% | 81% |\n"
            "| Avg. Watch Time | 38 min | 52 min |\n"
            "| Churn Risk | 14% | 9% |\n\n"
            "**Last Kingdom** has better retention and lower churn despite a lower headline score. "
            "It is the safer long-term investment for sequel commissioning."
        )
        sources = ["Source A: titles_performance_2025.csv"]
        tool_calls = [
            {"tool_name": "query_sql", "input": {"table": "titles", "filter": "name IN ('Dark Orbit','Last Kingdom')"}, "duration_ms": 55},
        ]
    elif any(w in message for w in ["city", "region", "engagement"]):
        answer = (
            "## Regional Engagement — Last 30 Days\n\n"
            "**Mumbai** leads with an engagement score of **88**, followed by Delhi (82) and Bangalore (79).\n\n"
            "Hyderabad shows the fastest month-over-month growth (+6 points), suggesting an untapped audience. "
            "Consider localised marketing campaigns in Telugu and Kannada."
        )
        sources = ["Source A: regional_data.csv", "Source B: user_sessions_apr2025.csv"]
        tool_calls = [
            {"tool_name": "query_sql", "input": {"table": "regional_engagement", "filter": "period='last_30d'"}, "duration_ms": 61},
        ]
    elif any(w in message for w in ["leadership", "recommend", "strategy"]):
        answer = (
            "## Strategic Recommendations for Leadership\n\n"
            "Based on Q1 2025 data:\n\n"
            "1. **Double down on Sci-Fi** — highest ROI genre; greenlight 2 more originals\n"
            "2. **Fix Comedy pipeline** — content brief needs refresh; reduce releases by 30%\n"
            "3. **Invest in Hyderabad & Bangalore** — fastest-growing regional markets\n"
            "4. **Shift 15% of Display ad budget to Search** — 3.8× better ROI\n"
            "5. **Commission Stellar Run S2** — lowest churn risk in catalogue"
        )
        sources = ["Source A: titles_performance_2025.csv", "Source B: marketing_report_Q1.pdf", "Source C: internal_strategy_deck.pdf"]
        tool_calls = [
            {"tool_name": "read_pdf", "input": {"file": "internal_strategy_deck.pdf"}, "duration_ms": 210},
            {"tool_name": "query_sql", "input": {"table": "titles", "filter": "year=2025"}, "duration_ms": 44},
        ]
    else:
        genre_filter = filters.get("genre", "")
        year_filter = filters.get("year", "2025")
        filter_note = f" (filtered by genre={genre_filter}, year={year_filter})" if genre_filter else f" (year={year_filter})"
        answer = (
            f"## Analysis{filter_note}\n\n"
            f"I searched across SQL tables, CSV exports, and internal PDF reports for: **{payload.message}**\n\n"
            "The top 3 titles in 2025 are Stellar Run (92), Dark Orbit (88), and Last Kingdom (84). "
            "Sci-Fi is the strongest genre; Comedy is the weakest. Mumbai leads in regional engagement.\n\n"
            "Try a more specific question — for example: *'Why is Stellar Run trending?'* "
            "or *'Compare Dark Orbit vs Last Kingdom'*."
        )
        sources = ["Source A: titles_performance_2025.csv"]
        tool_calls = []

    return {
        "answer": answer,
        "sources_used": sources,
        "tool_calls": tool_calls,
    }


# ── Analytics endpoints ───────────────────────────────────────────────────────

@app.get("/api/analytics/top-titles")
async def top_titles(genre: Optional[str] = None, year: Optional[str] = None, _: str = Security(verify_key)):
    titles = [
        {"name": "Stellar Run", "score": 92, "genre": "Sci-Fi"},
        {"name": "Dark Orbit", "score": 88, "genre": "Action"},
        {"name": "Last Kingdom", "score": 84, "genre": "Drama"},
        {"name": "Neon Hearts", "score": 79, "genre": "Romance"},
        {"name": "Shadow Protocol", "score": 76, "genre": "Thriller"},
    ]
    if genre:
        titles = [t for t in titles if t["genre"].lower() == genre.lower()]
    return {"titles": titles, "total": len(titles)}


@app.get("/api/analytics/genre-trends")
async def genre_trends(_: str = Security(verify_key)):
    return {
        "trends": [
            {"month": "Jan", "Sci-Fi": 82, "Drama": 74, "Action": 68, "Comedy": 55},
            {"month": "Feb", "Sci-Fi": 85, "Drama": 71, "Action": 72, "Comedy": 52},
            {"month": "Mar", "Sci-Fi": 88, "Drama": 76, "Action": 75, "Comedy": 58},
            {"month": "Apr", "Sci-Fi": 91, "Drama": 78, "Action": 73, "Comedy": 54},
            {"month": "May", "Sci-Fi": 92, "Drama": 80, "Action": 77, "Comedy": 60},
        ]
    }


@app.get("/api/analytics/regional")
async def regional_performance(_: str = Security(verify_key)):
    return {
        "regions": [
            {"city": "Mumbai", "engagement": 88},
            {"city": "Delhi", "engagement": 82},
            {"city": "Bangalore", "engagement": 79},
            {"city": "Hyderabad", "engagement": 75},
            {"city": "Chennai", "engagement": 71},
        ]
    }


@app.get("/api/analytics/trending")
async def trending(days: int = 90, _: str = Security(verify_key)):
    return {
        "titles": [
            {"name": "Stellar Run", "trend_score": 9.4, "delta": "+2.1"},
            {"name": "Dark Orbit", "trend_score": 8.8, "delta": "+0.6"},
            {"name": "Neon Hearts", "trend_score": 7.2, "delta": "+1.8"},
        ],
        "period_days": days,
    }


@app.get("/api/analytics/marketing-roi")
async def marketing_roi(_: str = Security(verify_key)):
    return {
        "channels": [
            {"channel": "Social", "spend": 120, "revenue": 340},
            {"channel": "Email", "spend": 45, "revenue": 180},
            {"channel": "Search", "spend": 200, "revenue": 420},
            {"channel": "Display", "spend": 80, "revenue": 110},
        ]
    }


@app.get("/api/analytics/platform-stats")
async def platform_stats(_: str = Security(verify_key)):
    return {
        "total_titles": 148,
        "active_users_30d": 284_000,
        "avg_watch_time_min": 44,
        "top_genre": "Sci-Fi",
        "churn_rate_pct": 11.2,
    }
