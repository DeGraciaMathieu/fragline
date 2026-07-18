import { describe, it, expect, beforeEach } from 'vitest';
import { CFG } from '../js/config.js';
import { state } from '../js/state.js';
import { update } from '../js/update.js';
import { damage } from '../js/entities.js';
import { resetTestMatch, DT } from './helpers.js';

beforeEach(resetTestMatch);

describe('simulation headless (update)', () => {
  it('runs 600 ticks without error and keeps every entity inside the arena', () => {
    for(let t=0;t<600;t++) update(state, DT);
    for(const e of state.ents){
      expect(e.x).toBeGreaterThanOrEqual(CFG.R);
      expect(e.x).toBeLessThanOrEqual(CFG.W-CFG.R);
      expect(e.y).toBeGreaterThanOrEqual(CFG.R);
      expect(e.y).toBeLessThanOrEqual(CFG.H-CFG.R);
    }
  });

  it('a dead entity respawns at its base after RESPAWN seconds', () => {
    const foe=state.ents[3];
    damage(foe, CFG.MAX_HP, state.player);
    expect(foe.alive).toBe(false);
    const ticks=Math.ceil(CFG.RESPAWN/DT)+1;
    for(let t=0;t<ticks;t++) update(state, DT);
    expect(foe.alive).toBe(true);
    expect(foe.hp).toBe(CFG.MAX_HP);
    expect(Math.abs(foe.x-CFG.W+80)).toBeLessThan(40);  // near RED base (W-80)
  });

  it('effects keep decaying even when the game is paused', () => {
    state.beams.push({life:0.2, max:0.4});
    state.shake=10; state.hitFlash=1;
    state.running=false;                        // paused
    for(let t=0;t<120;t++) update(state, DT);
    expect(state.beams.length).toBe(0);
    expect(state.shake).toBe(0);
    expect(state.hitFlash).toBe(0);
  });

  it('gameplay is frozen when paused: no entity moves', () => {
    state.running=false;
    const before=state.ents.map(e=>[e.x,e.y]);
    for(let t=0;t<60;t++) update(state, DT);
    state.ents.forEach((e,i)=>{
      expect(e.x).toBe(before[i][0]);
      expect(e.y).toBe(before[i][1]);
    });
  });

  it('feed entries expire after their lifetime', () => {
    damage(state.ents[3], CFG.MAX_HP, state.player);   // pushes a frag entry
    const entry=state.feedItems[0];
    expect(entry.txt).toContain('frag');
    for(let t=0;t<60*5;t++) update(state, DT);          // feed life is 4.5s
    // bots keep fighting and may push new entries — assert THIS one expired
    expect(state.feedItems.includes(entry)).toBe(false);
  });
});
