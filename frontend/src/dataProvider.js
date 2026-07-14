/**
 * Data layer — the ONE file that binds the UI to the Flask backend.
 *
 * The Flask API returns {status, count, data} shapes; react-admin expects
 * {data, total}. This provider does that small translation. To point the
 * dashboard at a different backend, change API_URL (or swap this file).
 */
const API_URL = 'http://localhost:5000/api';

const httpGet = async (path) => {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
};

export const dataProvider = {
  // resource "events" -> GET /api/events ; "change-points" -> GET /api/change-points
  getList: async (resource, params) => {
    const json = await httpGet(`/${resource}`);
    let data = json.data;

    // client-side sort (the datasets are small; the API returns everything)
    const { field, order } = params.sort || {};
    if (field) {
      data = [...data].sort((a, b) => {
        const va = a[field], vb = b[field];
        const cmp = va > vb ? 1 : va < vb ? -1 : 0;
        return order === 'DESC' ? -cmp : cmp;
      });
    }
    return { data, total: data.length };
  },

  getOne: async (resource, params) => {
    const json = await httpGet(`/${resource}/${params.id}`);
    return { data: json.data };
  },

  getMany: async (resource, params) => {
    const json = await httpGet(`/${resource}`);
    return { data: json.data.filter((r) => params.ids.includes(r.id)) };
  },

  // Read-only dashboard: writes are not supported by the backend.
  getManyReference: () => Promise.reject(new Error('Not supported')),
  create: () => Promise.reject(new Error('Read-only API')),
  update: () => Promise.reject(new Error('Read-only API')),
  updateMany: () => Promise.reject(new Error('Read-only API')),
  delete: () => Promise.reject(new Error('Read-only API')),
  deleteMany: () => Promise.reject(new Error('Read-only API')),
};

// Non-resource endpoints used by the Dashboard directly.
export const fetchPrices = (start, end) => {
  const qs = new URLSearchParams();
  if (start) qs.set('start', start);
  if (end) qs.set('end', end);
  const q = qs.toString();
  return httpGet(`/prices${q ? `?${q}` : ''}`);
};

export const fetchIndicators = (start, end) => {
  const qs = new URLSearchParams();
  if (start) qs.set('start', start);
  if (end) qs.set('end', end);
  const q = qs.toString();
  return httpGet(`/indicators${q ? `?${q}` : ''}`);
};

export const fetchEvents = () => httpGet('/events');
export const fetchChangePoints = () => httpGet('/change-points');
