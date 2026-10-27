import assert from 'node:assert/strict';
import {test} from 'node:test';

import {END, START, charStyle, gradientAt, parseSpec, toTags} from './effects.js';
import {plan} from './plan.js';

const mark = (s) => s.replaceAll('«', START).replaceAll('»', END);

test('parseSpec accepts only canonical specs', () => {
    assert.deepEqual(parseSpec('rainbow+glow+wave'), {color: 'rainbow', light: 'glow', motion: 'wave'});
    assert.deepEqual(parseSpec('#e53935>#1e88e5'), {color: '#e53935>#1e88e5', light: null, motion: null});
    for (const bad of ['', 'red', '#fff', 'wave+shake', 'x;color:red', null]) {
        assert.equal(parseSpec(bad), null, String(bad));
    }
});

test('toTags restores readable tags', () => {
    assert.equal(toTags(mark('a «b«c»» d'), ['#e53935+glow', 'wave']), 'a {red+glow}b{wave}c{/}{/} d');
});

test('plan crosses nodes and counts per range', () => {
    const out = plan([mark('x «ab'), 'cd', mark('e» y')], ['#e53935>#1e88e5']);
    assert.deepEqual(out[0][0], {text: 'x '});
    const chars = out.flatMap((pieces) => pieces.flatMap((p) => p.chars || []));
    assert.deepEqual(chars.map((c) => c.ch).join(''), 'abcde');
    assert.deepEqual(chars.map((c) => c.fx.color.i), [0, 1, 2, 3, 4]);
    assert.ok(chars.every((c) => c.fx.color.n === 5));
    assert.deepEqual(out[2][1], {text: ' y'});
});

test('plan leaves plain nodes alone and nests ranges', () => {
    const out = plan(['plain', mark('«a«b»»')], ['rainbow', 'shake']);
    assert.equal(out[0], null);
    const [a, b] = out[1][0].chars.concat(out[1][1].chars);
    assert.equal(a.fx.motion, null);
    assert.deepEqual(b.fx.motion, {value: 'shake', i: 0, n: 1});
    assert.equal(b.fx.color.value, 'rainbow');
});

test('gradient ends on its stops', () => {
    assert.equal(gradientAt(['#ff0000', '#0000ff'], 0), 'rgb(255,0,0)');
    assert.equal(gradientAt(['#ff0000', '#0000ff'], 1), 'rgb(0,0,255)');
});

test('charStyle builds the animation list', () => {
    const s = charStyle({color: {value: 'rainbow', i: 0, n: 3}, light: null, motion: {value: 'wave', i: 1, n: 3}});
    assert.ok(s.block);
    assert.match(s.style.animation, /^tfx-rainbow .*, tfx-wave /);
});
