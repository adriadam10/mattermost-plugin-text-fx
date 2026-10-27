// Animations of the effects (effects.js picks them per character) and the picker.
export const STYLES = `
@property --tfx-t { syntax: '<number>'; inherits: false; initial-value: 1; }

.tfx-word { white-space: nowrap; }
.tfx-block { display: inline-block; }
.tfx-tw { opacity: clamp(0, calc((var(--tfx-t) - var(--tfx-p)) * 40), 1); }
/* Mattermost reads links, hashtags and mentions from the clicked element itself. */
a .tfx-gen, [data-hashtag] .tfx-gen, [data-link] .tfx-gen, [data-channel-mention] .tfx-gen,
.mention-link .tfx-gen, a .tfx-gen *, [data-hashtag] .tfx-gen *, [data-link] .tfx-gen *,
[data-channel-mention] .tfx-gen *, .mention-link .tfx-gen * { pointer-events: none; }

@keyframes tfx-rainbow {
    0%, 100% { color: hsl(0 85% 55%); }
    16.6% { color: hsl(40 95% 50%); }
    33.3% { color: hsl(110 70% 42%); }
    50% { color: hsl(185 85% 42%); }
    66.6% { color: hsl(230 85% 60%); }
    83.3% { color: hsl(290 75% 58%); }
}
@keyframes tfx-fire {
    0% { color: #e62e00; }
    50% { color: #ff8f00; }
    100% { color: #ffc400; }
}
@keyframes tfx-glow {
    from { text-shadow: 0 0 1px currentColor; }
    to { text-shadow: 0 0 6px currentColor, 0 0 14px currentColor; }
}
@keyframes tfx-neon {
    0%, 90%, 93%, 96%, 100% { text-shadow: 0 0 2px #fff, 0 0 6px currentColor, 0 0 12px currentColor, 0 0 22px currentColor; }
    91.5%, 94.5% { text-shadow: none; }
}
@keyframes tfx-shine {
    0%, 70%, 100% { filter: none; }
    80% { filter: brightness(1.8) drop-shadow(0 0 3px rgba(255, 255, 255, 0.95)); }
}
@keyframes tfx-wave {
    0%, 50%, 100% { transform: translateY(0); }
    25% { transform: translateY(-0.35em); }
}
@keyframes tfx-bounce {
    0%, 45%, 65%, 100% { transform: translateY(0); }
    25% { transform: translateY(-0.45em); }
    55% { transform: translateY(-0.12em); }
}
@keyframes tfx-shake {
    0%, 100% { transform: translate(0, 0) rotate(0); }
    25% { transform: translate(1px, -1px) rotate(-3deg); }
    50% { transform: translate(-1px, 1px) rotate(2deg); }
    75% { transform: translate(1px, 1px) rotate(-1deg); }
}
@keyframes tfx-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.25); }
}
@keyframes tfx-blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
}
@keyframes tfx-type {
    from { --tfx-t: 0; }
    to { --tfx-t: 1; }
}

.tfx-editor-btn {
    display: flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border: none; border-radius: 4px; background: transparent;
    color: rgba(var(--center-channel-color-rgb), 0.64); cursor: pointer;
}
.tfx-editor-btn:hover, .tfx-editor-btn.active {
    background: rgba(var(--center-channel-color-rgb), 0.08); color: rgba(var(--center-channel-color-rgb), 0.8);
}
.tfx-popover {
    position: fixed; z-index: 1000; width: 380px; max-width: calc(100vw - 16px); max-height: 70vh; overflow: auto;
    background: var(--center-channel-bg); color: var(--center-channel-color);
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16); border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); font-size: 14px;
}
.tfx-tabs { display: flex; border-bottom: 1px solid rgba(var(--center-channel-color-rgb), 0.12); }
.tfx-tabs button {
    flex: 1; padding: 10px; border: none; background: none; color: inherit; font-weight: 600; cursor: pointer;
    border-bottom: 2px solid transparent; opacity: 0.64;
}
.tfx-tabs button.active { border-bottom-color: var(--button-bg); opacity: 1; }
.tfx-body { padding: 12px; }
.tfx-section { margin-bottom: 12px; }
.tfx-section h5 { margin: 0 0 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; opacity: 0.64; }
.tfx-chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.tfx-chip {
    padding: 4px 8px; border: 1px solid rgba(var(--center-channel-color-rgb), 0.16); border-radius: 12px;
    background: none; color: inherit; cursor: pointer; font-weight: 600;
}
.tfx-chip.active { border-color: var(--button-bg); background: rgba(var(--button-bg-rgb), 0.12); }
.tfx-swatch {
    width: 22px; height: 22px; padding: 0; border-radius: 50%; cursor: pointer;
    border: 2px solid rgba(var(--center-channel-color-rgb), 0.16);
}
.tfx-swatch.active { border-color: var(--center-channel-color); box-shadow: 0 0 0 2px var(--center-channel-bg) inset; }
.tfx-custom { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; }
.tfx-custom input[type=color] { width: 28px; height: 24px; padding: 0; border: none; background: none; cursor: pointer; }
.tfx-preview {
    padding: 12px; margin: 4px 0 12px; border-radius: 4px; text-align: center; font-size: 18px; font-weight: 600;
    background: rgba(var(--center-channel-color-rgb), 0.04);
}
.tfx-tag { font-family: monospace; font-size: 12px; opacity: 0.72; word-break: break-all; }
.tfx-actions { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.tfx-apply {
    padding: 8px 16px; border: none; border-radius: 4px; background: var(--button-bg); color: var(--button-color);
    font-weight: 600; cursor: pointer;
}
.tfx-apply:disabled { opacity: 0.4; cursor: default; }
.tfx-help p { margin: 0 0 8px; }
.tfx-help table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
.tfx-help td { padding: 4px 6px; border-bottom: 1px solid rgba(var(--center-channel-color-rgb), 0.08); vertical-align: middle; }
.tfx-help code { font-size: 12px; }
.tfx-help ul { margin: 0; padding-left: 18px; font-size: 13px; }
.tfx-help li { margin-bottom: 4px; }
`;
