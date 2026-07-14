import { useEffect, useState } from 'react';
import { Title } from 'react-admin';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { fetchPrices, fetchIndicators, fetchEvents } from './dataProvider';
import { PriceChart } from './components/PriceChart';
import { StatCard } from './components/StatCard';
import { DateRangeFilter } from './components/DateRangeFilter';
import { chart } from './theme';

const pctText = (v) =>
  v == null ? 'outside price data' : `${v > 0 ? '+' : ''}${v}% (30d avg before → after)`;

export const Dashboard = () => {
  const [range, setRange] = useState({ start: '', end: '' });
  const [prices, setPrices] = useState([]);
  const [indicators, setIndicators] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Events load once; prices + indicators re-fetch when the range changes.
  useEffect(() => {
    fetchEvents()
      .then((json) => setEvents(json.data))
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPrices(range.start, range.end), fetchIndicators(range.start, range.end)])
      .then(([p, i]) => {
        setPrices(p.data);
        setIndicators(i.data);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [range]);

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Could not reach the API ({error}). Is the Flask backend running on port 5000?
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Title title="Brent Oil Price Dashboard" />

      <DateRangeFilter range={range} onChange={setRange} />

      {/* KPI row */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, opacity: loading ? 0.5 : 1 }}>
        <StatCard
          label="Latest price"
          value={indicators ? `$${indicators.latest_price}` : '—'}
          secondary={indicators ? `as of ${indicators.end_date}` : ''}
        />
        <StatCard
          label="Average price"
          value={indicators ? `$${indicators.average_price}` : '—'}
          secondary={indicators ? `range $${indicators.min_price} – $${indicators.max_price}` : ''}
        />
        <StatCard
          label="Annualized volatility"
          value={indicators ? `${indicators.annualized_volatility_pct}%` : '—'}
          secondary="from daily log returns"
        />
        <StatCard
          label="Major events in range"
          value={indicators ? indicators.num_events_in_range : '—'}
          secondary="vertical lines on the chart"
        />
      </Box>

      {/* Price chart */}
      <Card sx={{ mb: 2, opacity: loading ? 0.5 : 1 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Brent crude price (USD/barrel)
          </Typography>
          <Typography variant="body2" sx={{ color: chart.textSecondary, mb: 1 }}>
            Vertical lines mark major events — <Box component="span" sx={{ color: chart.up, fontWeight: 600 }}>blue</Box> where
            the 30-day average price rose after the event, <Box component="span" sx={{ color: chart.down, fontWeight: 600 }}>red</Box> where
            it fell. Click near a line (or an event card below) to highlight its ±90-day window.
          </Typography>
          {loading && !prices.length ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <PriceChart
              prices={prices}
              events={events}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
            />
          )}
        </CardContent>
      </Card>

      {/* Selected event detail */}
      {selectedEvent && (
        <Card sx={{ mb: 2, borderLeft: `4px solid ${chart.highlight}` }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">{selectedEvent.event}</Typography>
              <Chip size="small" label={selectedEvent.category} />
              <Chip
                size="small"
                label={pctText(selectedEvent.pct_change)}
                sx={{
                  bgcolor: 'transparent',
                  border: '1px solid',
                  borderColor:
                    selectedEvent.pct_change == null
                      ? chart.axis
                      : selectedEvent.pct_change >= 0
                        ? chart.up
                        : chart.down,
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: chart.textSecondary }}>
              {selectedEvent.date} — {selectedEvent.description}
            </Typography>
            {selectedEvent.avg_price_30d_before != null && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Avg price 30 days before: <b>${selectedEvent.avg_price_30d_before}</b> → 30 days
                after: <b>${selectedEvent.avg_price_30d_after}</b>
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Event quick-select chips */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Highlight an event
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {events.map((e) => (
              <Chip
                key={e.id}
                label={`${e.date.slice(0, 4)} · ${e.event}`}
                onClick={() => setSelectedEvent(selectedEvent?.id === e.id ? null : e)}
                variant={selectedEvent?.id === e.id ? 'filled' : 'outlined'}
                color={selectedEvent?.id === e.id ? 'secondary' : 'default'}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
