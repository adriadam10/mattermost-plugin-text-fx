import {charStyle} from './effects.js';
import {plan} from './plan.js';

const CONTAINERS = '[id^="postMessageText_"], [id^="rhsPostMessageText_"]';
const POST_ID = /_([a-z0-9]{26})$/;

// Text that must not be touched: code, emoji (their text is hidden behind the
// image), LaTeX and what we generated ourselves.
const SKIP = 'code, pre, .emoticon, .katex, .tfx-gen';

// buildFragment turns the pieces of one text node into DOM. Characters that
// move are inline blocks, grouped per word so lines still break between words.
export function buildFragment(pieces) {
    const root = document.createElement('span');
    root.className = 'tfx-gen';
    for (const piece of pieces) {
        if (!piece.chars) {
            root.append(piece.text);
            continue;
        }
        let word = null;
        for (const {ch, fx} of piece.chars) {
            if (/^\s+$/.test(ch)) {
                word = null;
                root.append(ch);
                continue;
            }
            const {block, typewriter, style} = charStyle(fx);
            const span = document.createElement('span');
            span.textContent = ch;
            span.className = `tfx-ch${block ? ' tfx-block' : ''}${typewriter ? ' tfx-tw' : ''}`;
            for (const [prop, value] of Object.entries(style)) {
                span.style.setProperty(prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`), value);
            }
            if (!block) {
                word = null;
                root.append(span);
                continue;
            }
            if (!word) {
                word = document.createElement('span');
                word.className = 'tfx-word';
                root.append(word);
            }
            word.append(span);
        }
    }
    return root;
}

function textNodes(container) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => (node.parentElement?.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    });
    const nodes = [];
    while (walker.nextNode()) {
        nodes.push(walker.currentNode);
    }
    return nodes;
}

// The rendered message belongs to React, so its text nodes are never moved:
// the styled copy goes right before each one and the original is emptied.
// React may later rewrite or remove the original; any change in the container
// undoes everything and renders it again.
export function startRenderer(store) {
    const hidden = new Map(); // container -> [[text node, original text]]
    const pending = new Set();
    let frame = 0;

    const restore = (container) => {
        container.querySelectorAll('.tfx-gen').forEach((el) => el.remove());
        for (const [node, text] of hidden.get(container) || []) {
            if (node.nodeValue === '') {
                node.nodeValue = text;
            }
        }
        hidden.delete(container);
    };

    const render = (container) => {
        restore(container);
        const postId = POST_ID.exec(container.id)?.[1];
        const specs = store.getState().entities.posts.posts[postId]?.props?.text_fx;
        if (!Array.isArray(specs) || !container.textContent.includes('⁠')) {
            return;
        }
        const nodes = textNodes(container);
        const plans = plan(nodes.map((n) => n.nodeValue), specs);
        const done = [];
        nodes.forEach((node, k) => {
            if (!plans[k]) {
                return;
            }
            node.before(buildFragment(plans[k]));
            done.push([node, node.nodeValue]);
            node.nodeValue = '';
        });
        hidden.set(container, done);
    };

    const flush = () => {
        frame = 0;
        for (const container of pending) {
            if (container.isConnected) {
                render(container);
            }
        }
        pending.clear();
        for (const container of hidden.keys()) {
            if (!container.isConnected) {
                hidden.delete(container);
            }
        }
        // Our own changes are not news.
        observer.takeRecords();
    };

    const queue = (container) => {
        pending.add(container);
        frame ||= requestAnimationFrame(flush);
    };

    const observer = new MutationObserver((records) => {
        for (const record of records) {
            const target = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement;
            const container = target?.closest(CONTAINERS);
            if (container) {
                queue(container);
                continue;
            }
            for (const node of record.addedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    continue;
                }
                if (node.matches(CONTAINERS)) {
                    queue(node);
                }
                node.querySelectorAll(CONTAINERS).forEach(queue);
            }
        }
    });
    observer.observe(document.body, {childList: true, subtree: true, characterData: true});
    document.querySelectorAll(CONTAINERS).forEach(queue);

    return () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
        document.querySelectorAll(CONTAINERS).forEach(restore);
    };
}
