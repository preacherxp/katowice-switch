# Katowice switch

Contemporary Katowice in a pixel-art day/night switch. The Culture Zone with .KTW towers, NOSPR and Spodek.

[Live demo](https://preacherxp.github.io/katowice-switch/)

The landmarks form a compressed panorama, rather than a literal street view.
No build step or runtime dependencies. Drag through the hours, tap or press
Space to toggle, or use the arrow keys.

## Run and validate

```sh
python3 -m http.server 8000
node test-scene.cjs
```

Open http://localhost:8000. The scene test checks day, dusk, night, dawn,
lighting, the cat interaction and reduced motion. See [AGENTS.md](AGENTS.md)
for actual-browser composition and interaction checks.

## Embed

```html
<script src="city-switch.js"></script>
<script src="katowice.js"></script>
<katowice-switch style="display: block; width: min(680px, 100%);"></katowice-switch>
```

The API exposes `checked`, `position`, and `jump(night)`. `change` supplies
`detail.night`; `scrub` supplies `position`, `hour`, and `dark`.

GitHub Pages serves `/` from `main`.

## Landmark references

- [The .KTW towers](https://ktw.com.pl/en/building/).
- [NOSPR: the building and brick façade](https://nospr.org.pl/pl/o-nas/spacer).
- [Spodek official architecture reference](https://www.spodekkatowice.pl/pl/historia/51/).

## Attribution

The engine is derived from `tokyo-switch.js`; the original idea is “住人のいるスイッチ”
by @Lattice_Node ([original project](https://ludion.ai/p/toggle-daylight), MIT),
as credited in the engine source.
