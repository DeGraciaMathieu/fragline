import { describe, it, expect } from 'vitest';
import { rayRect, rayCircle, losClear, d2, circleRect } from '../js/geometry.js';

describe('geometry', () => {
  it('rayRect returns the entry distance when the ray hits the rect', () => {
    const t = rayRect(0, 5, 1, 0, 100, {x:10, y:0, w:10, h:10});
    expect(t).toBe(10);
  });

  it('rayRect returns Infinity when the ray misses', () => {
    expect(rayRect(0, 50, 1, 0, 100, {x:10, y:0, w:10, h:10})).toBe(Infinity);
  });

  it('rayCircle hits a circle straight ahead and misses one off-axis', () => {
    expect(rayCircle(0, 0, 1, 0, 50, 0, 10)).toBeCloseTo(40);
    expect(rayCircle(0, 0, 1, 0, 50, 100, 10)).toBe(Infinity);
  });

  it('losClear detects a blocking wall between two points', () => {
    const walls = [{x:40, y:-50, w:20, h:100}];
    expect(losClear(0, 0, 100, 0, walls)).toBe(false);
    expect(losClear(0, 200, 100, 200, walls)).toBe(true);
  });

  it('d2 returns the squared distance', () => {
    expect(d2(0, 0, 3, 4)).toBe(25);
  });

  it('circleRect pushes a penetrating circle out of the rect', () => {
    const p = circleRect(9, 50, 5, {x:10, y:0, w:100, h:100});
    expect(p).not.toBeNull();
    expect(p.px).toBeLessThan(0); // pushed left, away from the rect
  });
});
