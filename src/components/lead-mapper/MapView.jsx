import { useEffect, useRef } from 'react';
import { mapStyles } from '@/lib/mapStyles';
import { createMarkerIcon } from '@/lib/categoryIcons';

export default function MapView({ loaded, center, places, leads, onPlaceClick, onCenterChanged }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
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
      if (mapInstance.current) {
        window.google.maps.event.trigger(mapInstance.current, 'resize');
      }
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

  return <div ref={mapRef} className="w-full h-full" />;
}