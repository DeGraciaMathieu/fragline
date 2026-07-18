import { CFG, COLS } from './config.js';
import { HITSCAN, PELLET, PROJECTILE, WEAPONS } from './weapons.js';
import { rayRect, rayCircle, d2 } from './geometry.js';
import { state } from './state.js';
import { zap } from './audio.js';
import { damage } from './entities.js';

// ---- weapons: firing, beams, projectiles, particles, shake -------------
export function addShake(a){ state.shake=Math.min(18,Math.max(state.shake,a)); }
export function spark(x,y,col,n,spd){ for(let i=0;i<n;i++){ const a=Math.random()*7,s=spd*(0.3+Math.random());
  state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0.25+Math.random()*0.3,col,r:1+Math.random()*1.6}); } }

function hitscan(e,ang,W){
  const dx=Math.cos(ang),dy=Math.sin(ang),maxLen=W.range;
  let best=maxLen, hitWall=false;
  for(const w of state.walls){ const t=rayRect(e.x,e.y,dx,dy,maxLen,w); if(t<best){best=t;hitWall=true;} }
  if(W.pierce){                       // rail: hit everyone along the line up to the wall
    for(const o of state.ents){ if(o===e||!o.alive||o.team===e.team)continue;
      if(rayCircle(e.x,e.y,dx,dy,o.x,o.y,CFG.R)<best){ damage(o,W.dmg,e); if(e.isPlayer)state.hitFlash=1; } }
  } else {                            // single nearest target
    let victim=null;
    for(const o of state.ents){ if(o===e||!o.alive||o.team===e.team)continue;
      const t=rayCircle(e.x,e.y,dx,dy,o.x,o.y,CFG.R); if(t<best){best=t;victim=o;} }
    if(victim){ damage(victim,W.dmg,e); if(e.isPlayer)state.hitFlash=1; }
  }
  const ex=e.x+dx*best, ey=e.y+dy*best;
  const col=W.beam.color||(W.teamColor?COLS[e.team]:'#ffffff');
  state.beams.push({x0:e.x+dx*CFG.R,y0:e.y+dy*CFG.R,x1:ex,y1:ey,col,
    life:W.beam.life,max:W.beam.life,glow:W.beam.glow,w:W.beam.w,core:W.beam.core,sq:W.beam.squiggle});
  if(hitWall) spark(ex,ey,col,4,110);
}

export function startReload(e){
  const wi=e.weapon, W=WEAPONS[wi];
  if(e.reload>0 || e.mags[wi]>=W.mag) return;
  if(e.isPlayer && e.reserves[wi]<=0) return;   // bots have infinite reserve
  e.reload=W.reload; e.reloadW=wi;
  if(e.isPlayer) zap(220,0.08,'square',0.05);
}
export function finishReload(e){
  const wi=e.reloadW, W=WEAPONS[wi];
  if(e.isPlayer){ const take=Math.min(W.mag-e.mags[wi], e.reserves[wi]);
    e.mags[wi]+=take; e.reserves[wi]-=take; }
  else e.mags[wi]=W.mag;
  e.reload=0;
}

export function fire(e,aimOverride){
  if(!e.alive||e.railCd>0||e.reload>0)return;
  const W=WEAPONS[e.weapon];
  if(e.mags[e.weapon]<=0){ startReload(e); return; }   // empty → reload instead of firing
  e.mags[e.weapon]--;
  e.railCd=e.isPlayer?W.cd:W.botCd; e.muzzle=0.05;
  addShake(e.isPlayer?W.shake:W.shake*0.3);
  zap(W.snd.f,W.snd.d,W.snd.t, e.isPlayer?W.snd.v:W.snd.v*0.5);
  const base=aimOverride!==undefined?aimOverride:e.aim;
  if(W.kind===HITSCAN) hitscan(e, base+(Math.random()-.5)*W.spread*2, W);
  else if(W.kind===PELLET){ for(let i=0;i<W.pellets;i++) hitscan(e, base+(Math.random()-.5)*W.spread, W); }
  else if(W.kind===PROJECTILE){ const a=base+(Math.random()-.5)*W.spread*2;
    state.projectiles.push({x:e.x+Math.cos(a)*CFG.R,y:e.y+Math.sin(a)*CFG.R,
      vx:Math.cos(a)*W.speed,vy:Math.sin(a)*W.speed,owner:e,W,life:3,trail:0}); }
  if(e.mags[e.weapon]<=0) startReload(e);   // auto-reload on empty mag
}

function explode(px,py,W,owner){
  addShake(W.boomShake||10);
  for(const o of state.ents){ if(!o.alive)continue;
    const d=Math.hypot(o.x-px,o.y-py);
    if(d<W.splash){ const f=1-d/W.splash;
      if(o.team!==owner.team) damage(o, W.splashDmg*f, owner);
      const a=Math.atan2(o.y-py,o.x-px);            // knockback (incl. self → rocket-jump)
      o.vx+=Math.cos(a)*W.knock*f; o.vy+=Math.sin(a)*W.knock*f; } }
  state.particles.push({boom:true,x:px,y:py,r:6,max:W.splash*0.75,life:0.35,maxl:0.35,col:W.color});
  spark(px,py,'#ffd08a',14,230);
}
export function updateProjectiles(dt){
  for(let i=state.projectiles.length-1;i>=0;i--){ const p=state.projectiles[i];
    p.life-=dt; p.trail+=dt;
    const nx=p.x+p.vx*dt, ny=p.y+p.vy*dt; let hit=false;
    for(const w of state.walls){ if(nx>w.x&&nx<w.x+w.w&&ny>w.y&&ny<w.y+w.h){hit=true;break;} }
    if(!hit) for(const o of state.ents){ if(!o.alive||o.team===p.owner.team)continue;
      if(d2(nx,ny,o.x,o.y)<(CFG.R+4)**2){hit=true;break;} }
    if(p.trail>0.018){ p.trail=0; state.particles.push({x:p.x,y:p.y,vx:0,vy:0,life:0.4,col:'#8a929c',r:2.6}); }
    p.x=nx; p.y=ny;
    if(hit||p.life<=0){ explode(p.x,p.y,p.W,p.owner); state.projectiles.splice(i,1); } }
}
export function updateParticles(dt){
  for(let i=state.particles.length-1;i>=0;i--){ const p=state.particles[i]; p.life-=dt;
    if(p.boom) p.r+=(p.max-p.r)*Math.min(1,dt*11);
    else { p.x+=p.vx*dt; p.y+=p.vy*dt; p.vx*=0.9; p.vy*=0.9; }
    if(p.life<=0) state.particles.splice(i,1); }
}
