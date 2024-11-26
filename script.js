// Inicializē karti
var map = L.map('map').setView([56.95, 24.1], 10); // Koordinātas un sākotnējais mērogs

// Pievieno kartes slāni
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Definē EPSG:3059 un WGS84
proj4.defs("EPSG:3059","+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=500000 +y_0=-6000000 +ellps=GRS80 +units=m +no_defs");
var EPSG3059 = proj4("EPSG:3059");
var WGS84 = proj4("WGS84");

// Ielādē atpūtas vietu datus no geomap.json
fetch('geomap.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const places = data.features.map(feature => {
            const coords = proj4(EPSG3059, WGS84, feature.geometry.coordinates);
            return {
                name: feature.properties.PLACENAME,
                // "type" apzīmē vietas veidu, "region" apzīmē reģiona kodu
                description: `Type: ${feature.properties.PLACESUBTY}, Region: ${feature.properties.REG_CODE}`,
                latitude: coords[1],
                longitude: coords[0]
            };
        });

        // Pievieno marķierus kartei
        places.forEach(place => {
            var marker = L.marker([place.latitude, place.longitude]).addTo(map);
            marker.bindPopup(`<b>${place.name}</b><br>${place.description}`);
        });

        // Saglabā datus places.json failā
        fetch('places.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ places })
        }).catch(error => console.error('Error saving places:', error));
    })
    .catch(error => console.error('Error loading geomap:', error));