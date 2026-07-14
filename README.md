# Change Point Analysis of Brent Oil Prices

## Overview

This project analyzes historical Brent crude oil prices to identify structural changes in the market using Bayesian Change Point Detection. The objective is to investigate whether significant geopolitical and economic events correspond to statistically detectable changes in oil price behavior.

The analysis is conducted as part of the **10 Academy KAIM Week 10 Challenge** for **Birhan Energies**. Rather than assuming that oil prices follow a single long-term trend, the project models the series as a sequence of regimes separated by structural breaks. Detected change points are then compared with a curated timeline of major global events to generate hypotheses about potential market drivers.

> **Note:** Event associations represent temporal correlations and should not be interpreted as causal relationships.

---

## Objectives

- Analyze over three decades of Brent crude oil prices (1987–2022)
- Explore long-term trends, stationarity, and volatility characteristics
- Transform the series into stationary log returns
- Detect structural breaks using Bayesian Change Point Modeling
- Associate detected change points with major geopolitical and economic events
- Produce interpretable insights for investors, policymakers, and energy stakeholders
- Build a foundation for an interactive dashboard (Flask API + React frontend)

---

## Project Workflow

The analysis follows the workflow below:

1. Load and preprocess Brent oil price data
2. Perform exploratory data analysis (EDA)
3. Test stationarity using the Augmented Dickey-Fuller (ADF) test
4. Transform prices into log returns
5. Compile a timeline of major geopolitical and economic events
6. Build a Bayesian Change Point model using PyMC
7. Run MCMC sampling and evaluate convergence
8. Identify the most probable structural break(s)
9. Compare detected change points with historical events
10. Generate business insights and visualizations

---

## Time Series Analysis

The exploratory analysis examines three key properties of the Brent oil price series:

### Trend

The raw price series exhibits strong long-term trends and multiple market regimes, making it unsuitable for direct stationary modeling.

### Stationarity

Stationarity was evaluated using the Augmented Dickey-Fuller (ADF) test.

| Series | ADF Statistic | p-value | Conclusion |
|---------|--------------:|---------|------------|
| Raw Price | -1.99 | 0.289 | Non-stationary |
| Log Returns | -16.43 | <0.0001 | Stationary |

The Bayesian model is therefore built using **log returns** instead of raw prices.

### Volatility

Rolling volatility analysis reveals clear volatility clustering, particularly during:

- 2008 Global Financial Crisis
- 2020 COVID-19 Oil Price Crash

This indicates changing variance through time, which is noted as a limitation of a mean-shift-only model.

---

## Bayesian Change Point Model

The project implements a Bayesian Change Point model using **PyMC**.

The model estimates:

- Posterior distribution of the change point (τ)
- Mean return before the change (μ₁)
- Mean return after the change (μ₂)

Inference is performed using MCMC sampling, and convergence is evaluated using:

- Trace plots
- R-hat statistics

---

## Assumptions

- Daily closing prices represent market behavior.
- Log returns approximate a stationary process.
- Major geopolitical events are compiled from publicly documented sources.
- The event list is not exhaustive.
- Mixed date formats in the original dataset are handled during preprocessing.

---

## Limitations

This analysis detects **statistical change points**, not causal effects.

A detected change point occurring near a geopolitical event indicates temporal association rather than proof of causality.

Potential limitations include:

- Confounding events
- Market anticipation
- Delayed policy effects
- Coincidental timing
- Single change point assumption

Future work may include:

- Multiple change point models
- Markov Switching Models
- Bayesian Online Change Point Detection
- Causal inference methods

---

## Interactive Dashboard (Task 3)

A Flask + React (react-admin) dashboard for exploring the price history,
major events, and (eventually) the change point model results.

**Features**

- Historical Brent price chart (1987–2022) with vertical lines marking major events
  (blue = 30-day avg price rose after the event, red = fell)
- "Event highlight": click near an event line or an event chip to highlight its
  ±90-day window and see the avg price 30 days before/after and the % change
- Key indicators: latest price, average price, annualized volatility
  (from daily log returns), event count — all recomputed for the selected range
- Date-range filtering (presets + custom from/to) scoping every chart and stat
- Major Events list/detail pages (react-admin resource)
- Model Results tab — placeholder until the Task 2 model results are exported

### Backend API (Flask, port 5000)

| Endpoint | Description |
|---|---|
| `GET /api/prices?start=&end=` | Daily price series, optional date range |
| `GET /api/events` | All major events + avg price 30d before/after and % change |
| `GET /api/events/<id>` | One event by id (404 if missing) |
| `GET /api/indicators?start=&end=` | Latest/avg/min/max price, annualized volatility, event count |
| `GET /api/change-points` | Task 2 model results — returns `{status: "pending"}` until exported |

### Running the dashboard

Backend (from the repo root, with the virtualenv active):

```bash
python backend/app.py          # http://localhost:5000
```

Frontend (requires Node.js):

```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

Screenshots of the dashboard are in [screenshots/](screenshots/).

---

## Repository Structure

```
change-point-analysis-brent-oil/
│
├── backend/
│   └── app.py                 # Flask API (Task 3)
│
├── frontend/                  # React dashboard (Vite + react-admin + Recharts)
│   └── src/
│       ├── App.jsx            # Admin shell + routes
│       ├── Dashboard.jsx      # Stat cards, price chart, event highlight
│       ├── ModelResults.jsx   # Placeholder tab for Task 2 outputs
│       ├── dataProvider.js    # Data layer — binds the UI to the Flask API
│       ├── theme.js
│       ├── components/        # PriceChart, StatCard, DateRangeFilter
│       └── resources/         # events list/show pages
│
├── data/
│   └── raw/                   # BrentOilPrices.csv, majorEvents.csv
│
├── notebooks/
│   ├── Task_1_EDA.ipynb
│   └── Task_2_Change_point_model.ipynb
│
├── screenshots/               # Dashboard screenshots (Task 3 deliverable)
│
├── scripts/
├── src/                       # data_prep, eda, change_point_model, event_matching
├── tests/
│
├── requirements.txt
├── .gitignore
└── README.md
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/MasteryProgram/change-point-analysis-brent-oil.git
cd change-point-analysis-brent-oil
```

Create a virtual environment:

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

### Linux/macOS

```bash
python -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Running the Project

Launch Jupyter Notebook:

```bash
jupyter notebook
```

or Jupyter Lab:

```bash
jupyter lab
```

Run the notebooks in order:

1. Data preprocessing
2. Exploratory Data Analysis
3. Bayesian Change Point Modeling

---

## Dataset

**Brent Crude Oil Historical Prices**

The dataset contains daily Brent crude oil prices from **May 20, 1987** to **September 30, 2022**.

The data was provided as part of the **10 Academy KAIM Week 10 Challenge**.

---

## Technologies Used

- Python
- Pandas
- NumPy
- Matplotlib
- Plotly
- Statsmodels
- PyMC
- ArviZ
- Jupyter Notebook

---

## Future Work

- Multiple Bayesian change point detection
- Time-varying volatility models
- Export Task 2 model results and surface them in the dashboard's Model Results tab
- Advanced causal analysis

---

## Author

Prepared for the **10 Academy KAIM Week 10 Challenge**  
**Birhan Energies — Change Point Analysis of Brent Oil Prices**