import { CFG } from './config.js';
import { WEAPONS } from './weapons.js';
import { d2, losClear } from './geometry.js';
import { state, BASE } from './state.js';
import { other } from './ctf.js';
import { fire } from './combat.js';
import { move, tryDash } from './movement.js';

// ---- bot AI -------------------------------------------------------------
export function updateBot(e,dt){
  if(!e.alive)return; e.think+=dt;
  // goal
  let gx,gy;
  if(e.carrying!==null){ gx=BASE[e.team].x; gy=BASE[e.team].y; }
  else{ const own=state.flags[e.team];
    if(own.state==='dropped'){ gx=own.x; gy=own.y; }
    else{ const ef=state.flags[other(e.team)]; gx=ef.x; gy=ef.y; } }
  // nearest visible foe
  let foe=null,best=1e12;
  for(const o of state.ents){ if(o.team===e.team||!o.alive)continue;
    const dd=d2(e.x,e.y,o.x,o.y);
    if(dd<CFG.BOT_VIEW**2&&dd<best&&losClear(e.x,e.y,o.x,o.y,state.walls)){best=dd;foe=o;} }
  const W=WEAPONS[e.weapon];
  // aim: turn toward target smoothly (fast strafers can slip the shot)
  const targetAng = foe ? Math.atan2(foe.y-e.y,foe.x-e.x) : Math.atan2(gy-e.y,gx-e.x);
  let da=targetAng-e.aim; while(da>Math.PI)da-=2*Math.PI; while(da<-Math.PI)da+=2*Math.PI;
  e.aim += da*Math.min(1,CFG.BOT_AIM_LERP*dt);
  // reaction + weapon range gating; fire along the (lagging) aim, weapon adds its own spread
  if(foe) e.react+=dt; else e.react=0;
  const inRange = foe && best < (W.botRange*1.3)**2;
  if(foe&&e.railCd<=0&&e.react>=CFG.BOT_REACT&&Math.abs(da)<0.4&&inRange) fire(e);

  // movement
  let wx,wy;
  if(e.carrying!==null){ wx=gx-e.x; wy=gy-e.y; }        // carrier runs home regardless
  else if(foe){                                         // fight at this weapon's ideal range
    const fd=Math.sqrt(best)||1, want=W.botRange;
    const tfx=(foe.x-e.x)/fd, tfy=(foe.y-e.y)/fd;
    const s=(Math.floor(e.think*1.1)%2)?1:-1, sx=-tfy*s, sy=tfx*s;
    const sgn = fd>want+40?1 : fd<want-40?-1 : 0;        // approach / hold / back off
    wx=tfx*sgn + sx*0.85; wy=tfy*sgn + sy*0.85;
  } else { wx=gx-e.x; wy=gy-e.y; }                       // go grab the flag
  const gl=Math.hypot(wx,wy)||1; wx/=gl; wy/=gl;
  const arrived = e.carrying===null && !foe && Math.hypot(gx-e.x,gy-e.y)<CFG.GRAB;
  if(arrived){wx=0;wy=0;}
  else{ // obstacle nudge: if a wall is right ahead, veer 90°
    const ax=e.x+wx*(CFG.R+12),ay=e.y+wy*(CFG.R+12);
    for(const w of state.walls){ if(ax>w.x-CFG.R&&ax<w.x+w.w+CFG.R&&ay>w.y-CFG.R&&ay<w.y+w.h+CFG.R){
      const t=wx; wx=-wy; wy=t; break; } }
  }
  if(e.dashCd<=0&&Math.random()<dt*0.35) tryDash(e,wx,wy);
  move(e,wx,wy,dt);
}
