import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function resolveApiKey(user) {
  const isStandard = user.subscriptionPlan === 'standard' && user.role !== 'admin';
  const appApiKey = process.env.GOOGLE_MAPS_API_KEY;
  return isStandard ? user.googleApiKey : appApiKey;
}

router.post('/', async (req, res) => {
  const user = req.user;
  if (user.role !== 'admin' && user.subscriptionStatus !== 'active') {
    return res.status(403).json({ error: 'Active subscription required' });
  }

  const body = req.body || {};
  const { action } = body;
  const isStandard = user.subscriptionPlan === 'standard' && user.role !== 'admin';
  const apiKey = resolveApiKey(user);

  if (action === 'config') {
    if (!apiKey) {
      return res.status(400).json({ error: 'Please add your Google Maps API key in your Profile to start searching.' });
    }
    return res.json({ apiKey });
  }

  if (!apiKey) {
    return res.status(400).json({
      error: isStandard ? 'Please add your Google Maps API key in your Profile.' : 'Maps API key not configured',
    });
  }

  try {
    if (action === 'geocode') {
      const { zip } = body;
      if (!zip) return res.status(400).json({ error: 'Missing zip' });

      const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.location,places.formattedAddress',
        },
        body: JSON.stringify({ textQuery: zip, languageCode: 'en', regionCode: 'us' }),
      });
      const data = await response.json();
      if (response.ok && data.places && data.places[0]) {
        const loc = data.places[0].location;
        return res.json({ lat: loc.latitude, lng: loc.longitude, formatted_address: data.places[0].formattedAddress });
      }
      console.error('geocode failed:', JSON.stringify(data));
      return res.status(400).json({ error: 'Could not find that zip code' });
    }

    if (action === 'search') {
      const { lat, lng, keyword, radius } = body;
      if (lat == null || lng == null || !keyword) {
        return res.status(400).json({ error: 'Missing required params (lat, lng, keyword)' });
      }

      const cacheKey = `search:${keyword.toLowerCase().trim()}:${Number(lat).toFixed(3)}:${Number(lng).toFixed(3)}`;
      const cached = await prisma.placeCache.findUnique({ where: { cacheKey } });
      if (cached && Date.now() - new Date(cached.updatedAt).getTime() < CACHE_TTL_MS) {
        return res.json(cached.result);
      }

      const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.nationalPhoneNumber,places.websiteUri,nextPageToken';
      let allPlaces = [];
      let pageToken = null;
      const maxPages = 3; // Google caps searchText at ~60 results (3 pages of 20)

      const baseRequestBody = {
        textQuery: keyword,
        locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: radius || 5000 } },
      };

      for (let page = 0; page < maxPages; page++) {
        if (pageToken) {
          // Google requires a short delay before a pageToken becomes valid
          await new Promise((r) => setTimeout(r, 2000));
        }
        const requestBody = pageToken ? { ...baseRequestBody, pageToken } : baseRequestBody;
        const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': fieldMask },
          body: JSON.stringify(requestBody),
        });
        const data = await response.json();
        if (!response.ok) break;
        allPlaces = allPlaces.concat(
          (data.places || []).map((p) => ({
            place_id: p.id,
            name: p.displayName?.text || '',
            address: p.formattedAddress || '',
            lat: p.location?.latitude,
            lng: p.location?.longitude,
            category: (p.types || [])[0] || 'business',
            phone: p.nationalPhoneNumber || '',
            website: p.websiteUri || '',
          }))
        );
        pageToken = data.nextPageToken;
        if (!pageToken) break;
      }

      const result = { places: allPlaces };
      await prisma.placeCache.upsert({
        where: { cacheKey },
        update: { result },
        create: { cacheKey, result, keyword, lat, lng },
      });
      return res.json(result);
    }

    if (action === 'details') {
      const { place_id } = body;
      if (!place_id) return res.status(400).json({ error: 'Missing place_id' });

      const cacheKey = `details:${place_id}`;
      const cached = await prisma.placeCache.findUnique({ where: { cacheKey } });
      if (cached && Date.now() - new Date(cached.updatedAt).getTime() < CACHE_TTL_MS) {
        return res.json(cached.result);
      }

      const response = await fetch(`https://places.googleapis.com/v1/places/${place_id}`, {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,types,nationalPhoneNumber,websiteUri',
        },
      });
      const p = await response.json();
      if (!response.ok) {
        return res.status(200).json({ error: p.error?.message || 'Details failed' });
      }
      const result = {
        place: {
          place_id: p.id,
          name: p.displayName?.text || '',
          address: p.formattedAddress || '',
          phone: p.nationalPhoneNumber || '',
          website: p.websiteUri || '',
          lat: p.location?.latitude,
          lng: p.location?.longitude,
          category: (p.types || [])[0] || 'business',
        },
      };
      await prisma.placeCache.upsert({
        where: { cacheKey },
        update: { result },
        create: { cacheKey, result },
      });
      return res.json(result);
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('places error:', error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
