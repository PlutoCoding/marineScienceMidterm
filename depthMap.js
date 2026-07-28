// Maine Water Depth Explorer
// Satellite basemap with live nautical-chart bathymetry overlays.

// ---------------------------------------------------------------------
// 1. Base map, centered on Maine
// ---------------------------------------------------------------------
const map = L.map('map', {
    center: [45.2, -69.0],
    zoom: 7,
    minZoom: 4,
    maxZoom: 18
});
window.map = map;

const satellite = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        maxZoom: 19,
        attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics'
    }
).addTo(map);

const placeLabels = L.tileLayer(
    'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    {
        maxZoom: 19,
        attribution: 'Labels &copy; Esri'
    }
).addTo(map);

// ---------------------------------------------------------------------
// 2. NOAA ENC depth data (soundings, depth contours, depth areas)
//    NOAA "ENC Direct to GIS" publishes five scale bands. We swap the
//    underlying WMS service as the user zooms so the right level of
//    chart detail (harbor-scale vs. whole-coast-scale) is always shown.
// ---------------------------------------------------------------------
const ENC_BANDS = [
    { maxZoom: 8,  label: 'Overview', service: 'enc_overview', area: 89,  contour: 56,  sounding: 43 },
    { maxZoom: 10, label: 'General',  service: 'enc_general',  area: 117, contour: 64,  sounding: 50 },
    { maxZoom: 12, label: 'Coastal',  service: 'enc_coastal',  area: 166, contour: 82,  sounding: 61 },
    { maxZoom: 14, label: 'Approach', service: 'enc_approach', area: 232, contour: 108, sounding: 80 },
    { maxZoom: 99, label: 'Harbor',   service: 'enc_harbour',  area: 227, contour: 104, sounding: 76 }
];

function bandForZoom(zoom) {
    return ENC_BANDS.find(b => zoom <= b.maxZoom) || ENC_BANDS[ENC_BANDS.length - 1];
}

const NoaaDepthLayer = L.TileLayer.WMS.extend({
    getTileUrl: function (coords) {
        const zoom = coords.z !== undefined ? coords.z : this._tileZoom;
        const band = bandForZoom(zoom);
        this._url = `https://gis.charttools.noaa.gov/arcgis/services/encdirect/${band.service}/MapServer/WMSServer`;
        this.wmsParams.layers = `${band.area},${band.contour},${band.sounding}`;
        if (window.__currentBand !== band.label) {
            window.__currentBand = band.label;
            const el = document.getElementById('bandLabel');
            if (el) el.textContent = `Chart detail: ${band.label} scale`;
        }
        return L.TileLayer.WMS.prototype.getTileUrl.call(this, coords);
    }
});

const noaaDepths = new NoaaDepthLayer('', {
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    opacity: 0.9,
    maxZoom: 19,
    attribution: 'Depth data &copy; NOAA Office of Coast Survey (ENC Direct to GIS) — not for navigation'
}).addTo(map);

// ---------------------------------------------------------------------
// 3. GEBCO global bathymetric grid (color-shaded ocean + lake depth)
// ---------------------------------------------------------------------
const gebco = L.tileLayer.wms('https://wms.gebco.net/mapserv?', {
    layers: 'GEBCO_LATEST_2',
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    opacity: 0.55,
    maxZoom: 19,
    attribution: 'Bathymetry &copy; GEBCO Compilation Group'
});

// ---------------------------------------------------------------------
// 4. Notable Maine lake depth markers
// ---------------------------------------------------------------------
const lakeLayer = L.layerGroup();

(window.MAINE_LAKES || []).forEach(lake => {
    const marker = L.circleMarker([lake.lat, lake.lng], {
        radius: 7,
        className: 'depth-marker',
        color: '#ffffff',
        weight: 2,
        fillColor: '#0b6cf0',
        fillOpacity: 0.9
    });
    const depthM = Math.round(lake.maxDepthFt * 0.3048);
    marker.bindPopup(
        `<b>${lake.name}</b><br>` +
        `Max depth: ~${lake.maxDepthFt} ft (${depthM} m)<br>` +
        `${lake.note}<br>` +
        `<em>Approximate reference figure — not a surveyed chart.</em>`
    );
    marker.addTo(lakeLayer);
});
lakeLayer.addTo(map);

// ---------------------------------------------------------------------
// 5. Layer control
// ---------------------------------------------------------------------
L.control.layers(
    {
        'Satellite (Esri)': satellite
    },
    {
        'Place labels': placeLabels,
        'NOAA depth soundings & contours': noaaDepths,
        'GEBCO global bathymetry': gebco,
        'Maine lake depth markers': lakeLayer
    },
    { collapsed: false, position: 'topleft' }
).addTo(map);

L.control.scale({ imperial: true, metric: true }).addTo(map);
