import React from 'react';

import manifest from '../../plugin.json';

import {START, readableSpec, toTags} from './effects.js';
import {translator} from './i18n.js';
import Picker from './picker.jsx';
import {startRenderer} from './render.js';
import {STYLES} from './styles.js';

function currentLocale(state) {
    const {currentUserId, profiles} = state.entities.users;
    return profiles[currentUserId]?.locale || document.documentElement.lang || 'en';
}

function PaletteIcon() {
    return (
        <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
            <path d='M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z'/>
        </svg>
    );
}

// Rendered by Mattermost in the toolbar of every message box, edit box included.
function EditorButton({draft, getSelectedText, updateText, t, locale}) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);
    const message = draft?.message || '';
    const specs = draft?.props?.text_fx;

    // The edit box gets the stored message, with invisible markers: show the tags instead.
    React.useEffect(() => {
        if (message.includes(START) && Array.isArray(specs)) {
            updateText(toTags(message, specs));
        }
    }, [message, specs, updateText]);

    const close = React.useCallback(() => setOpen(false), []);

    const apply = (spec) => {
        const {start = message.length, end = message.length} = getSelectedText() || {};
        const tag = `{${readableSpec(spec)}}`;
        const selected = message.slice(start, end);
        updateText(`${message.slice(0, start)}${tag}${selected}{/}${message.slice(end)}`);
        setOpen(false);
        // Cursor inside the empty tag, or after the closing one.
        const caret = start + tag.length + (selected ? selected.length + 3 : 0);
        setTimeout(() => {
            const box = ref.current?.closest('.AdvancedTextEditor')?.querySelector('textarea');
            box?.focus();
            box?.setSelectionRange(caret, caret);
        }, 0);
    };

    return (
        <>
            <button
                ref={ref}
                type='button'
                className={`tfx-editor-btn${open ? ' active' : ''}`}
                title={t('button')}
                aria-label={t('button')}
                onClick={() => setOpen(!open)}
            >
                <PaletteIcon/>
            </button>
            {open && (
                <Picker
                    anchor={ref.current}
                    t={t}
                    locale={locale}
                    onApply={apply}
                    onClose={close}
                />
            )}
        </>
    );
}

class Plugin {
    initialize(registry, store) {
        const locale = currentLocale(store.getState());
        const t = translator(locale);

        this.style = document.createElement('style');
        this.style.textContent = STYLES;
        document.head.appendChild(this.style);
        this.stopRenderer = startRenderer(store);

        registry.registerPostEditorActionComponent((props) => (
            <EditorButton
                {...props}
                t={t}
                locale={locale}
            />
        ));
    }

    uninitialize() {
        this.stopRenderer?.();
        this.style?.remove();
    }
}

window.registerPlugin(manifest.id, new Plugin());
