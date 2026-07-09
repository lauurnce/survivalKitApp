import { describe, it, expect } from 'vitest';
import { getAnchor } from './anchors';

describe('getAnchor', () => {
  it('exits right edge for horizontal rightward cable (router)', () => {
    const result = getAnchor({ type: 'router', x: 0, y: 0 }, { x: 100, y: 0 });
    expect(result).toEqual({ x: 36, y: 0 });
  });

  it('exits left edge for horizontal leftward cable (router)', () => {
    const result = getAnchor({ type: 'router', x: 0, y: 0 }, { x: -100, y: 0 });
    expect(result).toEqual({ x: -36, y: 0 });
  });

  it('exits top edge for upward cable (router)', () => {
    const result = getAnchor({ type: 'router', x: 0, y: 0 }, { x: 0, y: -100 });
    expect(result).toEqual({ x: 0, y: -24 });
  });

  it('exits bottom edge for downward cable (router)', () => {
    const result = getAnchor({ type: 'router', x: 0, y: 0 }, { x: 0, y: 100 });
    expect(result).toEqual({ x: 0, y: 24 });
  });

  it('clips to shorter axis for 45° diagonal (router hw=36 hh=24 → hh wins)', () => {
    // dx=100, dy=100 → tx=0.36, ty=0.24 → t=0.24 → anchor at (100*0.24, 100*0.24) = (24,24) offset from node
    const result = getAnchor({ type: 'router', x: 100, y: 100 }, { x: 200, y: 200 });
    expect(result.x).toBeCloseTo(124);
    expect(result.y).toBeCloseTo(124);
  });

  it('works with non-zero node position (pc)', () => {
    const result = getAnchor({ type: 'pc', x: 100, y: 100 }, { x: 300, y: 100 });
    expect(result).toEqual({ x: 137, y: 100 });
  });

  it('returns node center when target equals node', () => {
    const result = getAnchor({ type: 'switch', x: 50, y: 50 }, { x: 50, y: 50 });
    expect(result).toEqual({ x: 50, y: 50 });
  });

  it('exits right edge for horizontal rightward cable (server)', () => {
    const result = getAnchor({ type: 'server', x: 0, y: 0 }, { x: 100, y: 0 });
    expect(result).toEqual({ x: 20, y: 0 });
  });

  it('exits right edge for horizontal rightward cable (laptop)', () => {
    const result = getAnchor({ type: 'laptop', x: 0, y: 0 }, { x: 100, y: 0 });
    expect(result).toEqual({ x: 32, y: 0 });
  });

  it('exits right edge for horizontal rightward cable (hub)', () => {
    const result = getAnchor({ type: 'hub', x: 0, y: 0 }, { x: 100, y: 0 });
    expect(result).toEqual({ x: 40, y: 0 });
  });

  it('exits right edge for horizontal rightward cable (firewall)', () => {
    const result = getAnchor({ type: 'firewall', x: 0, y: 0 }, { x: 100, y: 0 });
    expect(result).toEqual({ x: 30, y: 0 });
  });

  it('exits right edge for horizontal rightward cable (cloud)', () => {
    const result = getAnchor({ type: 'cloud', x: 0, y: 0 }, { x: 100, y: 0 });
    expect(result).toEqual({ x: 42, y: 0 });
  });
});
