import { useEffect, useState } from 'react';
import { Title } from 'react-admin';
import { Box, Card, CardContent, Typography, Alert } from '@mui/material';
import { fetchChangePoints } from './dataProvider';

/**
 * Model Results tab — intentionally a placeholder.
 *
 * The Task 2 Bayesian change point model has not exported its results
 * yet. When it does (the backend's /api/change-points starts returning
 * data instead of {status: "pending"}), this page will list the detected
 * change points; until then it explains what will appear here.
 */
export const ModelResults = () => {
  const [resp, setResp] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChangePoints().then(setResp).catch((e) => setError(e.message));
  }, []);

  return (
    <Box sx={{ mt: 2 }}>
      <Title title="Model Results" />
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Bayesian change point model (Task 2)
          </Typography>

          {error && <Alert severity="error">Could not reach the API ({error}).</Alert>}

          {resp && resp.status === 'pending' && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                {resp.message}
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Once the model results are exported, this tab will show the detected change point
                date (posterior of τ), the mean daily log return before and after the switch
                (μ₁, μ₂), and the nearest major events within a ±90-day window — connecting the
                statistical break to a real-world explanation.
              </Typography>
            </>
          )}

          {resp && resp.status !== 'pending' && (
            <pre style={{ overflow: 'auto' }}>{JSON.stringify(resp.data, null, 2)}</pre>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
