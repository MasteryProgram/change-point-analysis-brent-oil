import { Box, Button, TextField } from '@mui/material';

/**
 * One filter row above the charts (never inside a chart card).
 * Presets first, then a custom start/end range. All charts and stats
 * below re-render against the same slice.
 *
 * Note: the price data ends in Nov 2022, so presets are relative to the
 * dataset's end, not today.
 */
const DATA_END = '2022-11-14';

const PRESETS = [
  { label: 'All (1987–2022)', start: '', end: '' },
  { label: 'Last 5 years', start: '2017-11-14', end: DATA_END },
  { label: 'Last 10 years', start: '2012-11-14', end: DATA_END },
  { label: '2020 (COVID)', start: '2019-10-01', end: '2020-12-31' },
];

export const DateRangeFilter = ({ range, onChange }) => {
  const isActive = (p) => p.start === range.start && p.end === range.end;

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
      {PRESETS.map((p) => (
        <Button
          key={p.label}
          size="small"
          variant={isActive(p) ? 'contained' : 'outlined'}
          onClick={() => onChange({ start: p.start, end: p.end })}
        >
          {p.label}
        </Button>
      ))}
      <TextField
        type="date"
        size="small"
        label="From"
        value={range.start}
        onChange={(e) => onChange({ ...range, start: e.target.value })}
        InputLabelProps={{ shrink: true }}
        sx={{ width: 160 }}
      />
      <TextField
        type="date"
        size="small"
        label="To"
        value={range.end}
        onChange={(e) => onChange({ ...range, end: e.target.value })}
        InputLabelProps={{ shrink: true }}
        sx={{ width: 160 }}
      />
    </Box>
  );
};
