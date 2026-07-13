"""
Data loading and preparation utilities for the Brent oil price
change point analysis project.
"""

import pandas as pd
import numpy as np


def load_price_data(filepath: str) -> pd.DataFrame:
    """
    Load the raw Brent oil price CSV and parse dates.

    Parameters
    ----------
    filepath : str
        Path to BrentOilPrices.csv (columns: Date, Price).
        Dates are formatted like '20-May-87'.

    Returns
    -------
    pd.DataFrame
        Indexed by Date (datetime), sorted ascending, with a single
        'Price' column.
    """
    df = pd.read_csv(filepath)
    df["Date"] = pd.to_datetime(df["Date"], format="%d-%b-%y")
    df = df.sort_values("Date").reset_index(drop=True)
    df = df.set_index("Date")
    return df


def add_log_returns(df: pd.DataFrame, price_col: str = "Price") -> pd.DataFrame:
    """
    Add a log-return column: log(price_t) - log(price_{t-1}).

    Log returns are used instead of raw prices because they tend to be
    stationary (stable mean/variance), which is a requirement for the
    change point model in Task 2.

    Parameters
    ----------
    df : pd.DataFrame
        Must contain `price_col`.
    price_col : str
        Name of the price column.

    Returns
    -------
    pd.DataFrame
        Copy of df with a new 'log_return' column (first row will be NaN).
    """
    out = df.copy()
    out["log_return"] = np.log(out[price_col]) - np.log(out[price_col].shift(1))
    return out


def load_events(filepath: str) -> pd.DataFrame:
    """
    Load the researched major events CSV.

    Parameters
    ----------
    filepath : str
        Path to majorEvents.csv (columns: Date, Event, Category,
        Impact on Oil Market).

    Returns
    -------
    pd.DataFrame
        Indexed by Date (datetime), sorted ascending.
    """
    df = pd.read_csv(filepath)
    df["Date"] = pd.to_datetime(df["Date"], format="%Y-%m-%d")
    df = df.sort_values("Date").reset_index(drop=True)
    return df