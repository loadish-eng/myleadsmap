import { useEffect, useRef } from 'react';
import { mapStyles } from '@/lib/mapStyles';
import { createMarkerIcon } from '@/lib/categoryIcons';

const USER_LOCATION_ICON = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    <circle cx="11" cy="11" r="10" fill="#4285F4" fill-opacity="0.2"/>
    <circle cx="11" cy="11" r="6" fill="#4285F4" stroke="#FFFFFF" stroke-width="2.5"/>
  </svg>`
);

export default function MapView({ loaded, center, places, leads, userLocation, onPlaceClick, onCenterChanged }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const userLocationMarkerRef = useRef(null);
  const clickHandlerRef = useRef(onPlaceClick);
  clickHandlerRef.current = onPlaceClick;
  const centerChangedRef = useRef(onCenterChanged);
  centerChangedRef.current = onCenterChanged;

  useEffect(() => {
    if (!loaded || !window.google?.maps || mapInstance.current || !center) return;
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      styles: mapStyles,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    mapInstance.current.addListener('idle', () => {
      const c = mapInstance.current.getCenter();
      if (c && centerChangedRef.current) {
        centerChangedRef.current({ lat: c.lat(), lng: c.lng() });
      }
    });
  }, [loaded, center]);

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;
    const observer = new ResizeObserver(() => {
      const map = mapInstance.current;
      if (!map) return;
      window.google.maps.event.trigger(map, 'resize');
      // Triggering 'resize' in the same tick as the ResizeObserver callback can still leave
      // Maps working off stale (pre-resize) dimensions if the browser hasn't fully committed
      // the new layout yet -- more likely on a big, fast size change (e.g. dragging the sidebar
      // handle all the way to one extreme). Deferring a frame gives layout a chance to settle
      // before asking Maps to recompute against it.
      requestAnimationFrame(() => {
        if (mapInstance.current !== map) return;
        // setCenter to the exact LatLng Maps already has can be a no-op -- it doesn't always
        // force a genuine tile refetch for the newly-exposed area. A tiny panBy-and-back forces
        // a real bounds recompute regardless.
        map.panBy(1, 0);
        map.panBy(-1, 0);
      });
    });
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, [loaded]);

  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.panTo(center);
    }
  }, [center]);

  useEffect(() => {
    if (!mapInstance.current || !window.google?.maps) return;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const leadMap = {};
    (leads || []).forEach(l => { leadMap[l.place_id] = l; });

    const allItems = [...(places || [])];
    const seenIds = new Set((places || []).map(p => p.place_id));
    (leads || []).forEach(l => {
      if (!seenIds.has(l.place_id)) {
        seenIds.add(l.place_id);
        allItems.push({
          place_id: l.place_id,
          name: l.name,
          address: l.address,
          lat: l.lat,
          lng: l.lng,
          category: l.category,
        });
      }
    });

    allItems.forEach(place => {
      const lead = leadMap[place.place_id];
      const iconUrl = createMarkerIcon(place.category, lead?.pipeline_stage);
      const marker = new window.google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: mapInstance.current,
        icon: {
          url: iconUrl,
          scaledSize: new window.google.maps.Size(36, 48),
          anchor: new window.google.maps.Point(18, 48),
        },
      });
      marker.addListener('click', () => clickHandlerRef.current(place, lead));
      markersRef.current.push(marker);
    });
  }, [places, leads]);

  useEffect(() => {
    if (!mapInstance.current || !window.google?.maps || !userLocation) return;

    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setPosition(userLocation);
      return;
    }

    userLocationMarkerRef.current = new window.google.maps.Marker({
      position: userLocation,
      map: mapInstance.current,
      icon: {
        url: USER_LOCATION_ICON,
        scaledSize: new window.google.maps.Size(22, 22),
        anchor: new window.google.maps.Point(11, 11),
      },
      zIndex: 1000,
      clickable: false,
      title: 'You are here',
    });
  }, [userLocation]);

  return <div ref={mapRef} className="w-full h-full" />;
}