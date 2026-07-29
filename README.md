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
depth soundings across the state, combined with real lake shoreline polygons
from the USGS National Hydrography Dataset (large-scale Waterbody layer,
~42,000 Maine lake/pond/reservoir polygons):

1. Every sounding is assigned to its actual lake via point-in-polygon against
   the NHD shoreline — not a distance-based guess — so a lake's soundings
   stay together (and different lakes stay apart) by ground truth, not
   proximity.
2. Each lake's shoreline is resampled and fed back in as synthetic 0 ft
   points, anchoring the interpolation to the lake's real shape instead of
   extrapolating past the sample points.
3. The combined point set (soundings + shoreline) is Delaunay-triangulated,
   every triangle whose centroid falls outside the real polygon is masked
   out, and the rest is contoured (linear interpolation, marching-squares
   extraction) into isobath lines at regular depth intervals.
4. Each line gets a depth label positioned at its midpoint and rotated to
   follow the line, in the style of commercial lake-contour apps
   (Navionics/Garmin LakeVü-type charts) — rendered lazily per-viewport so
   the page stays responsive with thousands of lines in the dataset.

The result: **depth contour lines for 1,638 Maine lakes and ponds**,
color-graduated by depth and numerically labeled, plus a searchable marker
for each one — including large lakes like Sebago, Moosehead, and Rangeley.

Because the contours are reconstructed from scattered official soundings
rather than a re-publication of the original survey cartography, treat them
as a close approximation for reference/educational use — not a navigational
or engineering-grade chart. Water bodies with only a handful of soundings are
skipped rather than rendered as an unreliable shape.

## Android app (`mobile-app/`)

The same map, redesigned for touch and packaged as a native Android app with
Capacitor — see `mobile-app/README.md` for what's different (no
always-visible panels, an adjustable Contour Detail control, build
instructions) and how to rebuild the APK.
