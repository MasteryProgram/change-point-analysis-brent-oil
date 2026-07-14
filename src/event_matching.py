"""
Utilities for matching a detected change point date to researched
real-world events.
"""

import pandas as pd


def match_change_point_to_events(
    change_date: pd.Timestamp,
    events_df: pd.DataFrame,
    window_days: int = 90,
) -> pd.DataFrame:
    """
    Find the nearest event(s) to a detected change point, within a
    fixed time window.

    This is a correlation-in-time search only — it does NOT establish
    causation. See Task 1's discussion on correlation vs. causal impact.

    Parameters
    ----------
    change_date : pd.Timestamp
        The detected change point date (e.g. derived from tau's
        posterior median/mode).
    events_df : pd.DataFrame
        Must have a 'Date' column (datetime) and an 'Event' column.
    window_days : int
        Only events within +/- this many days of change_date are considered.

    Returns
    -------
    pd.DataFrame
        Matching events (if any), with an added 'days_from_change_point'
        column, sorted by absolute distance (closest first). Empty
        DataFrame if nothing falls within the window.
    """
    out = events_df.copy()
    out["days_from_change_point"] = (out["Date"] - change_date).dt.days

    within_window = out[out["days_from_change_point"].abs() <= window_days].copy()
    within_window = within_window.reindex(
        within_window["days_from_change_point"].abs().sort_values().index
    )

    return within_window.reset_index(drop=True)