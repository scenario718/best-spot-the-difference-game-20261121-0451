// A small seeded random number generator: the same seed gives the same scene,
// which is what makes the screenshot scenes repeatable.
export function createRandom(seed) {
  let a = seed | 0;
  return function random() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick `count` different items out of `list`, in seeded order. */
export function pickSome(random, list, count) {
  const pool = list.slice();
  const picked = [];
  while (picked.length < count && pool.length > 0) {
    const index = Math.floor(random() * pool.length);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}
