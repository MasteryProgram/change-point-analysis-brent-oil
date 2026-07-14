import { useMemo, useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { Box, Typography } from '@mui/material';
import { chart } from '../theme';

const fmtPrice = (v) => `$${Number(v).toFixed(2)}`;
const fmtYear = (d) => d.slice(0, 4);

/** Custom tooltip: value leads, label follows; line-key in series color. */
const PriceTooltip = ({ active, payload, label, eventsByDate }) => {
  if (!active || !payload?.length) return null;
  const ev = eventsByDate[label];
  return (
    <Box
      sx={{
        bgcolor: chart.surface,
        border: '1px solid rgba(11,11,11,0.10)',
        borderRadius: 1,
        px: 1.5,
        py: 1,
        boxShadow: 2,
        maxWidth: 260,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700, color: chart.textPrimary }}>
        {fmtPrice(payload[0].value)}
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            width: 14,
            height: 2,
            bgcolor: chart.series1,
            ml: 1,
            verticalAlign: 'middle',
          }}
        />
      </Typography>
      <Typography variant="caption" sx={{ color: chart.textSecondary }}>
        {label}
      </Typography>
      {ev && (
        <Typography variant="caption" sx={{ display: 'block', color: chart.textPrimary, mt: 0.5 }}>
          ⚑ {ev.event}
        </Typography>
      )}
    </Box>
  );
};

/**
 * The main Brent price line chart.
 *  - vertical reference lines mark each major event
 *  - clicking near an event (or passing selectedEvent) highlights a
 *    +/-90-day window around it ("event highlight" feature)
 */
export const PriceChart = ({ prices, events, selectedEvent, onSelectEvent }) => {
  const eventsByDate = useMemo(
    () => Object.fromEntries(events.map((e) => [e.date, e])),
    [events]
  );

  // Only mark events that fall inside the plotted range.
  const visibleEvents = useMemo(() => {
    if (!prices.length) return [];
    const first = prices[0].date;
    const last = prices[prices.length - 1].date;
    return events.filter((e) => e.date >= first && e.date <= last);
  }, [prices, events]);

  // Highlight window: +/- 90 days around the selected event.
  const highlight = useMemo(() => {
    if (!selectedEvent) return null;
    const t = new Date(selectedEvent.date).getTime();
    const ms = 90 * 24 * 3600 * 1000;
    const iso = (x) => new Date(x).toISOString().slice(0, 10);
    return { x1: iso(t - ms), x2: iso(t + ms) };
  }, [selectedEvent]);

  const handleClick = useCallback(
    (state) => {
      if (!state?.activeLabel || !onSelectEvent) return;
      // find the nearest event to the clicked date (within 120 days)
      const clicked = new Date(state.activeLabel).getTime();
      let best = null;
      let bestDist = 120 * 24 * 3600 * 1000;
      for (const e of visibleEvents) {
        const d = Math.abs(new Date(e.date).getTime() - clicked);
        if (d < bestDist) {
          best = e;
          bestDist = d;
        }
      }
      onSelectEvent(best); // null = clicked far from any event -> clear
    },
    [visibleEvents, onSelectEvent]
  );

  return (
    <ResponsiveContainer width="100%" height={380}>
      <LineChart data={prices} onClick={handleClick} margin={{ top: 12, right: 16, bottom: 4, left: 4 }}>
        <CartesianGrid stroke={chart.grid} strokeWidth={1} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={fmtYear}
          minTickGap={48}
          tick={{ fill: chart.axis, fontSize: 12 }}
          stroke={chart.axis}
        />
        <YAxis
          tickFormatter={(v) => `$${v}`}
          tick={{ fill: chart.axis, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}
          stroke={chart.axis}
          width={52}
        />
        <Tooltip content={<PriceTooltip eventsByDate={eventsByDate} />} />

        {highlight && (
          <ReferenceArea
            x1={highlight.x1}
            x2={highlight.x2}
            fill={chart.highlight}
            fillOpacity={0.08}
            ifOverflow="hidden"
          />
        )}

        {visibleEvents.map((e) => {
          const selected = selectedEvent && selectedEvent.id === e.id;
          const color = e.pct_change == null
            ? chart.axis
            : e.pct_change >= 0 ? chart.up : chart.down;
          return (
            <ReferenceLine
              key={e.id}
              x={e.date}
              stroke={selected ? chart.highlight : color}
              strokeWidth={selected ? 2 : 1}
              ifOverflow="hidden"
            />
          );
        })}

        <Line
          type="monotone"
          dataKey="price"
          stroke={chart.series1}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: chart.surface }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
