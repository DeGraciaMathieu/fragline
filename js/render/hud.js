import { CFG, COLS, COLD } from '../config.js';
import { WEAPONS } from '../weapons.js';
import { state } from '../state.js';

// ---- HUD feed / banner --------------------------------------------------
export function feed(txt,team,cap){ state.feedItems.unshift({txt,team,cap,life:4.5});
  if(state.feedItems.length>5)state.feedItems.pop(); }
export function banner(t){ state.bannerTxt=t; state.bannerT=2; }

// ---- HUD render ---------------------------------------------------------
export function drawHUD(ctx,cv){
  const w=cv.width,h=cv.height,player=state.player;
  ctx.save();
  ctx.font='700 34px Chakra Petch';ctx.textAlign='center';ctx.textBaseline='middle';
  // score
  ctx.fillStyle=COLS[0]; ctx.textAlign='right'; ctx.fillText(state.score[0], w/2-56, 34);
  ctx.fillStyle=COLS[1]; ctx.textAlign='left';  ctx.fillText(state.score[1], w/2+56, 34);
  ctx.fillStyle='rgba(255,255,255,.35)';ctx.font='600 13px Chakra Petch';ctx.textAlign='center';
  ctx.fillText('CAPTURES', w/2, 34);
  // flag status chips
  chip(ctx,w/2-150,26,0); chip(ctx,w/2+150,26,1);
  // health bottom-left
  const bw=220,bh=16,bx=24,by=h-40;
  ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(bx,by,bw,bh);
  ctx.fillStyle=player.alive?COLS[0]:COLD[0];ctx.fillRect(bx,by,bw*Math.max(0,player.hp)/CFG.MAX_HP,bh);
  ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=1;ctx.strokeRect(bx+.5,by+.5,bw-1,bh-1);
  ctx.fillStyle='#fff';ctx.font='700 12px Chakra Petch';ctx.textAlign='left';ctx.textBaseline='middle';
  ctx.fillText((player.alive?Math.round(player.hp):'—')+' HP', bx+bw+10, by+bh/2);
  // weapon meter (or reload progress) + dash, plus ammo readout
  const Wp=WEAPONS[player.weapon], wi=player.weapon;
  if(player.reload>0)
    meter(ctx,w-24-150,h-58,150,10, 1-player.reload/WEAPONS[player.reloadW].reload, '#ffb14d','RECHARGE…');
  else
    meter(ctx,w-24-150,h-58,150,10, 1-player.railCd/Wp.cd, '#7fd4ff', Wp.name);
  meter(ctx,w-24-150,h-38,150,10,1-player.dashCd/CFG.DASH_CD,'#ffe27f','DASH');
  // ammo: big mag count + reserve, above the meters
  const magN=player.mags[wi], resN=player.reserves[wi];
  ctx.textBaseline='middle';
  ctx.textAlign='right'; ctx.font='700 22px Chakra Petch';
  ctx.fillStyle=magN===0?'#ff6b6b':'#fff'; ctx.fillText(String(magN), w-24-46, h-74);
  ctx.font='600 14px Chakra Petch'; ctx.fillStyle='rgba(255,255,255,.45)';
  ctx.fillText('/ '+resN, w-24, h-74);
  ctx.font='600 10px Chakra Petch'; ctx.fillStyle='rgba(255,255,255,.35)';
  ctx.fillText('CHARGEUR      RÉSERVE', w-24, h-92);
  // weapon slots (bottom-center)
  const sw=64,gap=8, totW=WEAPONS.length*sw+(WEAPONS.length-1)*gap, sx0=w/2-totW/2, sy=h-46;
  ctx.textBaseline='middle';
  WEAPONS.forEach((W,i)=>{ const x=sx0+i*(sw+gap), on=i===player.weapon;
    ctx.fillStyle=on?'rgba(127,212,255,.16)':'rgba(255,255,255,.05)';
    ctx.fillRect(x,sy,sw,32);
    ctx.strokeStyle=on?'#7fd4ff':'rgba(255,255,255,.14)';ctx.lineWidth=on?2:1;
    ctx.strokeRect(x+.5,sy+.5,sw-1,31);
    ctx.fillStyle=on?'#fff':'rgba(255,255,255,.4)';
    ctx.font='700 13px Chakra Petch';ctx.textAlign='left';ctx.fillText((i+1),x+6,sy+11);
    ctx.font='700 12px Chakra Petch';ctx.textAlign='center';ctx.fillText(W.key,x+sw/2+4,sy+11);
    ctx.font='600 10px Chakra Petch';
    const reloading=player.reload>0&&player.reloadW===i;
    ctx.fillStyle=reloading?'#ffb14d':(player.mags[i]===0?'#ff6b6b':(on?'rgba(255,255,255,.65)':'rgba(255,255,255,.3)'));
    ctx.fillText(reloading?'···':(player.mags[i]+'/'+W.mag),x+sw/2+4,sy+23);
  });
  ctx.textBaseline='alphabetic';
  // feed top-left
  ctx.textAlign='left';ctx.font='600 13px Chakra Petch';
  state.feedItems.forEach((f,i)=>{ const a=Math.min(1,f.life/1);
    ctx.globalAlpha=a; ctx.fillStyle=f.cap?'#ffe27f':COLS[f.team];
    ctx.fillRect(20,54+i*22,3,16);
    ctx.fillStyle=f.cap?'#ffe27f':'#dfe8f2'; ctx.fillText(f.txt,30,62+i*22); });
  ctx.globalAlpha=1;
  // respawn / banner center
  if(!player.alive){ ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='700 30px Chakra Petch';
    ctx.fillText('ÉLIMINÉ',w/2,h*0.4);
    ctx.font='600 15px Chakra Petch';ctx.fillStyle='rgba(255,255,255,.7)';
    ctx.fillText('RESPAWN '+player.respawn.toFixed(1),w/2,h*0.4+30); }
  else if(state.bannerT>0){ ctx.textAlign='center';ctx.globalAlpha=Math.min(1,state.bannerT);
    ctx.fillStyle='#ffe27f';ctx.font='700 30px Chakra Petch';ctx.fillText(state.bannerTxt,w/2,h*0.34);ctx.globalAlpha=1; }
  // hit / hurt vignette
  if(state.hitFlash>0){ ctx.strokeStyle=`rgba(255,255,255,${state.hitFlash})`;ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(w/2,h/2,14,0,7);ctx.stroke(); }
  if(state.hurtFlash>0){ const g=ctx.createRadialGradient(w/2,h/2,h*0.3,w/2,h/2,h*0.7);
    g.addColorStop(0,'rgba(255,40,40,0)');g.addColorStop(1,`rgba(255,30,30,${.55*state.hurtFlash})`);
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h); }
  ctx.restore();
}
function chip(ctx,x,y,team){ const f=state.flags[team];
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle=f.state==='home'?COLS[team]:f.state==='carried'?'#ffd24d':'#888';
  ctx.beginPath();ctx.moveTo(-6,-7);ctx.lineTo(8,-4);ctx.lineTo(-6,-1);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.6)';ctx.font='600 10px Chakra Petch';ctx.textAlign='center';
  ctx.fillText(f.state==='home'?'BASE':f.state==='carried'?'PRIS':'LÂCHÉ',0,14);
  ctx.restore();
}
function meter(ctx,x,y,w,h,v,col,label){
  ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(x,y,w,h);
  ctx.fillStyle=col;ctx.fillRect(x,y,w*Math.min(1,Math.max(0,v)),h);
  ctx.strokeStyle='rgba(255,255,255,.15)';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1);
  ctx.fillStyle='rgba(255,255,255,.55)';ctx.font='600 11px Chakra Petch';ctx.textAlign='right';ctx.textBaseline='middle';
  ctx.fillText(label,x-8,y+h/2);
}
