//const book = require("../../models/book");

mapboxgl.accessToken =mapToken;
var map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v11', // style URL
center: book.geometry.coordinates, // starting position [lng, lat]
zoom: 8 // starting zoom
});
map.addControl(new mapboxgl.NavigationControl());
new mapboxgl.Marker()
    .setLngLat(book.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset:25})
        .setHTML(
            `<h3>${book.title}</h3>`
        )
    )
    .addTo(map)