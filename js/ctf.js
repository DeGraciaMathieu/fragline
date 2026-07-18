import { CFG, BLUE, RED } from './config.js';
import { d2 } from './geometry.js';
import { state, BASE } from './state.js';
import { zap } from './audio.js';
import { feed } from './render/hud.js';

// ---- CTF ----------------------------------------------------------------
export const other=t=>t?BLUE:RED;
export function dropFlag(e){ const f=state.flags[other(e.team)]; if(f.carrier!==e)return;
  f.state='dropped';f.carrier=null;f.timer=CFG.FLAG_RETURN;f.x=e.x;f.y=e.y;e.carrying=null; }
export function updateCTF(dt){
  for(const e of state.ents){ if(!e.alive)continue;
    const ef=state.flags[other(e.team)];
    if((ef.state==='home'||ef.state==='dropped')&&!ef.carrier&&d2(e.x,e.y,ef.x,ef.y)<CFG.GRAB**2){
      ef.state='carried';ef.carrier=e;e.carrying=other(e.team);
      feed(`${e.name} prend le drapeau ${e.team?'BLEU':'ROUGE'}`,e.team);
    }
    const of=state.flags[e.team];
    if(of.state==='dropped'&&d2(e.x,e.y,of.x,of.y)<CFG.GRAB**2){
      of.state='home';of.x=of.home.x;of.y=of.home.y;of.timer=0;
      feed(`${e.name} ramène le drapeau`,e.team);
    }
    if(e.carrying!==null){ const own=state.flags[e.team];
      if(own.state==='home'&&d2(e.x,e.y,BASE[e.team].x,BASE[e.team].y)<CFG.CAPTURE**2){
        state.score[e.team]++; const cf=state.flags[e.carrying];
        cf.state='home';cf.x=cf.home.x;cf.y=cf.home.y;cf.carrier=null;e.carrying=null;
        feed(`${e.name} CAPTURE !`,e.team,true); zap(880,0.25,'sine',0.15);
        if(state.score[e.team]>=CFG.WIN)state.winner=e.team;   // main.js détecte state.winner
      }
    }
  }
  for(const t of [BLUE,RED]){ const f=state.flags[t];
    if(f.state==='dropped'){ f.timer-=dt; if(f.timer<=0){f.state='home';f.x=f.home.x;f.y=f.home.y;} }
    if(f.state==='carried'&&f.carrier){ f.x=f.carrier.x; f.y=f.carrier.y; }
  }
}
