import {END, START, parseSpec} from './effects.js';

const segmenter = new Intl.Segmenter(undefined, {granularity: 'grapheme'});
const graphemes = (text) => Array.from(segmenter.segment(text), (s) => s.segment);

// plan splits the text nodes of a message by its markers. Ranges can cross
// nodes (a bold word inside a coloured sentence), so it works on all of them
// at once. It returns, per node, its pieces of text with the effect of each
// character, or null when the node has neither markers nor effects.
export function plan(texts, specs) {
    const ranges = [];
    let opened = 0;
    const stack = [];

    // First pass: how many characters each range has, for gradients and typing.
    const tokens = texts.map((text) => text.split(/(​⁠|⁠​)/));
    for (const parts of tokens) {
        for (const part of parts) {
            if (part === START) {
                const fx = parseSpec(specs[opened++]);
                ranges.push({fx, length: 0});
                stack.push(ranges.length - 1);
            } else if (part === END) {
                stack.pop();
            } else if (part && stack.length) {
                const n = graphemes(part).length;
                stack.forEach((r) => {
                    ranges[r].length += n;
                });
            }
        }
    }

    stack.length = 0;
    const seen = ranges.map(() => 0);
    let next = 0;
    return tokens.map((parts) => {
        if (parts.length === 1 && !stack.length) {
            return null;
        }
        const pieces = [];
        for (const part of parts) {
            if (part === START) {
                stack.push(next++);
            } else if (part === END) {
                stack.pop();
            } else if (part) {
                pieces.push(stack.length ? styledPiece(part, stack, ranges, seen) : {text: part});
            }
        }
        return pieces;
    });
}

// styledPiece gives each character the innermost effect of each category.
function styledPiece(text, stack, ranges, seen) {
    const chars = graphemes(text).map((ch) => {
        const fx = {color: null, light: null, motion: null};
        for (const r of stack) {
            const range = ranges[r];
            for (const cat of Object.keys(fx)) {
                if (range.fx?.[cat]) {
                    fx[cat] = {value: range.fx[cat], i: seen[r], n: range.length};
                }
            }
        }
        stack.forEach((r) => {
            seen[r]++;
        });
        return {ch, fx};
    });
    return {chars};
}
