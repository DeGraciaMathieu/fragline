import { CFG } from './config.js';
import { WEAPONS } from './weapons.js';
import { state, BASE } from './state.js';
import { zap } from './audio.js';
import { dropFlag } from './ctf.js';
import { feed } from './render/hud.js';

// ---- damage / respawn ---------------------------------------------------
export function damage(e,amt,from){
  if(!e.alive)return; e.hp-=amt; e.flash=1;
  if(e.isPlayer)state.hurtFlash=1;
  if(e.hp<=0){ e.alive=false; e.hp=0; e.respawn=CFG.RESPAWN;
    if(e.carrying!==null)dropFlag(e);
    feed(`${from.name} frag ${e.name}`,from.team);
    zap(150,0.28,'triangle',0.11);
  }
}
export function respawn(e){
  const b=BASE[e.team];
  e.x=b.x+(Math.random()-.5)*40; e.y=b.y+(Math.random()-.5)*120;
  e.vx=e.vy=0; e.hp=CFG.MAX_HP; e.alive=true; e.railCd=e.dashCd=0;
  e.mags=WEAPONS.map(W=>W.mag); e.reserves=WEAPONS.map(W=>W.reserve||0); e.reload=0;
}
