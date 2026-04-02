export function seededRandom(seed) {
  let s = seed
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export function stableShuffle(array, seed) {
  const rng = seededRandom(seed)
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function getSessionSeed() {
  if (typeof sessionStorage !== 'undefined') {
    let seed = sessionStorage.getItem('catalog_seed')
    if (!seed) {
      seed = String(Math.floor(Math.random() * 1e9))
      sessionStorage.setItem('catalog_seed', seed)
    }
    return parseInt(seed, 10)
  }
  return Date.now()
}