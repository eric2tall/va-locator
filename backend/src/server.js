const express = require('express');
const cors = require('cors');
const axios = require('axios');
const zipcodes = require('zipcodes');

const app = express();
const PORT = process.env.PORT || 3001;
const VA_API_KEY = process.env.VA_API_KEY || '';
const VA_API_BASE = 'https://sandbox-api.va.gov/services/va_facilities/v1';

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'va-locator-backend' });
});

// GET /facilities?zip=94596&radius=50&limit=10
app.get('/facilities', async (req, res) => {
  const { zip, radius = 50, limit = 10 } = req.query;

  if (!zip || !/^\d{5}$/.test(zip)) {
    return res.status(400).json({ error: 'Valid 5-digit zip code required' });
  }

  // Look up lat/long for zip code
  const location = zipcodes.lookup(zip);
  if (!location) {
    return res.status(404).json({ error: `Zip code ${zip} not found` });
  }

  const { latitude: lat, longitude: lng } = location;
  const radiusMiles = parseFloat(radius);

  // Convert miles to degrees (approximate)
  const latDelta = radiusMiles / 69.0;
  const lngDelta = radiusMiles / (69.0 * Math.cos((lat * Math.PI) / 180));

  const bbox = [
    (lng - lngDelta).toFixed(4),
    (lat - latDelta).toFixed(4),
    (lng + lngDelta).toFixed(4),
    (lat + latDelta).toFixed(4),
  ];

  try {
    const response = await axios.get(`${VA_API_BASE}/facilities`, {
      headers: { apikey: VA_API_KEY },
      params: {
        'bbox[]': bbox,
        type: 'health',
        per_page: parseInt(limit),
      },
      paramsSerializer: (params) => {
        // bbox[] needs to be repeated
        const parts = [];
        bbox.forEach(b => parts.push(`bbox[]=${b}`));
        parts.push(`type=${params.type}`);
        parts.push(`per_page=${params.per_page}`);
        return parts.join('&');
      }
    });

    const facilities = response.data.data.map(f => ({
      id: f.id,
      name: f.attributes.name,
      type: f.attributes.classification,
      address: f.attributes.address?.physical,
      phone: f.attributes.phone?.main,
      hours: f.attributes.hours,
      website: f.attributes.website,
      lat: f.attributes.lat,
      long: f.attributes.long,
      distance: calculateDistance(lat, lng, f.attributes.lat, f.attributes.long),
    }));

    // Sort by distance
    facilities.sort((a, b) => a.distance - b.distance);

    res.json({
      zip,
      city: location.city,
      state: location.state,
      total: facilities.length,
      facilities,
    });

  } catch (err) {
    console.error('VA API error:', err.response?.data || err.message);
    res.status(502).json({ error: 'Failed to fetch VA facilities' });
  }
});

function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

app.listen(PORT, () => {
  console.log(`VA Locator backend running on port ${PORT}`);
});
