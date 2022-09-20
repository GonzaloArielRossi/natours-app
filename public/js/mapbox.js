export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoiZ29uemFsb2FyaWVscm9zc2kiLCJhIjoiY2w3dzM1YzhqMGNlbDN1bGUzZTUzMjliaCJ9.f2aA06sjV7o-7EMKkondTw';
  // mapboxgl.accessToken = process.env.YOUR_MAPBOX_ACCESS_TOKEN;
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/gonzaloarielrossi/cl7w3oe7e001e14o94im8hwnm',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description} </p>`)
      .addTo(map);
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
