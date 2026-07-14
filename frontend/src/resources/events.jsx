import {
  List,
  Datagrid,
  TextField,
  Show,
  SimpleShowLayout,
  NumberField,
  FunctionField,
} from 'react-admin';
import { Chip } from '@mui/material';
import { chart } from '../theme';

const PctChangeField = ({ source }) => (
  <FunctionField
    source={source}
    render={(record) => {
      const v = record[source];
      if (v == null) return <Chip size="small" label="n/a" variant="outlined" />;
      return (
        <span style={{ color: v >= 0 ? chart.up : chart.down, fontWeight: 600 }}>
          {v > 0 ? '+' : ''}
          {v}%
        </span>
      );
    }}
  />
);

export const EventList = () => (
  <List sort={{ field: 'date', order: 'ASC' }} pagination={false} exporter={false}>
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="date" />
      <TextField source="event" />
      <TextField source="category" />
      <PctChangeField source="pct_change" label="Price impact (±30d)" />
    </Datagrid>
  </List>
);

export const EventShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="date" />
      <TextField source="event" />
      <TextField source="category" />
      <TextField source="description" />
      <NumberField source="avg_price_30d_before" label="Avg price 30d before ($)" />
      <NumberField source="avg_price_30d_after" label="Avg price 30d after ($)" />
      <PctChangeField source="pct_change" label="Price impact (±30d)" />
    </SimpleShowLayout>
  </Show>
);
