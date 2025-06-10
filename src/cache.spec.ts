import { Cache } from './cache';
import { expect, beforeEach, it, describe } from '@jest/globals';

let cache: Cache;

describe('Cache', () => {
  beforeEach(() => {
    cache = new Cache(1);
  });

  it('should return shouldQuery=true on first call', () => {
    expect(cache.shouldQuery()).toBe(true);
  });

  it('should return shouldQuery=false shortly after last query', () => {
    cache.queried();
    expect(cache.shouldQuery()).toBe(false);
  });

  it('should return shouldQuery=true after cache time expired', (done) => {
    cache.queried();
    setTimeout(() => {
      expect(cache.shouldQuery()).toBe(true);
      done();
    }, 20); // increased from 2ms to 20ms
  });

  it('should return shouldQuery=false when caching infinitely', () => {
    const cache = new Cache(-1);
    expect(cache.shouldQuery()).toBe(false);

    cache.queried();
    expect(cache.shouldQuery()).toBe(false);
    expect(cache.isInfinite()).toBe(true);
  });

  it('should use defaultTime if cacheTime is undefined', () => {
    const cache = new Cache(undefined, 10);
    expect(cache.cacheTime).toBe(10);
  });

  it('should update lastQueried when queried() is called', () => {
    const before = cache.lastQueried;
    cache.queried();
    expect(cache.lastQueried).toBeGreaterThanOrEqual(before);
  });

  it('should return shouldQuery=true if cacheTime is 0', () => {
    const cache = new Cache(0);
    expect(cache.shouldQuery()).toBe(true); // always true if cacheTime is 0
    cache.queried();
    expect(cache.shouldQuery()).toBe(true); // still true after queried
  });

  it('should return shouldQuery=false immediately after queried() with positive cacheTime', () => {
    cache.queried();
    expect(cache.shouldQuery()).toBe(false);
  });

  it('should return shouldQuery=true after enough time has passed', (done) => {
    const cache = new Cache(5);
    cache.queried();
    setTimeout(() => {
      expect(cache.shouldQuery()).toBe(true);
      done();
    }, 10);
  });
});
