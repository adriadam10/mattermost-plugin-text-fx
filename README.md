# Mattermost Text FX plugin

Coloured and animated text in Mattermost messages: colours, gradients, rainbow, fire, glow, neon, shine, wave, bounce, shake, pulse, blink and typewriter.

```
This is {rainbow+wave}VERY IMPORTANT{/} and {red}this is red{/}
```

- Wrap text in `{effect}text{/}`. Effects combine with `+` (one of each kind: colour, light, motion) and tags can be nested. A tag left open lasts to the end of the message.
- Colours: `red orange yellow green cyan blue purple pink brown gray black white gold silver`, `#rgb` / `#rrggbb`, and gradients like `red>blue` (up to 4 stops). Spanish names work too (`rojo`, `arcoiris`, `ola`, `temblor`…).
- The 🎨 button in the message box toolbar wraps the selected text with an effect picked from a live preview. Its *Help* tab lists every effect with a live example; `/fx` posts the same help (only visible to you) in any channel.
- Editing a message shows its tags again. Tags inside code (`` `…` `` and fenced blocks) are left as they are.
- Anyone writing a message decides its effects; there is no setting to turn them off.

| Kind | Effects |
|---|---|
| Colour | a colour, a gradient, `rainbow`, `fire` |
| Light | `glow`, `neon`, `shine` |
| Motion | `wave`, `bounce`, `shake`, `pulse`, `blink`, `typewriter` |

## How it works

1. When a message is posted or edited, the server part swaps every tag for an
   invisible marker (two zero-width characters) and stores the effect of each
   range in the post props (`text_fx`, canonical names and `#rrggbb` colours).
   So every client, notifications, search and the mobile apps show the clean text.
2. The webapp finds the markers in rendered messages and draws each character
   with its effect (CSS animations). It never moves the text nodes React
   rendered: the styled copy goes before each one and the original is emptied,
   and any change React makes to the message renders it again.
3. Opening a message to edit it turns the markers back into tags. Clients that
   do not do that keep the markers, and the server keeps their effects.

## Limitations

- The native mobile apps do not run webapp plugins: they show the text without
  tags but also without colours or effects.
- Effects do not apply inside code, LaTeX or to custom emoji.
- Messages written before the plugin was installed keep their tags as text.

## Build

```sh
./build.sh   # tests and builds dist/com.github.adriadam10.text-fx-<version>.tar.gz (only needs Docker)
```

Releases are published by CI when a `vX.Y.Z` tag matching `version` in `plugin.json` is pushed.

## Install

System Console → Plugins → Plugin Management → upload the `.tar.gz` from the
latest release, or with `mmctl plugin install-url <release asset URL>`.
Requires Mattermost 12.0 or later.
