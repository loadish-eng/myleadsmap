import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'admin' && user.subscription_status !== 'active') {
      return Response.json({ error: 'Active subscription required' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    // Standard users must use their own Google API key; premium/admin use the app's shared key
    const isStandard = user.subscription_plan === 'standard' && user.role !== 'admin';
    const appApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    const apiKey = isStandard ? user.google_api_key : appApiKey;

    if (action === 'config') {
      if (!apiKey) {
        return Response.json({ error: 'Please add your Google Maps API key in your Profile to start searching.' }, { status: 400 });
      }
      return Response.json({ apiKey });
    }

    if (!apiKey) {
      return Response.json({ error: isStandard ? 'Please add your Google Maps API key in your Profile.' : 'Maps API key not configured' }, { status: 400 });
    }

    if (action === 'geocode') {
      const { zip } = body;
      if (!zip) return Response.json({ error: 'Missing zip' }, { status: 400 });
      const url = 'https://places.googleapis.com/v1/places:searchText';
      const fieldMask = 'places.location,places.formattedAddress';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask,
        },
        body: JSON.stringify({ textQuery: zip, languageCode: 'en', regionCode: 'us' }),
      });
      const data = await response.json();
      if (response.ok && data.places && data.places[0]) {
        const loc = data.places[0].location;
        return Response.json({ lat: loc.latitude, lng: loc.longitude, formatted_address: data.places[0].formattedAddress });
      }
      console.error('geocode failed:', JSON.stringify(data));
      return Response.json({ error: 'Could not find that zip code' }, { status: 400 });
    }

    if (action === 'search') {
      const { lat, lng, keyword, radius } = body;
      if (lat == null || lng == null || !keyword) {
        return Response.json({ error: 'Missing required params (lat, lng, keyword)' }, { status: 400 });
      }

      const cacheKey = `search:${keyword.toLowerCase().trim()}:${Number(lat).toFixed(3)}:${Number(lng).toFixed(3)}`;
      const cached = await base44.asServiceRole.entities.PlaceCache.filter({ cache_key: cacheKey }, '-created_date', 1);
      if (cached.length > 0 && Date.now() - new Date(cached[0].created_date).getTime() < 24 * 60 * 60 * 1000) {
        return Response.json(cached[0].result);
      }

      const url = 'https://places.googleapis.com/v1/places:searchText';
      const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.nationalPhoneNumber,places.websiteUri,nextPageToken';
      let allPlaces = [];
      let pageToken = null;
      const maxPages = 3; // Google caps searchText at ~60 results (3 pages of 20)

      const baseRequestBody = {
        textQuery: keyword,
        locationBias: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radius || 5000,
          },
        },
      };

      for (let page = 0; page < maxPages; page++) {
        if (pageToken) {
          // Google requires a short delay before a pageToken becomes valid
          await new Promise(r => setTimeout(r, 2000));
        }
        // When paginating, all original parameters must be included alongside pageToken
        const requestBody = pageToken
          ? { ...baseRequestBody, pageToken }
          : baseRequestBody;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': fieldMask,
          },
          body: JSON.stringify(requestBody),
        });
        const data = await response.json();
        if (!response.ok) {
          // Stop paginating but keep whatever places we already collected
          break;
        }
        allPlaces = allPlaces.concat((data.places || []).map(p => ({
          place_id: p.id,
          name: p.displayName?.text || '',
          address: p.formattedAddress || '',
          lat: p.location?.latitude,
          lng: p.location?.longitude,
          category: (p.types || [])[0] || 'business',
          phone: p.nationalPhoneNumber || '',
          website: p.websiteUri || '',
        })));
        pageToken = data.nextPageToken;
        if (!pageToken) break;
      }

      const result = { places: allPlaces };
      if (cached.length > 0) {
        await base44.asServiceRole.entities.PlaceCache.update(cached[0].id, { result });
      } else {
        await base44.asServiceRole.entities.PlaceCache.create({ cache_key: cacheKey, result });
      }
      return Response.json(result);
    }

    if (action === 'details') {
      const { place_id } = body;
      if (!place_id) return Response.json({ error: 'Missing place_id' }, { status: 400 });

      const cacheKey = `details:${place_id}`;
      const cached = await base44.asServiceRole.entities.PlaceCache.filter({ cache_key: cacheKey }, '-created_date', 1);
      if (cached.length > 0 && Date.now() - new Date(cached[0].created_date).getTime() < 24 * 60 * 60 * 1000) {
        return Response.json(cached[0].result);
      }

      const url = `https://places.googleapis.com/v1/places/${place_id}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,types,nationalPhoneNumber,websiteUri',
        },
      });
      const p = await response.json();
      if (!response.ok) {
        return Response.json({ error: p.error?.message || 'Details failed' }, { status: 200 });
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
      if (cached.length > 0) {
        await base44.asServiceRole.entities.PlaceCache.update(cached[0].id, { result });
      } else {
        await base44.asServiceRole.entities.PlaceCache.create({ cache_key: cacheKey, result });
      }
      return Response.json(result);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('googlePlaces error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});