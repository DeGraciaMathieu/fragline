import { CFG } from './config.js';
import { circleRect } from './geometry.js';
import { state } from './state.js';
import { zap } from './audio.js';
import { finishReload } from './combat.js';

// ---- collision ----------------------------------------------------------
export function collide(e){
  for(const w of state.walls){ const p=circleRect(e.x,e.y,CFG.R,w);
    if(p){ e.x+=p.px; e.y+=p.py; } }
  e.x=Math.max(CFG.R,Math.min(CFG.W-CFG.R,e.x));
  e.y=Math.max(CFG.R,Math.min(CFG.H-CFG.R,e.y));
}

// ---- movement core (accel/friction) ------------------------------------
export function move(e,wx,wy,dt){
  // friction
  const s=Math.hypot(e.vx,e.vy);
  if(s>0.01){ const ctrl=Math.max(s,CFG.STOP);
    const ns=Math.max(0,s-ctrl*CFG.FRICTION*dt); e.vx*=ns/s; e.vy*=ns/s; }
  else{ e.vx=e.vy=0; }
  // accelerate toward wish dir up to MOVE
  const wl=Math.hypot(wx,wy); if(wl>0){ wx/=wl; wy/=wl;
    const cur=e.vx*wx+e.vy*wy, add=CFG.MOVE-cur;
    if(add>0){ let a=CFG.ACCEL*CFG.MOVE*dt; if(a>add)a=add; e.vx+=wx*a; e.vy+=wy*a; } }
  e.x+=e.vx*dt; e.y+=e.vy*dt; collide(e);
  e.railCd=Math.max(0,e.railCd-dt); e.dashCd=Math.max(0,e.dashCd-dt);
  if(e.muzzle>0)e.muzzle=Math.max(0,e.muzzle-dt);
  if(e.reload>0){ e.reload-=dt; if(e.reload<=0) finishReload(e); }
  if(e.flash>0)e.flash=Math.max(0,e.flash-dt*4);
}
export function tryDash(e,wx,wy){
  if(e.dashCd>0)return;
  let l=Math.hypot(wx,wy);
  if(l<0.01){ wx=Math.cos(e.aim); wy=Math.sin(e.aim); l=1; } // dash toward aim if idle
  e.vx+=wx/l*CFG.DASH; e.vy+=wy/l*CFG.DASH; e.dashCd=CFG.DASH_CD;
  if(e.isPlayer)zap(240,0.13,'square',0.09);
}
