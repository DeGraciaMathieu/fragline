/* =========================================================================
   RAIL ARENA 2D — top-down CTF prototype (Canvas 2D)
   Point d'assemblage : canvas, boucle de jeu, flux de partie.
   ========================================================================= */

import { CFG, BLUE, RED } from './config.js';
import { state } from './state.js';
import { actx } from './audio.js';
import { initInput } from './input.js';
import { respawn } from './entities.js';
import { update } from './update.js';
import { draw } from './render/world.js';

// ---- canvas / scaling ---------------------------------------------------
const cv=document.getElementById('c'), ctx=cv.getContext('2d');
function fit(){
  const pad=40, availW=innerWidth-pad, availH=innerHeight-pad;
  state.scale=Math.min(availW/CFG.W, availH/CFG.H, 1.4);
  cv.width=CFG.W*state.scale; cv.height=CFG.H*state.scale;
  cv.style.width=cv.width+'px'; cv.style.height=cv.height+'px';
}
addEventListener('resize',fit); fit();
initInput(cv);

// ---- flow ---------------------------------------------------------------
let last=performance.now();
const screen=document.getElementById('screen');
function resetMatch(){ state.score[0]=state.score[1]=0; state.gameOver=false; state.winner=null; state.feedItems=[];
  state.beams.length=0; state.projectiles.length=0; state.particles.length=0; state.shake=0; state.player.weapon=0;
  for(const t of [BLUE,RED]){const f=state.flags[t];f.state='home';f.x=f.home.x;f.y=f.home.y;f.carrier=null;f.timer=0;}
  state.ents.forEach(e=>{e.carrying=null;respawn(e);}); }
function start(){ if(state.gameOver)resetMatch(); actx(); screen.classList.add('hidden'); state.running=true; }
function endGame(team){ state.gameOver=true; state.running=false; state.winner=null;
  screen.querySelector('h1').innerHTML = team===BLUE
    ? '<span class="a">VICTOIRE</span>' : '<span class="b">DÉFAITE</span>';
  document.getElementById('tag').textContent=`BLUE ${state.score[0]} — ${state.score[1]} RED`;
  document.getElementById('cta').textContent='REJOUER';
  screen.classList.remove('hidden'); }
screen.addEventListener('click',start);

function loop(now){ requestAnimationFrame(loop);
  let dt=(now-last)/1000; last=now; if(dt>0.05)dt=0.05;
  update(state,dt);
  if(state.winner!==null) endGame(state.winner);
  draw(ctx,cv);
}
resetMatch(); requestAnimationFrame(loop);
