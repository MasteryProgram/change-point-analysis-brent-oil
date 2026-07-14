"""
Bayesian change point model for Brent oil log returns.

Model structure:
    tau  ~ DiscreteUniform(0, n_days - 1)   # unknown switch point
    mu1  ~ Normal(0, wide_sigma)            # mean log return before tau
    mu2  ~ Normal(0, wide_sigma)            # mean log return after tau
    sigma ~ HalfNormal(wide_sigma)          # shared std dev (both regimes)
    mu = switch(t < tau, mu1, mu2)
    obs ~ Normal(mu, sigma), observed = log_returns
"""

import numpy as np
import pymc as pm


def build_change_point_model(log_returns: np.ndarray) -> pm.Model:
    """
    Build (but do not sample) the Bayesian change point model.

    Parameters
    ----------
    log_returns : np.ndarray
        1D array of log returns (NaNs already dropped), in chronological order.

    Returns
    -------
    pm.Model
        The constructed PyMC model, ready for pm.sample().
    """
    n_days = len(log_returns)
    idx = np.arange(n_days)

    # Weakly informative scale for priors, based on the overall spread
    # of the data itself (not tightly committing to any specific value).
    data_std = np.std(log_returns)

    with pm.Model() as model:
        # 1. THE SWITCH POINT (tau)
        # Discrete uniform: every day is equally plausible a priori.
        tau = pm.DiscreteUniform("tau", lower=0, upper=n_days - 1)

        # 2. THE REGIME MEANS (mu1, mu2)
        # Centered at 0 (log returns hover near zero), wide enough to
        # let the data dominate.
        mu1 = pm.Normal("mu1", mu=0, sigma=data_std * 5)
        mu2 = pm.Normal("mu2", mu=0, sigma=data_std * 5)

        # 3. SHARED VOLATILITY (sigma)
        # One sigma for the whole series (per the core task spec).
        sigma = pm.HalfNormal("sigma", sigma=data_std * 5)

        # 4. THE SWITCH LOGIC
        mu = pm.math.switch(tau > idx, mu1, mu2)

        # 5. THE LIKELIHOOD
        obs = pm.Normal("obs", mu=mu, sigma=sigma, observed=log_returns)

    return model


def sample_model(model: pm.Model, draws: int = 2000, tune: int = 1000, chains: int = 4):
    """
    Run MCMC sampling on the change point model.

    Parameters
    ----------
    model : pm.Model
        Output of build_change_point_model().
    draws : int
        Number of samples to keep per chain.
    tune : int
        Number of tuning (warm-up) iterations per chain, discarded after.
    chains : int
        Number of independent chains to run.

    Returns
    -------
    arviz.InferenceData
        The trace, ready for az.summary(), az.plot_trace(), etc.
    """
    with model:
        trace = pm.sample(
            draws=draws,
            tune=tune,
            chains=chains,
            return_inferencedata=True,
            target_accept=0.9,
        )
    return trace