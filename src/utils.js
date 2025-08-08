// Utility functions for world generation
export function valueNoise2D(x, y) {
  // Simple value noise implementation for terrain generation
  const hash = (a, b) => {
    let h = a * 374761393 + b * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return (h ^ (h >> 16)) & 0x7fffffff;
  };

  const interpolate = (a, b, t) => {
    const ft = t * Math.PI;
    const f = (1 - Math.cos(ft)) * 0.5;
    return a * (1 - f) + b * f;
  };

  const noise = (x, y) => {
    const intX = Math.floor(x);
    const intY = Math.floor(y);
    const fracX = x - intX;
    const fracY = y - intY;

    const a = hash(intX, intY) / 0x7fffffff;
    const b = hash(intX + 1, intY) / 0x7fffffff;
    const c = hash(intX, intY + 1) / 0x7fffffff;
    const d = hash(intX + 1, intY + 1) / 0x7fffffff;

    const i1 = interpolate(a, b, fracX);
    const i2 = interpolate(c, d, fracX);

    return interpolate(i1, i2, fracY);
  };

  return noise(x, y);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function random(min, max) {
  return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Aliases for consistency with existing code
export const rand = random;
export const randInt = randomInt;

export function distance2D(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distance3D(x1, y1, z1, x2, y2, z2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dz = z2 - z1;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function uuid() {
  // Simple UUID generator
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function textSprite(text, parameters = {}) {
  // Create a simple text sprite (returns null for minimal implementation)
  // In a full implementation, this would create a canvas texture with text
  console.log(`Creating text sprite: ${text}`);
  return null;
}

export function format(template, ...args) {
  // Simple string formatting function
  return template.replace(/\{(\d+)\}/g, (match, number) => {
    return typeof args[number] !== 'undefined' ? args[number] : match;
  });
}