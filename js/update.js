import { WEAPONS } from './weapons.js';
import { respawn } from './entities.js';
import { fire, updateProjectiles, updateParticles } from './combat.js';
import { updateCTF } from './ctf.js';
import { updatePlayer } from './player.js';
import { updateBot } from './bot.js';

// ---- simulation step (no DOM / canvas access) ---------------------------
export function update(state,dt){
  if(state.running&&!state.gameOver){
    updatePlayer(dt);
    for(const e of state.ents){ if(!e.alive){e.respawn-=dt; if(e.respawn<=0)respawn(e);} else if(!e.isPlayer)updateBot(e,dt); }
    updateCTF(dt);
    updateProjectiles(dt);
    for(let i=state.feedItems.length-1;i>=0;i--){ state.feedItems[i].life-=dt; if(state.feedItems[i].life<=0)state.feedItems.splice(i,1); }
    if(state.bannerT>0)state.bannerT-=dt;
    if(state.mDown&&WEAPONS[state.player.weapon].auto&&state.player.railCd<=0)fire(state.player); // full-auto hold-to-fire
  }
  // beams/particles/shake keep animating even when paused so effects finish cleanly
  for(let i=state.beams.length-1;i>=0;i--){ state.beams[i].life-=dt; if(state.beams[i].life<=0)state.beams.splice(i,1); }
  updateParticles(dt);
  state.shake=Math.max(0,state.shake-dt*40);
  state.hitFlash=Math.max(0,state.hitFlash-dt*4); state.hurtFlash=Math.max(0,state.hurtFlash-dt*2.5);
}
