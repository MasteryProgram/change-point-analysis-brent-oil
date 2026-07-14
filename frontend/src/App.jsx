import { Admin, Resource, CustomRoutes, Layout, Menu } from 'react-admin';
import { Route } from 'react-router-dom';
import EventNoteIcon from '@mui/icons-material/EventNote';
import InsightsIcon from '@mui/icons-material/Insights';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { dataProvider } from './dataProvider';
import { theme } from './theme';
import { Dashboard } from './Dashboard';
import { ModelResults } from './ModelResults';
import { EventList, EventShow } from './resources/events';

const AppMenu = () => (
  <Menu>
    <Menu.DashboardItem primaryText="Dashboard" leftIcon={<DashboardIcon />} />
    <Menu.ResourceItem name="events" />
    <Menu.Item to="/model-results" primaryText="Model Results" leftIcon={<InsightsIcon />} />
  </Menu>
);

const AppLayout = (props) => <Layout {...props} menu={AppMenu} />;

const App = () => (
  <Admin
    dataProvider={dataProvider}
    dashboard={Dashboard}
    layout={AppLayout}
    theme={theme}
    title="Brent Oil Price Dashboard"
    disableTelemetry
  >
    <Resource
      name="events"
      list={EventList}
      show={EventShow}
      icon={EventNoteIcon}
      options={{ label: 'Major Events' }}
    />
    <CustomRoutes>
      <Route path="/model-results" element={<ModelResults />} />
    </CustomRoutes>
  </Admin>
);

export default App;
