import { Card, CardContent, Typography, Box } from '@mui/material';
import { chart } from '../theme';

/**
 * Stat tile: label + value (+ optional secondary line).
 * Value uses proportional figures (no tabular-nums on big numbers).
 */
export const StatCard = ({ label, value, secondary }) => (
  <Card sx={{ flex: 1, minWidth: 170 }}>
    <CardContent sx={{ pb: '16px !important' }}>
      <Typography variant="body2" sx={{ color: chart.textSecondary }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 28, fontWeight: 600, color: chart.textPrimary, lineHeight: 1.3 }}>
        {value}
      </Typography>
      {secondary && (
        <Box component="span" sx={{ fontSize: 13, color: chart.textSecondary }}>
          {secondary}
        </Box>
      )}
    </CardContent>
  </Card>
);
