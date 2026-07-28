To use, download, unzip, and open html file.

## Maine Water Depth Explorer (`depth-map.html`)

An interactive map centered on Maine that overlays live bathymetry / depth-chart
data on satellite imagery. Just open `depth-map.html` in a browser (internet
connection required to load the map tiles and depth data) — no build step or
server needed.

Data layers:
- **Satellite basemap** — Esri World Imagery, with an optional place-labels overlay.
- **NOAA nautical chart depth soundings, contours & depth areas** — pulled live
  from NOAA's Office of Coast Survey "ENC Direct to GIS" web services. The app
  automatically switches between NOAA's five chart scale bands (Overview →
  General → Coastal → Approach → Harbor) as you zoom in, so bays, harbors, and
  river mouths all along the Maine coast show progressively finer depth detail.
- **GEBCO global bathymetric grid** — worldwide color-shaded ocean-floor (and
  lake) elevation data, toggleable as a semi-transparent overlay.
- **Notable Maine lake markers** — reference points with approximate maximum
  depths for lakes such as Sebago, Moosehead, and Rangeley (informational only,
  not surveyed charts).

All layers are pulled live from public NOAA and GEBCO web map services, so the
depth data shown is always current — no data files are bundled with the app.
