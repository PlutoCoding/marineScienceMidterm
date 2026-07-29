To use, download, unzip, and open html file.

## Maine Lake Depth Contours (`depth-map.html`)

An interactive map centered on Maine showing freshwater bathymetric depth
contour lines — lakes and ponds only, no land data — over a live satellite
basemap. Just open `depth-map.html` in a browser (internet connection
required to load the satellite tiles) — no build step or server needed. All
depth data is bundled directly in the file, so the contours themselves work
offline once the page is loaded.

**Data source & pipeline:** Maine's official statewide "LakeDpth" lake-depth
sounding dataset (Maine Office of GIS / Maine DEP, digitized from Maine Dept.
of Inland Fisheries & Wildlife lake survey maps) — roughly 120,000 individual
depth soundings across the state. These were spatially clustered into
individual water bodies, Delaunay-triangulated, and contoured (linear
interpolation + marching-squares-style extraction) into smooth isobath lines
at regular depth intervals. Lake names were attached via point-in-polygon
lookup against the USGS National Hydrography Dataset. The result:
**depth contour lines for 1,500+ Maine lakes and ponds**, color-graduated by
depth, plus a searchable marker for every lake.

Because the contours are reconstructed from scattered official soundings
rather than a re-publication of the original survey cartography, treat them
as a close approximation for reference/educational use — not a navigational
or engineering-grade chart. A few very large lakes (e.g. Sebago, Moosehead)
fall in gaps of the source tiling and aren't currently included.
