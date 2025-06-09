import {Cache} from './cache';

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
    }, 2);
  });

  it('should return shouldQuery=false when caching infinitely', () => {
    const cache = new Cache(-1);
    expect(cache.shouldQuery()).toBe(false);

    cache.queried();
    expect(cache.shouldQuery()).toBe(false);
    expect(cache.isInfinite()).toBe(true);
  });
});
