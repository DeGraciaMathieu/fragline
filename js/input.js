import { WEAPONS } from './weapons.js';
import { state } from './state.js';
import { fire, startReload } from './combat.js';

// ---- input --------------------------------------------------------------
export function initInput(cv){
  addEventListener('keydown',e=>{state.keys[e.code]=true;
    if(!state.running)return;
    if(e.code>='Digit1'&&e.code<='Digit4'){ const i=+e.code.slice(5)-1; if(i<WEAPONS.length){state.player.weapon=i; state.player.reload=0;} }
    if(e.code==='KeyR') startReload(state.player);
  });
  addEventListener('keyup',e=>{state.keys[e.code]=false;});
  addEventListener('wheel',e=>{ if(!state.running)return;
    state.player.weapon=(state.player.weapon+(e.deltaY>0?1:WEAPONS.length-1))%WEAPONS.length; state.player.reload=0; },{passive:true});
  cv.addEventListener('mousemove',e=>{
    const r=cv.getBoundingClientRect();
    state.mx=(e.clientX-r.left)/state.scale; state.my=(e.clientY-r.top)/state.scale;
  });
  cv.addEventListener('mousedown',e=>{ if(state.running&&e.button===0){state.mDown=true; fire(state.player);} });
  addEventListener('mouseup',()=>state.mDown=false);
}
