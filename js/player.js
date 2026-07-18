import { state } from './state.js';
import { move, tryDash } from './movement.js';

// ---- player -------------------------------------------------------------
export function updatePlayer(dt){
  const player=state.player;
  if(!player.alive)return;
  player.aim=Math.atan2(state.my-player.y, state.mx-player.x);
  let wx=0,wy=0;
  if(state.keys['KeyW'])wy-=1; if(state.keys['KeyS'])wy+=1;
  if(state.keys['KeyA'])wx-=1; if(state.keys['KeyD'])wx+=1;
  if((state.keys['Space']||state.keys['ShiftLeft']||state.keys['ShiftRight'])) tryDash(player,wx,wy);
  move(player,wx,wy,dt);
}
