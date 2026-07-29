# Maine Lake Depth Contours

**Live (iPhone/PWA):** https://plutocoding.github.io/marineScienceMidterm/

## Desktop (`depth-map.html`)

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

**Offline abstract map:** satellite imagery obviously needs a live
connection. All three builds (desktop, Android, PWA) also bundle a
lightweight vector basemap — the same USGS lake shoreline polygons used to
anchor the contours (~2,600 lakes/ponds, heavily simplified), drawn as filled
shapes on a plain land-colored background instead of imagery. It switches on
automatically if satellite tiles start failing or the browser reports you're
offline, and back off once the connection returns — or toggle it manually
any time. No extra download: it's inlined in the same file as the contour
data.

## Android app (`mobile-app/`)

The same map, redesigned for touch and packaged as a native Android app with
Capacitor — see `mobile-app/README.md` for what's different (no
always-visible panels, an adjustable Contour Detail control, build
instructions) and how to rebuild the APK.

## iPhone (`docs/`)

Apple doesn't allow Android-style APK sideloading, and a true native iOS
build needs Xcode (macOS only) plus a paid Apple Developer account to
install on a physical device — not something buildable from here. Instead,
`docs/` is the same mobile UI packaged as an installable **PWA**: on iPhone,
open it in Safari and use Share → "Add to Home Screen" for a full-screen app
icon with no browser chrome, and a service worker caches the app shell so it
still opens without a connection (the live satellite tiles still need one).

Served via GitHub Pages from this branch's `/docs` folder.
