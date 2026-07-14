"""
Flask backend for the Brent oil price dashboard (Task 3).

Serves the historical price series, the researched major events, and
computed indicators (volatility, price changes around events) as JSON
for the React frontend.

Run:
    python backend/app.py        (from the repo root)

API endpoints
-------------
GET /                        -> HTML index listing the endpoints
GET /api/prices              -> full daily price series
                                query params: ?start=YYYY-MM-DD&end=YYYY-MM-DD
GET /api/events              -> all major events (with per-event price impact)
GET /api/events/<id>         -> one event by id
GET /api/indicators          -> summary stats: latest price, avg, volatility,
                                event counts (respects ?start/?end)
GET /api/change-points       -> model (Task 2) results. Placeholder until the
                                change point model outputs are exported.
"""

import sys
from pathlib import Path

import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

# Make `src/` importable when running from the repo root or backend/
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from src.data_prep import load_price_data, add_log_returns, load_events

app = Flask(__name__)
CORS(app)  # allow the Vite dev server (port 5173) to call this API

# ---------------------------------------------------------------------------
# Load data once at startup (the CSVs are small and static)
# ---------------------------------------------------------------------------
PRICES = add_log_returns(load_price_data(REPO_ROOT / "data" / "raw" / "BrentOilPrices.csv"))
EVENTS = load_events(REPO_ROOT / "data" / "raw" / "majorEvents.csv")


def _filter_by_range(df: pd.DataFrame) -> pd.DataFrame:
    """Apply optional ?start / ?end query params to a Date-indexed frame."""
    start = request.args.get("start")
    end = request.args.get("end")
    if start:
        df = df[df.index >= pd.to_datetime(start)]
    if end:
        df = df[df.index <= pd.to_datetime(end)]
    return df


def _price_around(date: pd.Timestamp, window_days: int = 30):
    """Avg price in the windows before/after a date, plus the % change."""
    before = PRICES.loc[date - pd.Timedelta(days=window_days): date, "Price"]
    after = PRICES.loc[date: date + pd.Timedelta(days=window_days), "Price"]
    if before.empty or after.empty:
        return None, None, None
    b, a = round(float(before.mean()), 2), round(float(after.mean()), 2)
    return b, a, round((a - b) / b * 100, 2)


def _event_record(i: int, row: pd.Series) -> dict:
    before, after, pct = _price_around(row["Date"])
    return {
        "id": i,
        "date": row["Date"].strftime("%Y-%m-%d"),
        "event": row["Event"],
        "category": row["Category"],
        "description": row["Impact on Oil Market"],
        "avg_price_30d_before": before,
        "avg_price_30d_after": after,
        "pct_change": pct,  # null when the event is outside the price data range
    }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/")
def index():
    return (
        "<h1>Brent Oil Price Dashboard API</h1>"
        "<ul>"
        "<li><a href='/api/prices'>/api/prices</a> (?start=&end=)</li>"
        "<li><a href='/api/events'>/api/events</a></li>"
        "<li><a href='/api/indicators'>/api/indicators</a> (?start=&end=)</li>"
        "<li><a href='/api/change-points'>/api/change-points</a></li>"
        "</ul>"
    )


@app.route("/api/prices")
def get_prices():
    df = _filter_by_range(PRICES)
    data = [
        {"date": d.strftime("%Y-%m-%d"), "price": round(float(p), 2)}
        for d, p in df["Price"].items()
    ]
    return jsonify({"status": "success", "count": len(data), "data": data})


@app.route("/api/events")
def get_events():
    data = [_event_record(i, row) for i, row in EVENTS.iterrows()]
    return jsonify({"status": "success", "count": len(data), "data": data})


@app.route("/api/events/<int:event_id>")
def get_event_by_id(event_id):
    if 0 <= event_id < len(EVENTS):
        return jsonify({"status": "found", "data": _event_record(event_id, EVENTS.iloc[event_id])})
    return jsonify({"status": "error", "message": "Event not found"}), 404


@app.route("/api/indicators")
def get_indicators():
    df = _filter_by_range(PRICES)
    if df.empty:
        return jsonify({"status": "error", "message": "No data in range"}), 400

    returns = df["log_return"].dropna()
    # Annualized volatility from daily log returns (~252 trading days/year)
    volatility = float(returns.std() * np.sqrt(252) * 100)

    in_range = EVENTS[
        (EVENTS["Date"] >= df.index.min()) & (EVENTS["Date"] <= df.index.max())
    ]
    return jsonify({
        "status": "success",
        "data": {
            "start_date": df.index.min().strftime("%Y-%m-%d"),
            "end_date": df.index.max().strftime("%Y-%m-%d"),
            "latest_price": round(float(df["Price"].iloc[-1]), 2),
            "average_price": round(float(df["Price"].mean()), 2),
            "min_price": round(float(df["Price"].min()), 2),
            "max_price": round(float(df["Price"].max()), 2),
            "annualized_volatility_pct": round(volatility, 2),
            "num_events_in_range": int(len(in_range)),
        },
    })


@app.route("/api/change-points")
def get_change_points():
    # Task 2's Bayesian model results are not exported yet. Once the
    # notebook saves its posterior summary (e.g. data/processed/
    # change_points.json), load and return it here.
    return jsonify({
        "status": "pending",
        "message": "Change point model results not available yet. "
                   "Run the Task 2 notebook and export its results.",
        "data": [],
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
