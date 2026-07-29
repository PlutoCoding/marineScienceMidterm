# Maine Lake Depths (Android)

A mobile build of the Maine Lake Depth Contours map, packaged as a native
Android app with [Capacitor](https://capacitorjs.com). Same underlying data
and contour-reconstruction pipeline as `../depth-map.html` (see the root
`README.md` for how that's built) — this version is a redesigned UI for
touch/mobile:

- No always-visible panels. Just the map, a title pill, a search button, and
  a single settings FAB (bottom-right) that opens a bottom sheet for layers,
  legend, and the detail control.
- **Contour Detail** control (Low / Medium / High) — trades line precision
  and depth-label density for rendering speed, computed client-side (RDP
  line simplification + a minimum-line-length cutoff + label
  density/zoom-threshold), so it can be adjusted live without re-downloading
  data.
- Depth labels sit on the lines themselves (Navionics/LakeVü style),
  rendered lazily per-viewport so it stays smooth with 8,000+ contour lines
  in the underlying dataset.
- **Offline abstract basemap** — a simplified lake-shapes-on-plain-background
  sketch (no imagery) that the app switches to automatically if satellite
  tiles fail to load or the device goes offline, and back once the
  connection returns. Toggle it manually from the Basemap section of the
  settings sheet. The shape data is bundled inline, same as the contours.

## Rebuilding the APK

Requires Node.js, a JDK, and the Android SDK (`platform-tools`,
`platforms;android-34`, `build-tools;34.0.0`).

```
cd mobile-app
npm install
npx cap sync android
cd android
echo "sdk.dir=$ANDROID_HOME" > local.properties
./gradlew assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

The debug APK is signed with the Android debug key, which is fine for
sideloading but not for Play Store distribution — that would need a proper
release keystore and `./gradlew assembleRelease`.

## Updating the map data

`www/index.html` is a single self-contained file (same structure as the
desktop `depth-map.html`, with the lake/contour dataset inlined as
`window.LAKE_DATA`). To pick up new data, regenerate it the same way as the
desktop version and drop it in as `www/index.html`, then re-run
`npx cap sync android` and rebuild.

## Notes

- Needs an internet connection at runtime for the satellite basemap tiles
  and place labels (the contour/depth data itself is bundled in the app).
- Built and tested against the web content in headless Chromium at a mobile
  viewport; not run on a physical device or emulator in this environment (no
  hardware-accelerated virtualization available here). Do a first
  install/tap-through yourself before relying on it.
