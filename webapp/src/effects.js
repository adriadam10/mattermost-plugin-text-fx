// Effect specs as the server stores them: canonical names and #rrggbb colours
// joined by "+", one per category (colour, light, motion).

export const START = '​⁠';
export const END = '⁠​';

export const COLOR_EFFECTS = ['rainbow', 'fire'];
export const LIGHT_EFFECTS = ['glow', 'neon', 'shine'];
export const MOTION_EFFECTS = ['wave', 'bounce', 'shake', 'pulse', 'blink', 'typewriter'];

// Same values as the server, so editing shows {red} rather than {#e53935}.
export const NAMED_COLORS = {
    red: '#e53935',
    orange: '#fb8c00',
    yellow: '#fdd835',
    green: '#43a047',
    cyan: '#00acc1',
    blue: '#1e88e5',
    purple: '#8e24aa',
    pink: '#ec407a',
    brown: '#6d4c41',
    gray: '#9e9e9e',
    black: '#212121',
    white: '#fafafa',
    gold: '#ffb300',
    silver: '#b0bec5',
};
const COLOR_NAMES = Object.fromEntries(Object.entries(NAMED_COLORS).map(([name, hex]) => [hex, name]));

const GRADIENT = /^#[0-9a-f]{6}(?:>#[0-9a-f]{6}){0,3}$/;

// parseSpec returns {color, light, motion} or null if the spec is not canonical
// (props can be forged through the API, so nothing unknown reaches the styles).
export function parseSpec(spec) {
    if (typeof spec !== 'string' || !spec) {
        return null;
    }
    const fx = {color: null, light: null, motion: null};
    for (const token of spec.split('+')) {
        let cat;
        if (COLOR_EFFECTS.includes(token) || GRADIENT.test(token)) {
            cat = 'color';
        } else if (LIGHT_EFFECTS.includes(token)) {
            cat = 'light';
        } else if (MOTION_EFFECTS.includes(token)) {
            cat = 'motion';
        } else {
            return null;
        }
        if (fx[cat]) {
            return null;
        }
        fx[cat] = token;
    }
    return fx;
}

export const readableSpec = (spec) => spec.replace(/#[0-9a-f]{6}/g, (hex) => COLOR_NAMES[hex] || hex);

// toTags turns the markers of a stored message back into the tags it was written with.
export function toTags(message, specs) {
    let next = 0;
    return message.split(/(​⁠|⁠​)/).map((part) => {
        if (part === START) {
            const spec = specs[next++];
            return typeof spec === 'string' ? `{${readableSpec(spec)}}` : '';
        }
        return part === END ? '{/}' : part;
    }).join('');
}

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255];
}

// gradientAt is the colour at t (0..1) along evenly spaced stops.
export function gradientAt(stops, t) {
    if (stops.length === 1) {
        return stops[0];
    }
    const pos = Math.min(Math.max(t, 0), 1) * (stops.length - 1);
    const i = Math.min(Math.floor(pos), stops.length - 2);
    const [a, b] = [hexToRgb(stops[i]), hexToRgb(stops[i + 1])];
    const mix = a.map((v, k) => Math.round(v + ((b[k] - v) * (pos - i))));
    return `rgb(${mix.join(',')})`;
}

// Negative delays start every animation mid-cycle, so nothing sits still at first.
const delay = (seconds) => `${(seconds - 60).toFixed(2)}s`;

// charStyle is the look of one character: each category brings the index of the
// character inside the range that set it (i) and that range's length (n).
export function charStyle({color, light, motion}) {
    const animations = [];
    const style = {};
    let block = false;
    if (color) {
        const {value, i, n} = color;
        if (value === 'rainbow') {
            animations.push(`tfx-rainbow 3s linear ${delay(i * 0.12)} infinite`);
        } else if (value === 'fire') {
            animations.push(`tfx-fire 0.7s ease-in-out ${delay(((i * 7) % 11) * 0.09)} infinite alternate`);
        } else {
            style.color = gradientAt(value.split('>'), n > 1 ? i / (n - 1) : 0);
        }
    }
    if (light) {
        const {value, i} = light;
        if (value === 'glow') {
            animations.push(`tfx-glow 1.6s ease-in-out ${delay(0)} infinite alternate`);
        } else if (value === 'neon') {
            animations.push(`tfx-neon 4s linear ${delay(0)} infinite`);
        } else {
            animations.push(`tfx-shine 2.4s linear ${delay(i * 0.06)} infinite`);
        }
    }
    if (motion) {
        const {value, i, n} = motion;
        block = !['blink', 'typewriter'].includes(value);
        if (value === 'wave') {
            animations.push(`tfx-wave 1.2s ease-in-out ${delay(i * 0.08)} infinite`);
        } else if (value === 'bounce') {
            animations.push(`tfx-bounce 1.1s ease-out ${delay(0)} infinite`);
        } else if (value === 'shake') {
            animations.push(`tfx-shake 0.3s linear ${delay(((i * 5) % 7) * 0.04)} infinite`);
        } else if (value === 'pulse') {
            animations.push(`tfx-pulse 1s ease-in-out ${delay(0)} infinite`);
        } else if (value === 'blink') {
            animations.push(`tfx-blink 1s steps(1) ${delay(0)} infinite`);
        } else {
            // Typing takes 70% of the cycle, then the whole text stays a moment.
            style['--tfx-p'] = ((i / Math.max(n, 1)) * 0.7).toFixed(4);
            animations.push(`tfx-type ${Math.max(2, (n * 0.09) + 1.5).toFixed(2)}s linear infinite`);
        }
    }
    if (animations.length) {
        style.animation = animations.join(', ');
    }
    return {block, typewriter: motion?.value === 'typewriter', style};
}
