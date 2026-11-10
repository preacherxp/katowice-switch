/* katowice-switch — contemporary landmarks and everyday city life. */
(() => {
  const { PAD_Y, BW, BH, clamp, mix, smooth, rng } = CitySwitch;
  const NOON=0,GOLD=1,DUSK=2,NIGHT=3,DAWN=4;
  let M,N;
  const SKY = [
    ['#568bb4', '#7aaaca', '#a9cadd', '#d1e2e7', '#f2ebd6'],
    ['#7798b5', '#b6b0b5', '#e2b19a', '#f5bc87', '#ffe2ac'],
    ['#293d65', '#545576', '#a07686', '#da9b89', '#f4bd9d'],
    ['#080f22', '#101c34', '#1a2b43', '#2d4052', '#4b5960'],
    ['#425a7e', '#7d8fa3', '#bdadb0', '#e6c7b8', '#f5e4cd'],
  ];
  const palette=({mat,neon})=>{
    mat('TOWER','#6c8794');
    mat('TOWER_D','#3c5666');
    mat('FRAME','#647681');
    mat('WINDOW','#698fa3');
    mat('WINDOW_H','#b7d0d6');
    mat('TRIM','#edf2ea');
    mat('SILVER','#bec8c7');
    mat('SILVER_D','#9baaaa');
    mat('SILVER_L','#e2e5dd');
    mat('HULL','#667c83');
    mat('DISTANT','#aab8bf');
    mat('DISTANT_D','#93a3ad');
    mat('BRICK','#9c4e39');
    mat('BRICK_D','#713a30');
    mat('RED_REVEAL','#cb392d');
    mat('GRASS','#839967');
    mat('GRASS_D','#47694d');
    mat('TREE','#86a95a');
    mat('TREE_D','#557f4b');
    mat('TREE_L','#b3cb74');
    mat('TIMBER_D','#62523d');
    mat('PLANTER','#818d87');
    mat('LEAF','#6c985e');
    mat('STONE','#c8c7b9');
    mat('STONE_D','#9fa9a4');
    mat('WATER','#b6d7db');
    mat('PAVE','#c8ccbf',{[NIGHT]:'#2d3e4a'});
    mat('PAVE_D','#b1b8ae',{[NIGHT]:'#233440'});
    mat('CLOUD','#f3f5ec',{[GOLD]:'#ffe3bd',[DUSK]:'#bc97ab',[NIGHT]:'#304657',[DAWN]:'#d8c8c8'});
    mat('CLOUD_SH','#d6e1de',{[GOLD]:'#e0b79e',[DUSK]:'#8e708b',[NIGHT]:'#243749',[DAWN]:'#b6abb7'});
    neon('LED_SOFT','#f7f4df','#dce9ed',.28);
    neon('OFFICE','#b9d7df','#93c9df',.12);
    neon('EDGE','#e4f4f9','#91d2e7',.24);
    neon('WATER_LIGHT','#c9e5e7','#9cd5dc',.16);
    mat('GLASS_DK','#22313b');
    mat('MINT','#dce8bb');
    mat('SHOP_GREEN','#6fb53f');
    neon('MINT','#e8f3cd','#c4e39a',.2);
    neon('SHOP_GREEN','#8fd14f','#6fc23a',.2);
    mat('BRAND_GREEN','#00917e');
    neon('BRAND','#c3e8cf','#41ba91',.28);
  };
  const grade = [
    ([r, g, b]) => [r, g, b],
    ([r, g, b]) => [r * 1.02 + .03, g * .85 + .02, b * .72],
    ([r, g, b]) => [r * .57 + .035, g * .51 + .025, b * .61 + .04],
    ([r, g, b]) => [r * .22 + .025, g * .26 + .03, b * .36 + .045],
    ([r, g, b]) => [r * .73 + .04, g * .7 + .03, b * .77 + .04],
  ];
  // The young white-stemmed trees of NOSPR's forecourt: a slim pale trunk under a narrow, airy crown
  // that is widest below the middle. Ground spots light the stems after dark.
  const birch = (w, x, base, r) => {
    for (let y = base - 20; y < base; y++) w.px(x, y, (y * 3 + x) % 7 ? M.TRIM : M.TIMBER_D);
    w.lightRect(x, base - 6, 1, 6, N.WARM_DIM, w.venueG);
    for (let j = 0; j < 23; j++) {
      const half = Math.round(.5 + 4.6 * Math.sin(Math.PI * Math.pow(j / 22, 1.4)));
      for (let dx = -half; dx <= half; dx++) {
        const v = r();
        if (Math.abs(dx) === half ? v < .35 : v < .08) continue;
        w.px(x + dx, base - 38 + j, dx + j * .2 > 3.5 || v > .82 ? M.TREE_D : dx < 0 && v < .5 ? M.TREE_L : M.TREE);
      }
    }
  };

  const smoothSky = (w, key, ctx) => {
    const stops = SKY[key].map(ctx.rgb);
    const end = PAD_Y + 106;
    const at = (y) => {
      const p = clamp(Math.pow(clamp(y, 0, BH) / end, 1.25)) * 3.999;
      const lo = Math.floor(p);
      return stops[lo].map((v, i) => mix(v, stops[lo + 1][i], p - lo));
    };
    for (let y = 0; y < BH; y++) {
      w.skyLo[key][y] = ctx.pack(at(y));
      w.skyHi[key][y] = ctx.pack(at(y + 4));
    }
  };

  // The view looks south from the Culture Zone, so the sun crosses from left to right: it climbs out
  // from behind the lower .KTW tower and sinks behind NOSPR. The moon follows it over the Spodek.
  const drawSky = (w, dt, hour) => {
    if (hour < 18.3) {
      const t = clamp((hour - 12) / 6.2), low = smooth(15.8, 17.6, hour);
      w.sun(mix(176, 304, t), mix(12, 70, Math.pow(t, 2.4)), low > .3 ? 6 : 5, low);
    } else if (hour > 29.4) {
      const t = clamp((hour - 29.4) / 6.6), low = 1 - smooth(30.4, 32, hour);
      w.sun(mix(100, 176, t), mix(70, 12, Math.sqrt(t)), low > .3 ? 6 : 5, low);
    }
    const m = (hour - 18.8) / 10.4;
    if (m > 0 && m < 1) w.moon(mix(108, 280, m), mix(62, 68, m) - 44 * Math.sin(m * Math.PI));
    w.drawStars();
    // Fair-weather cumulus with flat bases and lobed tops, carried east (leftwards here) by the westerlies.
    for (const c of w.puffs) {
      c.x -= c.v * dt;
      if (c.x < -c.w - 40) c.x = 370;
      const cx = Math.round(c.x);
      for (let i = 0; i < c.w; i++) {
        const u = i / (c.w - 1);
        const top = Math.round(c.h * Math.sqrt(1 - (2 * u - 1) ** 2) * (.6 + .4 * Math.abs(Math.sin(u * Math.PI * c.lobes))));
        for (let j = 0; j <= top; j++) w.pxSky(cx + i, c.y - j, j === 0 || (j === 1 && u > .55) ? M.CLOUD_SH : M.CLOUD);
      }
    }
  };

  // A red low-floor Tramwaje Śląskie tram on al. Korfantego, far behind the square: it shows under the
  // Spodek's rim, calls at Katowice Rondo in the left gap and turns back out of sight behind NOSPR.
  const drawTram = (w, dt) => {
    const T = w.tram, LEN = 32;
    T.p = (T.p + dt) % 60;
    const q = T.p < 30 ? T.p : 60 - T.p, front = T.p < 30 ? LEN - 1 : 0, on = w.dark > .45;
    const x0 = Math.round(q < 14 ? 15 * q - 86 : 124 + 15 * Math.max(0, q - 19));
    for (let i = 0; i < LEN; i++) {
      const x = x0 + i, joint = i === 10 || i === 21, cab = i === front;
      w.pxBehind(x, 106, joint ? M.SILVER_D : M.BOARD_R);
      for (let y = 107; y < 109; y++) {
        if (joint || i === 0 || i === LEN - 1 || i % 5 === 3) w.pxBehind(x, y, joint ? M.SILVER_D : cab ? M.CAR_DK : M.BOARD_R);
        else w.pxBehind(x, y, M.CAR_DK, on ? N.FLUO : 0, 2);
      }
      w.pxBehind(x, 109, joint ? M.SILVER_D : M.BOARD_R);
      w.pxBehind(x, 110, joint ? M.SILVER_D : M.BOARD_R, on && cab ? N.HEAD : 0, 2);
      w.pxBehind(x, 111, i % 11 > 1 && i % 11 < 7 ? M.TIRE : M.FRAME);
    }
    for (const [dx, y] of [[15, 105], [16, 105], [17, 105], [16, 104], [15, 103], [16, 103], [17, 103]]) w.pxBehind(x0 + dx, y, M.FRAME);
  };

  // A hired Metrorower: yellow step-through frame, yellow fairing over the rear wheel and a front basket.
  const BIKE = ['.......HH....', '.......SS....', '.......JJJ...', '......JJJJ...', '....YS.JJJ...', '.YYYY..LLKK..', '.YYYY...Y....',
    '....Y...YYYY.', '.KKK.Y.Y.YYY.', 'K..YK.YYKYYYK', 'K.K.K...K.K.K', 'K...K...K...K', '.KKK.....KKK.'];
  const drawBike = (w, dt) => {
    const B = w.bike;
    B.x -= 16 * dt;
    if (B.x < -70) B.x = 400;
    const x = Math.round(B.x), y = 135, knee = Math.floor(B.x * .35) & 1;
    w.sprite(BIKE, { H: M.TRIM, S: M.SKIN, J: M.SHIRT_B, L: M.SUIT, K: M.CAR_DK, Y: M.BOARD_Y }, x, y);
    w.rect(x + 6 + knee, y + 6, 1, 2, M.SUIT);
    w.px(x + 6, y + 8, M.SUIT);
    if (w.dark > .3) { w.pxLight(x, y + 6, N.HEAD); w.pxLight(x + 12, y + 8, N.TAIL); }
  };

  const drawSquare = (w) => {
    // Large pale paving slabs, with a darker granite band across the pedestrian square.
    for (let y = 112; y < 150; y++) for (let x = -40; x < 360; x++) {
      const joint = y % 5 === 0 || (x + (Math.floor(y / 5) % 2) * 6) % 12 === 0;
      w.px(x, y, joint ? M.PAVE_D : M.PAVE);
    }
    w.rect(-40, 135, 400, 2, M.STONE_D);
    w.rect(-40, 137, 400, 1, M.PAVE_D);
  };

  // Vaillant mark: a black hare's head facing forward, ears breaking through a green egg outline.
  const HARE = ['..K.GGG.K..', '..KKWWWKK..', '.GKKWWWKKG.', '.GKKWWWKKG.', 'GWWKKWKKWWG', 'GWWKKKKKWWG', 'GWWKWKWKWWG',
    'GWWKKKKKWWG', 'GWKKWKWKKWG', '.GWKKWKKWG.', '.GWWKKKWWG.', '..GGWWWGG..', '....GGG....'];
  const drawKtw = (w) => {
    // The offset glass volumes are the identifying silhouette of .KTW II.
    const blocks = [[35, 77, 43, 36], [40, 44, 43, 33], [34, 12, 43, 32], [91, 55, 34, 58]];
    for (const [x, top, width, height] of blocks) {
      w.rect(x, top, width, height, M.TOWER);
      w.rect(x + width - 4, top, 4, height, M.TOWER_D);
      w.rect(x, top, width, 1, M.FRAME);
      for (let y = top + 3; y < top + height - 1; y += 4) {
        w.rect(x, y, width, 1, M.TOWER_D);
        for (let dx = 3; dx < width - 4; dx += 5) {
          w.rect(x + dx, y - 2, 3, 2, (dx + y) % 3 ? M.WINDOW : M.WINDOW_H);
          if ((dx * 3 + y) % 7 < 3) w.lightRect(x + dx, y - 2, 3, 2, (dx + y) % 2 ? N.OFFICE : N.WARM_DIM, w.winGroups[(dx + y) % 28]);
        }
      }
      for (let dx = 2; dx < width; dx += 5) w.rect(x + dx, top + 1, 1, height - 1, M.FRAME);
    }
    w.hsign(41, 16, 29, 9, '.KTW', { n: N.LED_SOFT, g: w.venueG, board: M.TOWER, off: M.TRIM });
    // Vaillant's IT hub is a tenant of .KTW II (22nd floor). The hare and the name on the middle volume
    // are an addition to the collage; at night the egg is a white lightbox with a green rim.
    HARE.forEach((row, j) => [...row].forEach((c, i) => {
      if (c === 'K') w.px(56 + i, 46 + j, M.PAINT_K);
      else if (c !== '.') w.tube(56 + i, 46 + j, c === 'G' ? M.BRAND_GREEN : M.TRIM, c === 'G' ? N.BRAND : N.LED_SOFT, w.venueG);
    }));
    w.hsign(43, 61, 38, 7, 'VAILLANT', { n: N.BRAND, g: w.venueG, board: M.TOWER_D, off: M.TRIM });
    w.rect(31, 112, 99, 3, M.FRAME);
    for (let x = 42; x < 118; x += 14) {
      w.rect(x, 105, 9, 8, M.WINDOW);
      w.lightRect(x + 1, 106, 7, 6, N.WARM, w.venueG);
    }
    drawZabka(w);
    w.rect(49, 93, 1, 2, M.FRAME); w.rect(63, 93, 1, 2, M.FRAME);
    w.rect(46, 95, 21, 9, M.BOARD_K);
  };
  // Żabka Nano on the ground floor of the lower tower (al. Roździeńskiego 1a), after an August 2024
  // photograph: pale lettering and the smile applied straight to dark glass, a canopy over the door,
  // the entry terminal beside it and a green-walled interior that is lit round the clock.
  const drawZabka = (w) => {
    w.rect(91, 93, 34, 1, M.FRAME);
    w.rect(92, 94, 32, 19, M.GLASS_DK);
    for (const x of [115, 118, 121]) w.rect(x, 95, 1, 10, M.TOWER_D);
    w.hsign(92, 97, 21, 5, 'ZABKA', { n: N.MINT, g: 2, board: M.GLASS_DK, off: M.MINT });
    // The dot of the Ż and the smile under the name.
    for (const [x, y] of [[94, 95], [97, 103], [107, 103]]) w.tube(x, y, M.MINT, N.MINT, 2);
    for (let x = 98; x < 107; x++) w.tube(x, 104, M.MINT, N.MINT, 2);
    w.rect(92, 106, 12, 1, M.FRAME);
    w.rect(94, 107, 7, 6, M.WINDOW);
    w.lightRect(94, 107, 7, 6, N.FLUO, w.store);
    w.rect(97, 107, 1, 6, M.FRAME);
    w.tube(102, 109, M.WINDOW_H, N.OFFICE, w.store);
    w.tube(103, 109, M.WINDOW_H, N.OFFICE, w.store);
    w.rect(105, 106, 18, 2, M.SHOP_GREEN);
    w.lightRect(105, 106, 18, 2, N.SHOP_GREEN, w.store);
    w.rect(105, 108, 18, 5, M.STONE);
    w.lightRect(105, 108, 18, 5, N.STORE, w.store);
    // Shelves of goods stay unlit, so they read as dark rows against the bright shop at night.
    for (let x = 106; x < 122; x++) for (const y of [109, 111]) w.px(x, y, [M.BOARD_R, M.BOARD_Y, M.SHOP_GREEN, M.BOARD_B, M.TRIM][(x * 3 + y) % 5]);
    w.rect(113, 106, 1, 7, M.GLASS_DK);
  };
  // Katowice's old station clock, the "pod zegarem" meeting point: a black box of amber LED digits that
  // has hung on the glass of Galeria Katowicka since 2019. In this collage it hangs on .KTW's glass and
  // keeps the scene's own time.
  const drawClock = (w, hour) => {
    const h = hour % 24, text = String(Math.floor(h)).padStart(2, '0') + String(Math.floor(h % 1 * 60)).padStart(2, '0');
    const lit = (x, y) => { w.px(x, y, M.BOARD_Y); w.pxLight(x, y, N.LED); };
    [48, 52, 58, 62].forEach((x, i) => w.glyph(text[i], x, 97, lit));
    lit(56, 98); lit(56, 100);
  };
  const drawSpodek = (w) => {
    const cx = 184;
    const rim = (dx) => 98 + Math.round(dx * .035);
    // A flat silver saucer with a shallow asymmetric roof and a thick rim, open sky around it.
    for (let dx = -55; dx <= 55; dx++) {
      const curve = Math.sqrt(Math.max(0, 1 - dx * dx / (56 * 56)));
      const roof = 94 - Math.round(curve * 9) + Math.round(dx * .04);
      for (let y = roof; y <= rim(dx); y++) w.px(cx + dx, y, y === roof ? M.SILVER_L : (y + dx) % 5 === 0 ? M.SILVER_D : M.SILVER);
      w.tube(cx + dx, rim(dx), M.TRIM, N.EDGE, w.venueG);
    }
    // The inverted cone narrows from under the rim to the glazed foyer, its ribs converging downwards.
    for (let y = 99; y < 108; y++) {
      const half = 54 - Math.round((y - 99) * 2.4);
      for (let dx = -half; dx <= half; dx++) {
        if (y > rim(dx)) w.px(cx + dx, y, Math.round(dx * 54 / half) % 6 === 0 ? M.SILVER_D : M.HULL);
      }
    }
    w.rect(155, 108, 63, 5, M.WINDOW);
    w.lightRect(157, 109, 59, 3, N.WARM_DIM, w.venueG);
    for (let x = 160; x < 215; x += 6) w.rect(x, 108, 1, 5, M.FRAME);
    w.hsign(169, 100, 34, 7, 'SPODEK', { n: N.LED_SOFT, g: w.venueG, board: M.HULL, off: M.TRIM });
    for (let y = 113; y < 118; y++) w.rect(148 - (y - 113) * 3, y, 77 + (y - 113) * 6, 1, y % 2 ? M.STONE : M.STONE_D);
  };
  const drawNospr = (w) => {
    const x = 251;
    w.rect(x, 64, 109, 49, M.BRICK);
    w.rect(x, 61, 109, 3, M.BRICK_D);
    for (let y = 65; y < 112; y++) for (let dx = 0; dx < 109; dx++) {
      if (y % 3 === 0 && (dx + y) % 7) w.px(x + dx, y, M.BRICK_D);
    }
    // Deep red window reveals between the tall brick piers.
    for (let dx = 5; dx < 107; dx += 9) {
      w.rect(x + dx, 71, 4, 39, M.RED_REVEAL);
      w.rect(x + dx + 1, 72, 2, 37, M.WINDOW);
      w.lightRect(x + dx + 1, 93, 2, 15, N.WARM, w.venueG);
      w.lightRect(x + dx + 1, 73, 2, 15, N.WARM_DIM, w.winGroups[(dx * 5) % 28]);
      w.rect(x + dx, 88, 4, 1, M.BRICK_D);
    }
    w.hsign(266, 66, 38, 8, 'NOSPR', { n: N.LED_SOFT, g: w.venueG, board: M.BRICK_D, off: M.TRIM });
    w.rect(266, 104, 46, 9, M.WINDOW);
    w.lightRect(267, 105, 44, 7, N.WARM, w.venueG);
    for (let dx = 0; dx < 46; dx += 8) w.rect(266 + dx, 104, 1, 9, M.FRAME);
    w.rect(249, 113, 111, 3, M.STONE_D);
  };
  const build = (w, ctx) => {
    M=ctx.M;N=ctx.N;
    for(let key=NOON;key<=DAWN;key++)smoothSky(w,key,ctx);
    w.noSignal=true;w.walkTop=118;w.roadTop=139;
    w.venueG=w.addGroup(17.8,27,'room');
    w.depth=0;
    // Hazy distant blocks fill the gaps beside .KTW; the sky under the Spodek's rim stays open.
    for(let x=-40;x<360;x+=19){
      if(x+18>=122&&x<=250)continue;
      const top=97+Math.abs(x%7);
      w.rect(x,top,18,18,M.DISTANT);
      for(let y=top+2;y<112;y+=3)for(let dx=2;dx<16;dx+=3){
        w.px(x+dx,y,M.DISTANT_D);
        if((x+dx*7+y)%5===0)w.light(x+dx,y,N.WARM_DIM,w.winGroups[(dx+y)%28]);
      }
    }
    w.depth=2;drawSquare(w);drawKtw(w);drawSpodek(w);drawNospr(w);
    for(const x of [-20,15,342]){
      birch(w,x,120,rng(x+400));
      w.rect(x-5,120,11,4,M.PLANTER);w.rect(x-5,120,11,1,M.LEAF);
    }
    // MCK's planted folded roof gives the Culture Zone a green foreground edge.
    for(let x=-40;x<30;x++){
      const y=108+Math.round((x+40)*.12);
      w.rect(x,y,1,119-y,M.GRASS_D);w.px(x,y,M.GRASS);
    }
    // Lamps stand in the open gaps beside .KTW and the Spodek, clear of both silhouettes.
    for(const x of [30,245,325]){w.rect(x,101,1,24,M.FRAME);w.rect(x-3,100,7,1,M.FRAME);w.lightRect(x-2,101,5,1,N.LED_SOFT,w.venueG);}
    // Flagpoles on NOSPR's forecourt stand against its brick piers, below the name.
    for(const x of [262,271,280])w.rect(x,96,1,20,M.SILVER_L);
    // A shallow basin along the .KTW podium, behind every walking lane and clear of the Żabka's window.
    w.rect(46,117,37,2,M.STONE_D);w.rect(48,115,33,2,M.WATER);
    w.puffs=[{x:96,y:40,w:25,h:6,lobes:3,v:.7},{x:214,y:27,w:37,h:8,lobes:4,v:.5},{x:318,y:50,w:17,h:4,lobes:2,v:.9}];
    w.tram={p:6};w.bike={x:300};
    w.cat.x=252;w.cat.y=122;
    // Lanes start at y 125: in front of the basin, planters and lamp bases, above the cycle path.
    // Evening brings a concert crowd: the last four walkers only appear after dark.
    for(const [x,y,dir,speed,style,nightOnly] of [[22,126,1,5,'coat'],[81,125,-1,6,'shirt'],[165,128,1,5,'suit'],[224,127,-1,4,'rust'],[288,129,1,5,'pale'],[130,131,-1,5,'blue'],[250,130,1,4,'coat'],
      [60,131,1,4,'suit',true],[196,129,1,5,'rust',true],[203,129,1,5,'pale',true],[310,130,-1,5,'blue',true]])w.peds.push({x,y,dir,speed,style,nightOnly,phase:x%3});
    Object.assign(w.personStyles,{coat:[M.GRASS_D,M.SUIT,M.HAIR],rust:[M.BRICK,M.SUIT,M.TIMBER_D],pale:[M.SILVER_L,M.TOWER_D,M.HAIR],blue:[M.SHIRT_B,M.FRAME,M.COAT]});
  };
  const draw=(w,dt,hour)=>{
    drawSky(w,dt,hour);drawTram(w,dt);drawClock(w,hour);
    // The plaza jets pulse in front of the podium, behind the walking lanes and away from all signs.
    for(const x of [57,64,71]){
      const height=3+Math.round((Math.sin(w.t*1.6+x)+1)*2.5);
      for(let j=0;j<height;j++)if((j+Math.floor(w.t*12))%4!==0)w.tube(x,115-j,M.WATER,N.WATER_LIGHT,w.venueG);
      w.px(x-1,115-height,M.TRIM);
    }
    // The forecourt flags (Poland, the EU, Poland) stir on their poles.
    for(const x of [262,271,280])for(let j=0;j<6;j++)w.rect(x+1+(j>1?Math.round(Math.sin(w.t*2.6+x+j*.7)*.7):0),96+j,3,1,x===271?M.BOARD_B:j<3?M.SHIRT:M.BOARD_R);
    // The cat dozes behind the lanes, so walkers pass in front of it.
    w.drawCat(dt,hour);w.drawPeople(dt,hour);
    drawBike(w,dt);
  };
  CitySwitch.define('katowice-switch',{
    city:'Katowice',label:'Katowice day and night',tube:['#e9af6c','#64c8e8'],body:['#e4e7e5','#111c2c'],glass:'clear',
    sky:SKY,grade,palette,build,draw,
    glyphs:{W:['#...#','#...#','#.#.#','#.#.#','.#.#.']},
    street:(M)=>[M.PAVE,M.PAVE_D,M.STONE,M.STONE_D],
    weather:(h)=>({wet:.25*smooth(18.5,20,h)*(1-smooth(29,31,h))}),
    post:(w)=>w.reflect(),startle:(w)=>{w.cat.puff=1.4;},
  });
})();
