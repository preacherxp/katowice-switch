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
    mat('BRICK','#9c4e39');
    mat('BRICK_D','#713a30');
    mat('RED_REVEAL','#cb392d');
    mat('GRASS','#839967');
    mat('GRASS_D','#47694d');
    mat('TREE','#4d805c');
    mat('TREE_D','#315d49');
    mat('TREE_L','#79a16a');
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
  };
  const grade = [
    ([r, g, b]) => [r, g, b],
    ([r, g, b]) => [r * 1.02 + .03, g * .85 + .02, b * .72],
    ([r, g, b]) => [r * .57 + .035, g * .51 + .025, b * .61 + .04],
    ([r, g, b]) => [r * .22 + .025, g * .26 + .03, b * .36 + .045],
    ([r, g, b]) => [r * .73 + .04, g * .7 + .03, b * .77 + .04],
  ];
  const line = (x0, y0, x1, y1, cb) => {
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      cb(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = err * 2;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  };
  const tree = (w, cx, cy, rw, rh, r) => {
    for (let y = -rh; y <= rh; y++) {
      for (let x = -rw; x <= rw; x++) {
        const d = (x * x) / (rw * rw) + (y * y) / (rh * rh);
        if (d > 1 + (r() - 0.5) * 0.3) continue;
        const v = r();
        let m = M.TREE;
        if (y > rh * 0.2 || x > rw * 0.4) m = v < 0.7 ? M.TREE_D : M.TREE;
        else if (y < -rh * 0.25 && x < rw * 0.2) m = v < 0.55 ? M.TREE_L : M.TREE;
        else if (v < 0.3) m = M.TREE_D;
        w.px(cx + x, cy + y, m);
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

  const drawSky = (w, dt, hour) => {
    const h = hour;
    if (h < 18.4) {
      const t = clamp((h - 12) / (18.1 - 12));
      const low = smooth(15.6, 17.4, h);
      w.sun(mix(118, 8, t), mix(16, 58, t * t * t), low > 0.3 ? 6 : 5, low);
    } else if (h > 29.2) {
      const t = clamp((h - 29.2) / (36 - 29.2));
      const low = 1 - smooth(30.2, 31.8, h);
      w.sun(mix(304, 118, t), mix(82, 16, Math.sqrt(t)), low > 0.3 ? 6 : 5, low);
    }
    if (h > 18.6 && h < 29.4) w.moon(mix(96, 142, (h - 18.6) / 10.8), mix(30, 18, Math.sin(((h - 18.6) / 10.8) * Math.PI)));
    for (const c of w.strata) {
      c.x += c.v * dt;
      if (c.x > 370) c.x = -c.w - 40;
      const cx = Math.round(c.x);
      for (let i = 0; i < c.w; i++) {
        const edge = Math.min(i, c.w - i);
        const thick = Math.round(Math.min(edge * 0.12, 1.5) + Math.sin(i * 0.17 + c.w) * 0.8 + 0.5);
        for (let j = -thick; j <= 0; j++) {
          if ((i + j * 3 + c.y) % 5 === 0 && edge < 18) continue;
          w.pxSky(cx + i, c.y + j, j === 0 ? M.CLOUD_SH : M.CLOUD);
        }
      }
    }
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
    w.rect(31, 112, 99, 3, M.FRAME);
    for (let x = 42; x < 118; x += 14) {
      w.rect(x, 105, 9, 8, M.WINDOW);
      w.lightRect(x + 1, 106, 7, 6, N.WARM, w.venueG);
    }
  };
  const drawSpodek = (w) => {
    const cx = 184;
    // A low silver saucer and its asymmetric roof, with open sky above the rim.
    for (let dx = -58; dx <= 58; dx++) {
      const curve = Math.sqrt(Math.max(0, 1 - dx * dx / (59 * 59)));
      const roof = 91 - Math.round(curve * 20) + Math.round(dx * .04);
      const rim = 98 + Math.round(dx * .035);
      for (let y = roof; y <= rim; y++) w.px(cx + dx, y, y === roof ? M.SILVER_L : (y + dx) % 5 === 0 ? M.SILVER_D : M.SILVER);
      const bottom = 99 + Math.round(curve * 12);
      for (let y = rim + 1; y < bottom; y++) w.px(cx + dx, y, y % 3 === 0 ? M.SILVER_D : M.HULL);
      w.tube(cx + dx, rim, M.TRIM, N.EDGE, w.venueG);
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
    for(let x=-40;x<360;x+=19)w.rect(x,97+Math.abs(x%7),18,18,M.FAR1);
    w.depth=2;drawSquare(w);drawKtw(w);drawSpodek(w);drawNospr(w);
    for(const x of [-20,15,238,342]){
      w.rect(x,104,1,18,M.TIMBER_D);tree(w,x,99,7,9,rng(x+400));
      w.rect(x-5,120,11,4,M.PLANTER);w.rect(x-5,120,11,1,M.LEAF);
    }
    // MCK's planted folded roof gives the Culture Zone a green foreground edge.
    for(let x=-40;x<30;x++){
      const y=108+Math.round((x+40)*.12);
      w.rect(x,y,1,119-y,M.GRASS_D);w.px(x,y,M.GRASS);
    }
    for(const x of [132,230,325]){w.rect(x,101,1,24,M.FRAME);w.rect(x-3,100,7,1,M.FRAME);w.lightRect(x-2,101,5,1,N.LED_SOFT,w.venueG);}
    w.rect(84,132,37,2,M.STONE_D);w.rect(86,130,33,2,M.WATER);
    w.strata=[{x:-20,y:7,w:62,v:.4},{x:176,y:19,w:70,v:.5}];
    w.cat.x=244;w.cat.y=127;
    for(const [x,y,dir,speed,style] of [[22,126,1,5,'coat'],[81,123,-1,6,'shirt'],[165,127,1,5,'suit'],[224,124,-1,4,'coat'],[288,128,1,5,'shirt']])w.peds.push({x,y,dir,speed,style,phase:x%3});
    w.personStyles.coat=[M.GRASS_D,M.SUIT,M.HAIR];
  };
  const draw=(w,dt,hour)=>{
    drawSky(w,dt,hour);
    // The plaza jets pulse below the landmark silhouettes, away from all signs.
    for(const x of [92,102,112]){
      const height=5+Math.round((Math.sin(w.t*1.6+x)+1)*3);
      for(let j=0;j<height;j++)if((j+Math.floor(w.t*12))%4!==0)w.tube(x,130-j,M.WATER,N.WATER_LIGHT,w.venueG);
      w.px(x-1,130-height,M.TRIM);
    }
    w.drawPeople(dt,hour);w.drawCat(dt,hour);
    const bx=Math.round((w.t*13+60)%420)-50,by=144;
    for(const cx of [bx,bx+12])for(let a=0;a<Math.PI*2;a+=.3)w.px(cx+Math.round(Math.cos(a)*3),by+Math.round(Math.sin(a)*3),M.FRAME);
    for(const [x0,y0,x1,y1] of [[0,0,5,-5],[5,-5,8,0],[8,0,0,0],[5,-5,10,-5],[10,-5,12,0]])line(bx+x0,by+y0,bx+x1,by+y1,(x,y)=>w.px(x,y,M.GRASS_D));
    w.rect(bx+5,by-13,3,3,M.SKIN);w.rect(bx+4,by-10,4,5,M.TOWER_D);
    line(bx+5,by-5,bx+6+Math.floor(w.t*5)%2*2,by-1,(x,y)=>w.px(x,y,M.SUIT));
    line(bx+7,by-8,bx+10,by-6,(x,y)=>w.px(x,y,M.SKIN));
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
