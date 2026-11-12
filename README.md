# Katowice switch

Contemporary Katowice in a pixel-art day/night switch. The Culture Zone with .KTW towers, NOSPR and Spodek.

[Live demo](https://preacherxp.github.io/katowice-switch/) · [60 fps MP4](katowice-day-night-60fps.mp4) · [Instagram 4:5 MP4](katowice-instagram-4x5-60fps.mp4) · [Instagram cover](katowice-instagram-cover.jpg) · Phase covers: [day](katowice-instagram-cover-1-daytime.jpg), [golden hour](katowice-instagram-cover-2-golden-hour.jpg), [signs on](katowice-instagram-cover-3-signs-coming-on.jpg), [night](katowice-instagram-cover-4-night.jpg), [dawn](katowice-instagram-cover-5-dawn.jpg), [morning](katowice-instagram-cover-6-morning.jpg)

The landmarks form a compressed panorama, rather than a literal street view.
No build step or runtime dependencies. Drag through the hours, tap or press
Space to toggle, or use the arrow keys.

## Run and validate

```sh
python3 -m http.server 8000
node test-scene.cjs
```

Open http://localhost:8000. The scene test checks day, dusk, night, dawn,
lighting, the clock, the cat interaction and reduced motion. See [AGENTS.md](AGENTS.md)
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
- [Tramwaje Śląskie fleet](https://www.tram-silesia.pl/o-spolce/wagony-tramwajowe/) and the [Katowice Rondo stop](https://rj.transportgzm.pl/v2/rozklady/przystanek/stop/3695/), for the red tram behind the Spodek.
- [Metrorower launch, Metropolia GZM](https://metropoliagzm.pl/en/2024/02/02/metrorower-rusza-25-lutego/), for the yellow hire bicycle.
- [Żabka Nano locations in Katowice](https://nano.zabka.pl/lokalizacje/katowice/) and a [2024 photograph of the shop in .KTW](https://commons.wikimedia.org/wiki/File:%C5%BBabka_Nano,_Katowice.jpg) (The wub, CC BY-SA 4.0), for the shopfront under the lower tower.
- [Vaillant's office in .KTW II, propertydesign.pl](https://www.propertydesign.pl/design/185/tak_sie_pracuje_w_najwyzszym_budynku_w_katowicach_zagladamy_do_biura_vaillant_w_ktw_ii,49508.html), for the tenant behind the hare on the taller tower. No sign on the real façade was found; the logo is an addition to the collage.
- [The station clock's return in 2019, Super Express](https://www.se.pl/slask/katowice-mieszkancy-odzyskali-dawne-miejsce-spotkan-wrocil-kultowy-zegar-zdjecia-wideo-aa-88Rq-p8dg-1EKc.html), for the amber LED clock. It really hangs on Galeria Katowicka by the station; here it is part of the collage and shows the scene's own time.

[RESEARCH.md](RESEARCH.md) lists the photographs that were opened for the tram, the bicycle, the forecourt trees and flags, the Żabka and the clock, and what could not be verified.

## Attribution

The engine is derived from `tokyo-switch.js`; the original idea is “住人のいるスイッチ”
by @Lattice_Node ([original project](https://ludion.ai/p/toggle-daylight), MIT),
as credited in the engine source.

The MP4 is a seven-second recording of the complete browser-rendered switch at 1600 × 1000 and 60 fps, including the moving glass lens. The Instagram MP4 is the same loop at 1080 × 1350 (4:5), its cover is a still from the night hold, and the six phase covers show the lens at rest at 12:00, 17:00, 18:45, 22:00, 06:00 and 08:30; all keep the whole switch inside the 3:4 profile-grid crop.
