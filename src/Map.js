import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
  "<<TOKEN>>";

export default function Map(props) {
  const map = useRef(null);
  const marker = useRef(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-123.1207, 49.2827], // default to Vancouver
      zoom: 12,
    });

    const el = document.createElement('div');

    el.style.backgroundImage = 'url(resources/car.png)';
    el.className = "marker";
    el.style.transform = `rotate(80deg);`

    marker.current = new mapboxgl.Marker(el)
      .setLngLat([-123.1207, 49.2827])
      .addTo(map.current);

  });

  if (map.current && props.me) {
    // make a marker for each feature and add it to the map
    marker.current.setLngLat([props.me.lng, props.me.lat])

    map.current.setCenter([props.me.lng, props.me.lat])
    map.current.setZoom(15)
  }

  if (map.current && props.target) {
    new mapboxgl.Marker()
    .setLngLat(props.target.center)
    .addTo(map.current);
  }

  let text = null;
  return (
    <div>
      <div className="sidebar">
        {text}
      </div>
      <div id="map" className="map-container" style={{height: 800}} />
    </div>
  );
}
