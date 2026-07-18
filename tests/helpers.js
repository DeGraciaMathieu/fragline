import { BLUE, RED } from '../js/config.js';
import { state } from '../js/state.js';
import { respawn } from '../js/entities.js';

// Mirror of main.js resetMatch, without any DOM access.
// Puts the shared state singleton back to a fresh-match baseline between tests.
export function resetTestMatch(){
  state.score[0]=state.score[1]=0; state.gameOver=false; state.winner=null; state.feedItems=[];
  state.beams.length=0; state.projectiles.length=0; state.particles.length=0; state.shake=0;
  state.hitFlash=0; state.hurtFlash=0; state.mDown=false; state.keys={};
  state.player.weapon=0;
  for(const t of [BLUE,RED]){const f=state.flags[t];f.state='home';f.x=f.home.x;f.y=f.home.y;f.carrier=null;f.timer=0;}
  state.ents.forEach(e=>{e.carrying=null;respawn(e);});
  state.running=true;
}

export const DT = 1/60;

// Advance the simulation n ticks through the public entry point.
export async function tick(n=1){
  const { update } = await import('../js/update.js');
  for(let i=0;i<n;i++) update(state, DT);
}
