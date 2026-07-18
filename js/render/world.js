import { CFG, BLUE, RED, COLS } from '../config.js';
import { WEAPONS } from '../weapons.js';
import { state, BASE } from '../state.js';
import { drawHUD } from './hud.js';

// ---- render -------------------------------------------------------------
export function draw(ctx,cv){
  ctx.save(); ctx.scale(state.scale,state.scale);
  if(state.shake>0.2){ ctx.translate((Math.random()-.5)*state.shake,(Math.random()-.5)*state.shake); }
  // floor
  ctx.fillStyle='#0a0e14'; ctx.fillRect(0,0,CFG.W,CFG.H);
  // grid
  ctx.strokeStyle='rgba(120,150,180,.06)'; ctx.lineWidth=1;
  for(let x=0;x<=CFG.W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CFG.H);ctx.stroke();}
  for(let y=0;y<=CFG.H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CFG.W,y);ctx.stroke();}
  // mid line
  ctx.strokeStyle='rgba(255,255,255,.05)';ctx.setLineDash([8,10]);
  ctx.beginPath();ctx.moveTo(CFG.W/2,0);ctx.lineTo(CFG.W/2,CFG.H);ctx.stroke();ctx.setLineDash([]);
  // base zones
  for(const t of [BLUE,RED]){ const b=BASE[t];
    const g=ctx.createRadialGradient(b.x,b.y,4,b.x,b.y,70);
    g.addColorStop(0,COLS[t]+'55'); g.addColorStop(1,COLS[t]+'00');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(b.x,b.y,70,0,7); ctx.fill();
    ctx.strokeStyle=COLS[t]+'66'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(b.x,b.y,42,0,7); ctx.stroke();
  }
  // walls
  for(const w of state.walls){ ctx.fillStyle='#1a222d';
    ctx.fillRect(w.x,w.y,w.w,w.h);
    ctx.strokeStyle='rgba(120,150,180,.18)';ctx.lineWidth=1;ctx.strokeRect(w.x+.5,w.y+.5,w.w-1,w.h-1); }
  // beams — style per weapon (rail squiggles; others are thin tracers)
  for(const b of state.beams){ const k=b.life/b.max;
    const dx=b.x1-b.x0,dy=b.y1-b.y0,len=Math.hypot(dx,dy)||1;
    const nx=-dy/len,ny=dx/len, segs=Math.max(6,len/12);
    ctx.strokeStyle=b.col; ctx.globalAlpha=0.22*k; ctx.lineWidth=b.glow;
    ctx.beginPath();ctx.moveTo(b.x0,b.y0);ctx.lineTo(b.x1,b.y1);ctx.stroke();
    if(b.sq){ // railgun spiral squiggle
      ctx.globalAlpha=0.9*k; ctx.lineWidth=b.w; ctx.beginPath();
      for(let i=0;i<=segs;i++){ const f=i/segs, amp=6*Math.sin(f*Math.PI);
        const px=b.x0+dx*f+nx*Math.sin(f*len*0.18)*amp, py=b.y0+dy*f+ny*Math.sin(f*len*0.18)*amp;
        i?ctx.lineTo(px,py):ctx.moveTo(px,py); }
      ctx.stroke();
    } else { ctx.globalAlpha=0.85*k; ctx.lineWidth=b.w;
      ctx.beginPath();ctx.moveTo(b.x0,b.y0);ctx.lineTo(b.x1,b.y1);ctx.stroke(); }
    ctx.strokeStyle='#fff';ctx.globalAlpha=k;ctx.lineWidth=b.core;
    ctx.beginPath();ctx.moveTo(b.x0,b.y0);ctx.lineTo(b.x1,b.y1);ctx.stroke();
    ctx.globalAlpha=1;
  }
  // particles (smoke, sparks, explosion rings)
  for(const p of state.particles){ const k=Math.max(0,p.life/(p.maxl||0.5));
    if(p.boom){ ctx.globalAlpha=0.5*k; ctx.strokeStyle=p.col||'#ffb14d'; ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.stroke();
      ctx.globalAlpha=0.18*k; ctx.fillStyle=p.col||'#ffb14d';
      ctx.beginPath();ctx.arc(p.x,p.y,p.r*0.8,0,7);ctx.fill();
    } else { ctx.globalAlpha=k; ctx.fillStyle=p.col;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill(); }
    ctx.globalAlpha=1;
  }
  // projectiles (rockets)
  for(const p of state.projectiles){ const ang=Math.atan2(p.vy,p.vx);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(ang);
    ctx.shadowColor=p.W.color;ctx.shadowBlur=12;
    ctx.fillStyle=p.W.color; ctx.beginPath();
    ctx.moveTo(6,0);ctx.lineTo(-5,3.5);ctx.lineTo(-5,-3.5);ctx.closePath();ctx.fill();
    ctx.shadowBlur=0;ctx.restore();
  }
  // flags
  for(const t of [BLUE,RED]){ const f=state.flags[t];
    if(f.state==='carried')continue; // drawn on carrier
    drawFlag(ctx,f.x,f.y,t,f.state==='home');
  }
  // actors
  for(const e of state.ents){ if(!e.alive)continue; drawActor(ctx,e); }
  // aim line for player
  const player=state.player;
  if(player.alive){ ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1;ctx.setLineDash([4,6]);
    ctx.beginPath();ctx.moveTo(player.x,player.y);
    ctx.lineTo(player.x+Math.cos(player.aim)*60,player.y+Math.sin(player.aim)*60);ctx.stroke();ctx.setLineDash([]); }
  ctx.restore();

  drawHUD(ctx,cv);
}
function drawFlag(ctx,x,y,team,home){
  ctx.save(); ctx.translate(x,y);
  ctx.strokeStyle='#cfd6de';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(0,-22);ctx.stroke();
  ctx.fillStyle=COLS[team]; ctx.globalAlpha=home?0.9:1;
  ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(15,-18);ctx.lineTo(0,-13);ctx.closePath();ctx.fill();
  ctx.globalAlpha=1;
  ctx.shadowColor=COLS[team];ctx.shadowBlur=home?6:14;
  ctx.beginPath();ctx.arc(0,-1,3,0,7);ctx.fillStyle=COLS[team];ctx.fill();ctx.shadowBlur=0;
  ctx.restore();
}
function drawActor(ctx,e){
  const c=COLS[e.team];
  ctx.save(); ctx.translate(e.x,e.y);
  // dash-ready ring
  if(e.dashCd<=0){ ctx.strokeStyle=c+'44';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(0,0,CFG.R+5,0,7);ctx.stroke(); }
  // body
  ctx.beginPath();ctx.arc(0,0,CFG.R,0,7);
  ctx.fillStyle=e.flash>0?'#fff':c; ctx.fill();
  ctx.strokeStyle=e.isPlayer?'#fff':'rgba(0,0,0,.35)';ctx.lineWidth=e.isPlayer?2.5:1.5;ctx.stroke();
  // gun barrel toward aim, tinted by weapon
  ctx.rotate(e.aim);
  const Wc=WEAPONS[e.weapon].color||WEAPONS[e.weapon].beam&&WEAPONS[e.weapon].beam.color||'#e8eef5';
  ctx.fillStyle='#d7dee6'; ctx.fillRect(CFG.R-2,-3,16,6);
  if(e.muzzle>0){ ctx.globalAlpha=e.muzzle/0.05; ctx.fillStyle=Wc;
    ctx.beginPath();ctx.arc(CFG.R+15,0,5,0,7);ctx.fill(); ctx.globalAlpha=1; }
  ctx.restore();
  // carried flag marker
  if(e.carrying!==null){ ctx.save();ctx.translate(e.x,e.y-CFG.R-10);
    ctx.fillStyle=COLS[e.carrying];ctx.shadowColor=COLS[e.carrying];ctx.shadowBlur=10;
    ctx.beginPath();ctx.moveTo(-1,0);ctx.lineTo(-1,-14);ctx.lineTo(11,-11);ctx.lineTo(-1,-8);ctx.closePath();ctx.fill();
    ctx.restore(); }
  // hp pip above (non-player)
  if(!e.isPlayer){ const w=26,h=3,hx=e.x-w/2,hy=e.y-CFG.R-8;
    ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(hx,hy,w,h);
    ctx.fillStyle=c;ctx.fillRect(hx,hy,w*e.hp/CFG.MAX_HP,h); }
}
