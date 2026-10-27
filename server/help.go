package main

import (
	"fmt"
	"strings"
)

// Every example is shown as code (left as typed) and then as plain text, which
// goes through encode like any message, so the help shows the effects live.
var examples = []struct{ tag, es, en string }{
	{"red", "color fijo", "solid colour"},
	{"#ff8800", "color hexadecimal", "hex colour"},
	{"red>blue", "degradado (hasta 4 colores)", "gradient (up to 4 colours)"},
	{"rainbow", "arcoíris animado", "animated rainbow"},
	{"fire", "fuego", "fire"},
	{"blue+glow", "brillo que respira", "breathing glow"},
	{"pink+neon", "neón que parpadea", "flickering neon"},
	{"gold+shine", "destello que recorre el texto", "a shine sweeping the text"},
	{"wave", "ola", "wave"},
	{"bounce", "rebote", "bounce"},
	{"shake", "temblor", "shake"},
	{"pulse", "latido", "pulse"},
	{"blink", "parpadeo", "blink"},
	{"typewriter", "máquina de escribir", "typewriter"},
	{"rainbow+wave", "combinados con +", "combined with +"},
}

var helpStrings = map[string][]string{
	"es": {
		"#### Texto con colores y efectos",
		"Envuelve el texto en una etiqueta: `{efecto}texto{/}`. También con el botón 🎨 de la caja de mensaje: selecciona el texto y elige el efecto.",
		"| Escribes | Se ve | |",
		"- Un efecto de cada tipo por trozo: **color** (color, degradado, `rainbow`, `fire`), **luz** (`glow`, `neon`, `shine`) y **movimiento** (el resto). Se combinan con `+` y se pueden anidar: `{red}rojo y {wave}ola{/}{/}`.\n" +
			"- Colores: `red orange yellow green cyan blue purple pink brown gray black white gold silver`, en castellano (`rojo`, `azul`…) o `#rgb`/`#rrggbb`. Los efectos también en castellano: `arcoiris`, `ola`, `temblor`, `brillo`…\n" +
			"- Al editar el mensaje vuelven a salir las etiquetas. Dentro de código (`` ` ``) no se aplican.\n" +
			"- En la app móvil se ve el texto sin etiquetas y sin efectos.",
	},
	"en": {
		"#### Coloured and animated text",
		"Wrap text in a tag: `{effect}text{/}`. Or use the 🎨 button in the message box: select the text and pick the effect.",
		"| You type | You see | |",
		"- One effect of each kind per piece: **colour** (colour, gradient, `rainbow`, `fire`), **light** (`glow`, `neon`, `shine`) and **motion** (the rest). Combine them with `+` and nest them: `{red}red and {wave}wave{/}{/}`.\n" +
			"- Colours: `red orange yellow green cyan blue purple pink brown gray black white gold silver`, or `#rgb`/`#rrggbb`.\n" +
			"- Editing the message shows the tags again. They do nothing inside code (`` ` ``).\n" +
			"- The mobile apps show the text without tags and without effects.",
	},
}

func helpText(locale string) string {
	lang := "en"
	if strings.HasPrefix(locale, "es") {
		lang = "es"
	}
	s := helpStrings[lang]
	var b strings.Builder
	fmt.Fprintf(&b, "%s\n\n%s\n\n%s\n|:--|:--|:--|\n", s[0], s[1], s[2])
	for _, e := range examples {
		desc := e.en
		if lang == "es" {
			desc = e.es
		}
		fmt.Fprintf(&b, "| `{%s}Hola{/}` | {%s}Hola{/} | %s |\n", e.tag, e.tag, desc)
	}
	fmt.Fprintf(&b, "\n%s", s[3])
	return b.String()
}
