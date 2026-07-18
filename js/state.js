import { CFG, BLUE, RED } from './config.js';
import { WEAPONS } from './weapons.js';

// ---- game state ---------------------------------------------------------
export const state = {
  // monde
  walls: [], flags: {}, ents: [], player: null,
  // effets
  beams: [], projectiles: [], particles: [],
  shake: 0, hitFlash: 0, hurtFlash: 0,
  // partie
  score: {0: 0, 1: 0}, running: false, gameOver: false, winner: null,
  // affichage
  scale: 1,
  // HUD
  feedItems: [], bannerTxt: '', bannerT: 0,
  // input
  keys: {}, mx: CFG.W/2, my: CFG.H/2, mDown: false,
};

// ---- arena: walls / bases / flags --------------------------------------
// walls as rects {x,y,w,h}. Symmetric map (mirror across center X and Y-ish)
function wall(x,y,w,h){ state.walls.push({x,y,w,h}); }
const M=18; // border thickness
wall(0,0,CFG.W,M); wall(0,CFG.H-M,CFG.W,M);          // top / bottom
wall(0,0,M,CFG.H); wall(CFG.W-M,0,M,CFG.H);          // left / right
// central pillar cluster
wall(CFG.W/2-60,CFG.H/2-14,120,28);
wall(CFG.W/2-14,CFG.H/2-90,28,60); wall(CFG.W/2-14,CFG.H/2+30,28,60);
// mirrored cover — designed symmetric left/right so CTF is fair
function coverLR(x,y,w,h){ wall(x,y,w,h); wall(CFG.W-x-w,y,w,h); }
coverLR(250,120,30,150);
coverLR(250,CFG.H-270,30,150);
coverLR(150,CFG.H/2-70,110,26);
coverLR(430,90,26,120);
coverLR(430,CFG.H-210,26,120);

export const BASE={0:{x:80,y:CFG.H/2}, 1:{x:CFG.W-80,y:CFG.H/2}};
state.flags={
  0:{team:0,home:{...BASE[0]},x:BASE[0].x,y:BASE[0].y,state:'home',carrier:null,timer:0},
  1:{team:1,home:{...BASE[1]},x:BASE[1].x,y:BASE[1].y,state:'home',carrier:null,timer:0},
};

// ---- entities -----------------------------------------------------------
export function mkEnt(team,isPlayer,name){
  const e={team,isPlayer,name,x:0,y:0,vx:0,vy:0,aim:0,weapon:0,
    hp:CFG.MAX_HP,alive:true,respawn:0,railCd:0,dashCd:0,carrying:null,
    think:0,flash:0,react:0,muzzle:0,
    mags:WEAPONS.map(W=>W.mag), reserves:WEAPONS.map(W=>W.reserve||0), reload:0, reloadW:0};
  state.ents.push(e); return e;
}
state.player=mkEnt(BLUE,true,'YOU');
mkEnt(BLUE,false,'B-1'); mkEnt(BLUE,false,'B-2');
mkEnt(RED,false,'R-1'); mkEnt(RED,false,'R-2'); mkEnt(RED,false,'R-3');
// bot loadouts — spread the arsenal across both teams
state.ents[1].weapon=1; state.ents[2].weapon=2;            // blue: AR, shotgun
state.ents[3].weapon=1; state.ents[4].weapon=2; state.ents[5].weapon=3; // red: AR, shotgun, rockets
