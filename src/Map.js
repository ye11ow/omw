import React, { useRef, useEffect } from "react";
// eslint-disable-next-line import/no-webpack-loader-syntax
import mapboxgl from "!mapbox-gl";

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
    // el.style.transform = `rotate(80deg);`

    marker.current = new mapboxgl.Marker(el)
      .setLngLat([-123.1207, 49.2827])
      .addTo(map.current);

  });

  if (map.current) {
    if (props.driver) {
      // make a marker for each feature and add it to the map
      marker.current
        .setLngLat([props.driver.lng, props.driver.lat])
        .setRotation(props.driver.heading - 180);

      map.current.setCenter([props.driver.lng, props.driver.lat]);
      map.current.setZoom(12);
    }

    if (props.target) {
      new mapboxgl.Marker()
      .setLngLat(props.target.center)
      .addTo(map.current);
    }

    if (props.driver && props.target) {
      const midLng = (props.driver.lng + props.target.center[0]) / 2
      const midLat = (props.driver.lat + props.target.center[1]) / 2

      map.current.setCenter([midLng, midLat])
    }

    if (props.route) {
      const geojson = {
        type: 'Feature',
        properties: {},
        geometry: props.route.geometry
      }

      if (map.current.getSource('route')) {
        map.current.getSource('route').setData(geojson);
      } else {
        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: geojson
          },
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      }
    }

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
