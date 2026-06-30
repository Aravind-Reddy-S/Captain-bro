import React, { useEffect, useRef, useState } from 'react';
import { FaMapMarkerAlt, FaStore, FaMotorcycle, FaRoute } from 'react-icons/fa';

// Default Warangal Coordinates
const DEFAULT_RESTAURANT = { lat: 17.9689, lng: 79.5941 }; // Chowrasta
const DEFAULT_CUSTOMER = { lat: 18.0076, lng: 79.5623 }; // Hanamkonda

export const DeliveryMap = ({
  riderLat,
  riderLng,
  restaurantLat = DEFAULT_RESTAURANT.lat,
  restaurantLng = DEFAULT_RESTAURANT.lng,
  customerLat = DEFAULT_CUSTOMER.lat,
  customerLng = DEFAULT_CUSTOMER.lng,
  status = 'dispatched'
}) => {
  const mapRef = useRef(null);
  const canvasRef = useRef(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(true);

  const googleKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Try loading Google Maps script if API key is present
  useEffect(() => {
    const isPlaceholder = (val) => {
      if (!val) return true;
      const lowercase = val.toLowerCase();
      return (
        lowercase.includes('placeholder') ||
        lowercase.includes('your_') ||
        lowercase.includes('paste_your')
      );
    };

    if (isPlaceholder(googleKey)) {
      setUseFallback(true);
      return;
    }

    const loadGoogleScript = () => {
      if (window.google && window.google.maps) {
        setGoogleMapsLoaded(true);
        setUseFallback(false);
        return;
      }

      const scriptId = 'google-maps-script';
      let script = document.getElementById(scriptId);

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleKey}&libraries=geometry`;
        script.async = true;
        script.onload = () => {
          setGoogleMapsLoaded(true);
          setUseFallback(false);
        };
        script.onerror = () => {
          console.warn('Google Maps script load failed. Falling back to vector simulator.');
          setUseFallback(true);
        };
        document.body.appendChild(script);
      } else {
        // script tag exists, wait for it to load
        const interval = setInterval(() => {
          if (window.google && window.google.maps) {
            setGoogleMapsLoaded(true);
            setUseFallback(false);
            clearInterval(interval);
          }
        }, 100);
        setTimeout(() => clearInterval(interval), 10000); // safety timeout
      }
    };

    loadGoogleScript();
  }, [googleKey]);

  // Google Maps Instance Initialization & Update
  useEffect(() => {
    if (useFallback || !googleMapsLoaded || !mapRef.current) return;

    try {
      const google = window.google;
      const rLocation = new google.maps.LatLng(restaurantLat, restaurantLng);
      const cLocation = new google.maps.LatLng(customerLat, customerLng);
      const currentRiderLat = riderLat || restaurantLat;
      const currentRiderLng = riderLng || restaurantLng;
      const riderLocation = new google.maps.LatLng(currentRiderLat, currentRiderLng);

      const mapOptions = {
        center: riderLocation,
        zoom: 14,
        styles: mapStylesDark, // premium dark theme
        disableDefaultUI: true,
        zoomControl: true
      };

      const map = new google.maps.Map(mapRef.current, mapOptions);

      // Restaurant Marker (Store Icon)
      new google.maps.Marker({
        position: rLocation,
        map,
        title: 'Chowrasta Store',
        icon: {
          url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%238B0000" width="36" height="36"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
          scaledSize: new google.maps.Size(36, 36)
        }
      });

      // Customer Marker (Home Icon)
      new google.maps.Marker({
        position: cLocation,
        map,
        title: 'Customer Home',
        icon: {
          url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FFC107" width="36" height="36"><path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg>',
          scaledSize: new google.maps.Size(36, 36)
        }
      });

      // Rider Marker (Scooter Icon)
      new google.maps.Marker({
        position: riderLocation,
        map,
        title: 'Delivery Partner',
        icon: {
          url: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%232196F3" width="36" height="36"><path d="M20 11H18V7H20V11ZM19 13C17.9 13 17 13.9 17 15C17 16.1 17.9 17 19 17C20.1 17 21 16.1 21 15C21 13.9 20.1 13 19 13ZM5 13C3.9 13 3 13.9 3 15C3 16.1 3.9 17 5 17C6.1 17 7 16.1 7 15C7 13.9 6.1 13 5 13ZM15.8 9.2L14.4 7.8L11.5 10.7L9 8.2L5 12.2V15H8.8L11.5 12.3L14 14.8L15.8 13L14 11.2L15.8 9.2Z"/></svg>',
          scaledSize: new google.maps.Size(36, 36)
        }
      });

      // Draw Path Polyline
      const flightPath = new google.maps.Polyline({
        path: [rLocation, riderLocation, cLocation],
        geodesic: true,
        strokeColor: '#8B0000',
        strokeOpacity: 0.8,
        strokeWeight: 4
      });

      flightPath.setMap(map);

      // Adjust map bounds
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(rLocation);
      bounds.extend(cLocation);
      bounds.extend(riderLocation);
      map.fitBounds(bounds);

    } catch (e) {
      console.error('Error drawing Google Map: ', e);
      setUseFallback(true);
    }
  }, [googleMapsLoaded, useFallback, riderLat, riderLng, restaurantLat, restaurantLng, customerLat, customerLng]);

  // Premium Vector Canvas Fallback Drawing
  useEffect(() => {
    if (!useFallback || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let pulseAngle = 0;

    // Resizing for crisp rendering
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();

    // Route coordinates translation relative to canvas bounds
    // Restaurant: East, Customer: West
    const drawMapSimulation = () => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Styled Grid Streets (City Blueprint background)
      ctx.strokeStyle = 'rgba(28, 37, 65, 0.04)';
      ctx.lineWidth = 4;

      // Draw horizontal streets
      for (let i = 20; i < h; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
        ctx.stroke();
      }
      // Draw vertical streets
      for (let j = 20; j < w; j += 40) {
        ctx.beginPath();
        ctx.moveTo(j, 0);
        ctx.lineTo(j, h);
        ctx.stroke();
      }

      // 2. Draw Warangal Lakeline or Park visual elements (premium aesthetic)
      ctx.fillStyle = 'rgba(33, 150, 243, 0.04)';
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.7, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(76, 175, 80, 0.03)';
      ctx.beginPath();
      ctx.arc(w * 0.2, h * 0.8, 65, 0, Math.PI * 2);
      ctx.fill();

      // Coordinates mapping
      // Start: Restaurant (75%, 70%)
      // End: Customer (25%, 25%)
      const startX = w * 0.75;
      const startY = h * 0.7;
      const endX = w * 0.25;
      const endY = h * 0.25;

      // Interpolate rider coordinates based on input or simulate path
      let riderX, riderY;
      const totalLatDiff = customerLat - restaurantLat;
      const totalLngDiff = customerLng - restaurantLng;

      if (riderLat && riderLng && totalLatDiff !== 0 && totalLngDiff !== 0) {
        // Map actual lat/lng values to screen coordinates
        const progressLat = (riderLat - restaurantLat) / totalLatDiff;
        const progressLng = (riderLng - restaurantLng) / totalLngDiff;
        const avgProgress = Math.max(0, Math.min(1, (progressLat + progressLng) / 2));
        
        riderX = startX + (endX - startX) * avgProgress;
        riderY = startY + (endY - startY) * avgProgress;
      } else {
        // Fallback to start
        riderX = startX;
        riderY = startY;
      }

      // 3. Draw Route Path Polyline
      ctx.strokeStyle = '#8B0000';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([6, 4]); // Dotted road path
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      // Let road bend slightly for higher realism
      ctx.lineTo(startX, endY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // 4. Draw Restaurant Pin
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.arc(startX, startY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label restaurant
      ctx.fillStyle = '#1C2541';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('Chowrasta Store', startX - 35, startY + 22);

      // 5. Draw Customer Destination pulsing ring
      pulseAngle += 0.05;
      const pulseRadius = 10 + Math.sin(pulseAngle) * 5;
      ctx.fillStyle = 'rgba(255, 193, 7, 0.15)';
      ctx.beginPath();
      ctx.arc(endX, endY, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw Customer Pin
      ctx.fillStyle = '#FFC107';
      ctx.beginPath();
      ctx.arc(endX, endY, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#1C2541';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('Hanamkonda Home', endX - 40, endY - 15);

      // 6. Draw Rider pulsing radar ring
      if (status !== 'delivered') {
        const riderPulse = 11 + Math.cos(pulseAngle * 1.5) * 4;
        ctx.fillStyle = 'rgba(33, 150, 243, 0.2)';
        ctx.beginPath();
        ctx.arc(riderX, riderY, riderPulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Rider Scooter Marker
      ctx.fillStyle = '#2196F3';
      ctx.beginPath();
      ctx.arc(riderX, riderY, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw mini chevron/arrow inside rider marker
      ctx.fillStyle = '#white';
      ctx.beginPath();
      ctx.moveTo(riderX - 3, riderY + 3);
      ctx.lineTo(riderX + 4, riderY);
      ctx.lineTo(riderX - 3, riderY - 3);
      ctx.fill();

      ctx.fillStyle = '#2196F3';
      ctx.font = 'black 9px sans-serif';
      ctx.fillText('Delivery Scooter', riderX + 16, riderY + 3);

      animationId = requestAnimationFrame(drawMapSimulation);
    };

    drawMapSimulation();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [useFallback, riderLat, riderLng, restaurantLat, restaurantLng, customerLat, customerLng, status]);

  return (
    <div className="relative w-full h-[240px] bg-neutral-light border border-neutral-border rounded-3xl overflow-hidden shadow-xs">
      
      {/* Fallback Vector Canvas */}
      {useFallback ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full block bg-slate-50"
        />
      ) : (
        /* Real Google Map Container */
        <div ref={mapRef} className="w-full h-full" />
      )}

      {/* Floating Info Overlay */}
      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-neutral-border/60 shadow-md flex items-center gap-2.5 z-10 text-left">
        <div className="p-2 bg-primary/10 text-primary rounded-xl text-xs">
          <FaMotorcycle />
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-neutral-dark/40 tracking-wider">Transit status</span>
          <span className="text-xs font-extrabold text-neutral-dark capitalize">
            {status === 'dispatched' ? 'Assigned' : status === 'picked_up' ? 'Out for Delivery' : 'Delivered'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Premium dark visual mode styling config for Google Maps API
const mapStylesDark = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b9' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3930' }]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }]
  }
];

export default DeliveryMap;
