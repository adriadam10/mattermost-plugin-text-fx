import React from 'react';
import ReactDOM from 'react-dom';

import {COLOR_EFFECTS, END, LIGHT_EFFECTS, MOTION_EFFECTS, NAMED_COLORS, START, readableSpec} from './effects.js';
import {EXAMPLES, language} from './i18n.js';
import {plan} from './plan.js';
import {buildFragment} from './render.js';

const WIDTH = 380;

// Fx shows text with an effect exactly as a posted message would.
export function Fx({text, spec}) {
    const ref = React.useRef(null);
    React.useEffect(() => {
        const [pieces] = plan([START + text + END], [spec]);
        ref.current.replaceChildren(buildFragment(pieces));
    }, [text, spec]);
    return <span ref={ref}/>;
}

const joinSpec = ({color, light, motion}) => [color, light, motion].filter(Boolean).join('+');

function Chips({items, value, onChange, t, sample}) {
    return items.map((name) => (
        <button
            key={name}
            type='button'
            className={`tfx-chip${value === name ? ' active' : ''}`}
            onClick={() => onChange(value === name ? null : name)}
        >
            {sample ? <Fx text={t(name)} spec={name}/> : t(name)}
        </button>
    ));
}

function EffectsTab({t, onApply}) {
    const [fx, setFx] = React.useState({color: 'rainbow', light: null, motion: null});
    const [custom, setCustom] = React.useState('#ff8800');
    const [gradient, setGradient] = React.useState(['#e53935', '#1e88e5']);
    const set = (key) => (value) => setFx({...fx, [key]: value});
    const isGradient = fx.color?.includes('>');
    const spec = joinSpec(fx);

    const setGradientStop = (i, value) => {
        const stops = gradient.map((s, k) => (k === i ? value : s));
        setGradient(stops);
        setFx({...fx, color: stops.join('>')});
    };

    return (
        <div className='tfx-body'>
            <div className='tfx-section'>
                <h5>{t('color')}</h5>
                <div className='tfx-chips'>
                    {Object.entries(NAMED_COLORS).map(([name, hex]) => (
                        <button
                            key={name}
                            type='button'
                            title={name}
                            className={`tfx-swatch${fx.color === hex ? ' active' : ''}`}
                            style={{background: hex}}
                            onClick={() => set('color')(fx.color === hex ? null : hex)}
                        />
                    ))}
                    <label className='tfx-custom'>
                        <input
                            type='color'
                            value={custom}
                            onChange={(e) => {
                                setCustom(e.target.value);
                                set('color')(e.target.value);
                            }}
                        />
                        {t('custom')}
                    </label>
                </div>
                <div className='tfx-chips' style={{marginTop: 6}}>
                    <Chips items={COLOR_EFFECTS} value={fx.color} onChange={set('color')} t={t} sample={true}/>
                    <button
                        type='button'
                        className={`tfx-chip${isGradient ? ' active' : ''}`}
                        onClick={() => set('color')(isGradient ? null : gradient.join('>'))}
                    >
                        <Fx text={t('gradient')} spec={gradient.join('>')}/>
                    </button>
                    {isGradient && gradient.map((stop, i) => (
                        <input
                            key={i}
                            type='color'
                            className='tfx-custom'
                            value={stop}
                            onChange={(e) => setGradientStop(i, e.target.value)}
                        />
                    ))}
                </div>
            </div>
            <div className='tfx-section'>
                <h5>{t('light')}</h5>
                <div className='tfx-chips'>
                    <Chips items={LIGHT_EFFECTS} value={fx.light} onChange={set('light')} t={t}/>
                </div>
            </div>
            <div className='tfx-section'>
                <h5>{t('motion')}</h5>
                <div className='tfx-chips'>
                    <Chips items={MOTION_EFFECTS} value={fx.motion} onChange={set('motion')} t={t}/>
                </div>
            </div>
            <div className='tfx-preview'>
                {spec ? <Fx text={t('sample')} spec={spec}/> : t('sample')}
            </div>
            <div className='tfx-actions'>
                <span className='tfx-tag'>{spec ? `{${readableSpec(spec)}}…{/}` : t('applyHint')}</span>
                <button type='button' className='tfx-apply' disabled={!spec} onClick={() => onApply(spec)}>
                    {t('apply')}
                </button>
            </div>
        </div>
    );
}

function HelpTab({t, locale, onApply}) {
    const lang = language(locale);
    return (
        <div className='tfx-body tfx-help'>
            <p>{t('helpIntro')}</p>
            <table>
                <tbody>
                    {EXAMPLES.map(([spec, desc]) => (
                        <tr key={spec} style={{cursor: 'pointer'}} onClick={() => onApply(spec)}>
                            <td><code>{`{${readableSpec(spec)}}${t('sample')}{/}`}</code></td>
                            <td><Fx text={t('sample')} spec={spec}/></td>
                            <td>{desc[lang]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <ul>{t('helpNotes').map((note) => <li key={note}>{note}</li>)}</ul>
        </div>
    );
}

// Picker is the popover of the editor button, in a portal so the toolbar does not clip it.
export default function Picker({anchor, t, locale, onApply, onClose}) {
    const [tab, setTab] = React.useState('effects');
    const ref = React.useRef(null);
    const rect = anchor.getBoundingClientRect();

    React.useEffect(() => {
        const onDown = (e) => {
            if (!ref.current?.contains(e.target) && !anchor.contains(e.target)) {
                onClose();
            }
        };
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [anchor, onClose]);

    const style = {
        bottom: window.innerHeight - rect.top + 8,
        left: Math.max(8, Math.min(rect.left - (WIDTH / 2), window.innerWidth - WIDTH - 8)),
    };
    return ReactDOM.createPortal(
        <div ref={ref} className='tfx-popover' style={style}>
            <div className='tfx-tabs'>
                {['effects', 'help'].map((name) => (
                    <button key={name} type='button' className={tab === name ? 'active' : ''} onClick={() => setTab(name)}>
                        {t(name)}
                    </button>
                ))}
            </div>
            {tab === 'effects' ? <EffectsTab t={t} onApply={onApply}/> : <HelpTab t={t} locale={locale} onApply={onApply}/>}
        </div>,
        document.body,
    );
}
