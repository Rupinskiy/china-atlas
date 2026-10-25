# China Atlas v1.7 - Netlify PWA

## Deployment
1. Unzip this file locally. Upload **the contents of the site folder** (`index.html`, `manifest.webmanifest`, `_headers`, `service-worker.js`, `assets/`, `data/`) to your Netlify project's Deploys page via drag-and-drop. The ZIP also contains the folder root; extract it first if your drag-and-drop UI expects a directory.
2. Wait for the deployed HTTPS address. Open it in Chrome on your Pixel 8 Pro.
3. Reload once so the service worker takes control. Tap **Завантажити весь Atlas офлайн**; then turn on Airplane Mode and verify offline access.
4. Chrome menu ⋮ → Add to Home Screen → Install. PWA installation is browser-dependent.
5. Before updating the Atlas in Netlify, export its JSON backup (private, stays on your device). Redeploy the entire new version, not merely index.html.

## Limitations
- "Offline" means cached Atlas HTML, scripts, images and city waypoint files. It does NOT mean detailed offline road maps or live HSR fares; download those in Organic Maps/OsmAnd separately.
- Open-Meteo and the open currency API are external services and may be unreachable on mainland Chinese networks. Atlas shows the last locally saved response and timestamp.
- Personal data and progress are stored in the browser's localStorage; clearing storage removes them. No server-side account synchronization or passport vault exists.
- If you deploy publicly, anyone who knows or discovers the URL can view all published files. Do not store passport, share code, ticket booking reference or other sensitive documents in the deployment.
- This PRIVATE build includes images extracted from commercial guidebooks supplied by the user. Do **not** make the private build publicly accessible; use protected/private Netlify deployment or keep it locally. Copyright on books and images remains with their rights holders. Never rely on obscured URLs or client-side password dialogs as access control.
- PUBLIC_SAFE build omits commercial guidebook imagery and scrubs known personal names from the document but still should be reviewed before any public deployment.

## Online APIs
- Weather: Open-Meteo API, https://open-meteo.com, data licensed CC BY 4.0, approximate CITY center forecast.
- Currency: https://open.er-api.com/v6/latest/GBP, indicative rates, no bank fees.
- Organic Maps waypoint imports: GPX/KML/GeoJSON; WGS84 approximate **CITY CENTERS**, not precise wayfinding for entrances and gates.
- Train/visa/hotel statuses require user verification at the official linked providers. No claim of live availability.

## Update & future sync
The v1.7 site preserves the legacy sections and storage keys from v1.6. A local JSON export/import moves progress between devices or origins. True cross-device automatic sync requires a separate authenticated back-end.

## Attribution / site configuration
The underscore-prefixed files `_headers` and `_redirects` are intentionally included at the site root for Netlify. These do not provide authentication by themselves.
