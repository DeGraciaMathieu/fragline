import { describe, it, expect, beforeEach } from 'vitest';
import { CFG, BLUE, RED } from '../js/config.js';
import { state, BASE } from '../js/state.js';
import { updateCTF, dropFlag } from '../js/ctf.js';
import { damage } from '../js/entities.js';
import { resetTestMatch, DT } from './helpers.js';

beforeEach(resetTestMatch);

const moveTo=(e,x,y)=>{ e.x=x; e.y=y; };

describe('capture the flag', () => {
  it('an entity standing on the enemy flag picks it up', () => {
    const p=state.player;                       // team BLUE
    moveTo(p, state.flags[RED].x, state.flags[RED].y);
    updateCTF(DT);
    expect(state.flags[RED].state).toBe('carried');
    expect(state.flags[RED].carrier).toBe(p);
    expect(p.carrying).toBe(RED);
  });

  it('the carried flag follows its carrier', () => {
    const p=state.player;
    moveTo(p, state.flags[RED].x, state.flags[RED].y);
    updateCTF(DT);
    moveTo(p, 500, 100);
    updateCTF(DT);
    expect(state.flags[RED].x).toBe(500);
    expect(state.flags[RED].y).toBe(100);
  });

  it('bringing the enemy flag home scores when the own flag is at base', () => {
    const p=state.player;
    moveTo(p, state.flags[RED].x, state.flags[RED].y);
    updateCTF(DT);
    moveTo(p, BASE[BLUE].x, BASE[BLUE].y);
    updateCTF(DT);
    expect(state.score[BLUE]).toBe(1);
    expect(p.carrying).toBeNull();
    expect(state.flags[RED].state).toBe('home');
  });

  it('does NOT score while the own flag is away from base', () => {
    const p=state.player, foe=state.ents[3];    // team RED
    moveTo(p, state.flags[RED].x, state.flags[RED].y);
    moveTo(foe, state.flags[BLUE].x, state.flags[BLUE].y);
    updateCTF(DT);                              // both flags get carried
    moveTo(p, BASE[BLUE].x, BASE[BLUE].y);
    updateCTF(DT);
    expect(state.score[BLUE]).toBe(0);          // own flag is carried, no capture
  });

  it('killing the carrier drops the flag, which returns home after FLAG_RETURN', () => {
    const p=state.player, foe=state.ents[3];
    moveTo(foe, state.flags[BLUE].x, state.flags[BLUE].y);
    updateCTF(DT);
    expect(state.flags[BLUE].carrier).toBe(foe);
    moveTo(foe, 560, 60);                       // die away from any flag spot
    damage(foe, CFG.MAX_HP, p);
    expect(state.flags[BLUE].state).toBe('dropped');
    const ticks=Math.ceil(CFG.FLAG_RETURN/DT)+1;
    for(let i=0;i<ticks;i++) updateCTF(DT);
    expect(state.flags[BLUE].state).toBe('home');
    expect(state.flags[BLUE].x).toBe(state.flags[BLUE].home.x);
  });

  it('a teammate touching the dropped flag returns it home instantly', () => {
    const p=state.player, foe=state.ents[3];
    moveTo(foe, state.flags[BLUE].x, state.flags[BLUE].y);
    updateCTF(DT);
    moveTo(foe, 560, 60);
    dropFlag(foe);
    moveTo(p, 560, 60);
    updateCTF(DT);
    expect(state.flags[BLUE].state).toBe('home');
  });

  it('the WIN-th capture sets state.winner (main.js then ends the game)', () => {
    const p=state.player;
    state.score[BLUE]=CFG.WIN-1;
    moveTo(p, state.flags[RED].x, state.flags[RED].y);
    updateCTF(DT);
    moveTo(p, BASE[BLUE].x, BASE[BLUE].y);
    updateCTF(DT);
    expect(state.score[BLUE]).toBe(CFG.WIN);
    expect(state.winner).toBe(BLUE);
  });
});
