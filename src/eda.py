"""
Exploratory data analysis utilities: stationarity testing and
volatility measures for the Brent oil price series.
"""

import pandas as pd
from statsmodels.tsa.stattools import adfuller


def run_adf_test(series: pd.Series, label: str = "series") -> dict:
    """
    Run the Augmented Dickey-Fuller test for stationarity.

    Null hypothesis (H0): the series has a unit root (i.e. it is
    non-stationary). A small p-value (< 0.05) lets us reject H0 and
    conclude the series is stationary.

    Parameters
    ----------
    series : pd.Series
        The series to test (NaNs are dropped automatically).
    label : str
        A name for the series, used only in the printed summary.

    Returns
    -------
    dict
        ADF statistic, p-value, number of lags used, and critical values.
    """
    clean = series.dropna()
    result = adfuller(clean)

    output = {
        "label": label,
        "adf_statistic": result[0],
        "p_value": result[1],
        "n_lags_used": result[2],
        "n_obs": result[3],
        "critical_values": result[4],
        "is_stationary": result[1] < 0.05,
    }

    print(f"--- ADF Test: {label} ---")
    print(f"ADF Statistic : {output['adf_statistic']:.4f}")
    print(f"p-value       : {output['p_value']:.4f}")
    for key, val in output["critical_values"].items():
        print(f"Critical Value ({key}): {val:.4f}")
    conclusion = "STATIONARY" if output["is_stationary"] else "NON-STATIONARY"
    print(f"Conclusion    : {conclusion} (alpha = 0.05)\n")

    return output


def compute_rolling_stats(series: pd.Series, window: int = 30) -> pd.DataFrame:
    """
    Compute rolling mean and rolling standard deviation.

    Used to visually assess stationarity (a stationary series should
    have a roughly flat rolling mean and rolling std over time) and to
    inspect volatility clustering.

    Parameters
    ----------
    series : pd.Series
        Input series (e.g. price or log returns).
    window : int
        Rolling window size in days.

    Returns
    -------
    pd.DataFrame
        Columns: 'rolling_mean', 'rolling_std'.
    """
    return pd.DataFrame({
        "rolling_mean": series.rolling(window=window).mean(),
        "rolling_std": series.rolling(window=window).std(),
    })