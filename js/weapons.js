// ---- weapons ------------------------------------------------------------
// kind: 0 hitscan · 1 pellet (spread of hitscans) · 2 projectile (rocket)
export const HITSCAN=0, PELLET=1, PROJECTILE=2;
export const WEAPONS=[
  { key:'RAIL', name:'RAILGUN', kind:HITSCAN, dmg:100, cd:1.0, botCd:2.0, spread:0,
    pierce:true, auto:false, range:1600, botRange:460, teamColor:true,
    mag:4, reserve:16, reload:1.7,
    beam:{glow:9, w:2, core:1.5, squiggle:true, life:0.42},
    snd:{f:640,d:0.22,t:'sawtooth',v:0.15}, shake:5 },
  { key:'AR', name:"FUSIL D'ASSAUT", kind:HITSCAN, dmg:19, cd:0.10, botCd:0.13, spread:0.055,
    pierce:false, auto:true, range:820, botRange:300,
    mag:30, reserve:120, reload:1.5,
    beam:{glow:4, w:1.4, core:1, squiggle:false, life:0.11, color:'#ffe27f'},
    snd:{f:430,d:0.05,t:'square',v:0.06}, shake:1.4 },
  { key:'SG', name:'FUSIL À POMPE', kind:PELLET, dmg:12, pellets:9, cd:0.72, botCd:1.15, spread:0.30,
    pierce:false, auto:false, range:480, botRange:150,
    mag:8, reserve:32, reload:1.9,
    beam:{glow:3, w:1.4, core:0.8, squiggle:false, life:0.14, color:'#ffcf7a'},
    snd:{f:170,d:0.18,t:'square',v:0.17}, shake:7 },
  { key:'RL', name:'LANCE-ROQUETTES', kind:PROJECTILE, dmg:55, splash:110, splashDmg:48,
    cd:0.95, botCd:1.6, spread:0.012, speed:500, knock:560,
    pierce:false, auto:false, range:1600, botRange:260, color:'#ffb14d',
    mag:3, reserve:9, reload:2.1,
    snd:{f:130,d:0.24,t:'sawtooth',v:0.14}, shake:3, boomShake:13 },
];
