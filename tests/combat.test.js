import { describe, it, expect, beforeEach } from 'vitest';
import { CFG } from '../js/config.js';
import { WEAPONS } from '../js/weapons.js';
import { state } from '../js/state.js';
import { fire, startReload, finishReload, updateProjectiles } from '../js/combat.js';
import { damage } from '../js/entities.js';
import { resetTestMatch } from './helpers.js';

const RAIL=0, RL=3;
// Open ground on the map: mid-height corridor is walled, use the upper lane.
const shooterAt=(e,x,y,aim=0)=>{ e.x=x; e.y=y; e.aim=aim; e.railCd=0; };

beforeEach(resetTestMatch);

describe('hitscan (railgun)', () => {
  it('kills a full-HP enemy in line of sight (100 dmg, pierce)', () => {
    const p=state.player, foe=state.ents[3];
    p.weapon=RAIL; shooterAt(p, 340, 60); shooterAt(foe, 640, 60);
    fire(p);
    expect(foe.alive).toBe(false);
    expect(foe.respawn).toBeCloseTo(CFG.RESPAWN);
    expect(state.feedItems[0].txt).toContain('frag');
  });

  it('is blocked by a wall', () => {
    const p=state.player, foe=state.ents[3];
    // central pillar (x from W/2-60 to W/2+60 at mid height) sits between them
    p.weapon=RAIL; shooterAt(p, 400, CFG.H/2); shooterAt(foe, 720, CFG.H/2);
    fire(p);
    expect(foe.alive).toBe(true);
    expect(foe.hp).toBe(CFG.MAX_HP);
  });

  it('consumes one round per shot and auto-reloads on empty mag', () => {
    const p=state.player; p.weapon=RAIL; shooterAt(p, 340, 60);
    const mag=WEAPONS[RAIL].mag;
    for(let i=0;i<mag;i++){ fire(p); p.railCd=0; }
    expect(p.mags[RAIL]).toBe(0);
    expect(p.reload).toBeGreaterThan(0);   // auto-reload started
  });
});

describe('reload', () => {
  it('startReload/finishReload refill the mag from the reserve for the player', () => {
    const p=state.player; p.weapon=RAIL;
    p.mags[RAIL]=0;
    startReload(p);
    expect(p.reload).toBeCloseTo(WEAPONS[RAIL].reload);
    finishReload(p);
    expect(p.mags[RAIL]).toBe(WEAPONS[RAIL].mag);
    expect(p.reserves[RAIL]).toBe(WEAPONS[RAIL].reserve - WEAPONS[RAIL].mag);
  });

  it('does not reload when the mag is already full', () => {
    const p=state.player; p.weapon=RAIL;
    startReload(p);
    expect(p.reload).toBe(0);
  });
});

describe('rockets', () => {
  it('fire spawns a projectile that explodes and hurts a nearby enemy', () => {
    const p=state.player, foe=state.ents[3];
    p.weapon=RL; shooterAt(p, 340, 60);          // aiming right, upper lane
    shooterAt(foe, 640, 60);
    fire(p);
    expect(state.projectiles.length).toBe(1);
    for(let i=0;i<240 && state.projectiles.length;i++) updateProjectiles(1/60);
    expect(state.projectiles.length).toBe(0);    // exploded (on the foe or a wall)
    expect(foe.hp).toBeLessThan(CFG.MAX_HP);     // took direct or splash damage
  });
});

describe('damage', () => {
  it('kills at 0 HP and sets the player hurt flash when the player is hit', () => {
    const foe=state.ents[3];
    damage(state.player, 10, foe);
    expect(state.hurtFlash).toBe(1);
    damage(foe, CFG.MAX_HP, state.player);
    expect(foe.alive).toBe(false);
  });
});
