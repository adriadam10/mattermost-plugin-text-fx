package main

import (
	"regexp"
	"strings"
)

// An effect spec is what goes between the braces of an opening tag:
// effects and colours joined by "+", e.g. "rainbow+wave" or "#f80>blue+glow".
// It is stored canonical (English names, colours as #rrggbb) so the webapp
// only has to know one spelling.

type category int

const (
	catColor  category = iota // solid colour, gradient, rainbow, fire
	catLight                  // glow, neon, shine
	catMotion                 // wave, bounce, shake, pulse, blink, typewriter
	catCount
)

const maxGradientStops = 4

// effects maps every accepted name (English and Spanish) to its canonical name.
var effects = map[string]struct {
	name string
	cat  category
}{
	"rainbow": {"rainbow", catColor}, "arcoiris": {"rainbow", catColor},
	"fire": {"fire", catColor}, "fuego": {"fire", catColor},
	"glow": {"glow", catLight}, "brillo": {"glow", catLight},
	"neon":  {"neon", catLight},
	"shine": {"shine", catLight}, "destello": {"shine", catLight},
	"wave": {"wave", catMotion}, "ola": {"wave", catMotion},
	"bounce": {"bounce", catMotion}, "rebote": {"bounce", catMotion},
	"shake": {"shake", catMotion}, "temblor": {"shake", catMotion},
	"pulse": {"pulse", catMotion}, "latido": {"pulse", catMotion},
	"blink": {"blink", catMotion}, "parpadeo": {"blink", catMotion},
	"typewriter": {"typewriter", catMotion}, "maquina": {"typewriter", catMotion},
}

// colors are the named colours, picked to read well on light and dark themes.
var colors = map[string]string{
	"red": "#e53935", "rojo": "#e53935",
	"orange": "#fb8c00", "naranja": "#fb8c00",
	"yellow": "#fdd835", "amarillo": "#fdd835",
	"green": "#43a047", "verde": "#43a047",
	"cyan": "#00acc1", "cian": "#00acc1",
	"blue": "#1e88e5", "azul": "#1e88e5",
	"purple": "#8e24aa", "morado": "#8e24aa", "lila": "#8e24aa",
	"pink": "#ec407a", "rosa": "#ec407a",
	"brown": "#6d4c41", "marron": "#6d4c41",
	"gray": "#9e9e9e", "grey": "#9e9e9e", "gris": "#9e9e9e",
	"black": "#212121", "negro": "#212121",
	"white": "#fafafa", "blanco": "#fafafa",
	"gold": "#ffb300", "oro": "#ffb300", "dorado": "#ffb300",
	"silver": "#b0bec5", "plata": "#b0bec5", "plateado": "#b0bec5",
}

var hexColor = regexp.MustCompile(`^#(?:[0-9a-f]{3}|[0-9a-f]{6})$`)

// parseColor accepts a colour name or #rgb / #rrggbb and returns #rrggbb.
func parseColor(s string) (string, bool) {
	if c, ok := colors[s]; ok {
		return c, true
	}
	if !hexColor.MatchString(s) {
		return "", false
	}
	if len(s) == 4 {
		return "#" + strings.Repeat(s[1:2], 2) + strings.Repeat(s[2:3], 2) + strings.Repeat(s[3:4], 2), true
	}
	return s, true
}

// parseSpec validates a spec and returns it canonical. Anything unknown makes
// the whole tag invalid, so ordinary text in braces is left alone.
func parseSpec(raw string) (string, bool) {
	raw = strings.ToLower(strings.TrimSpace(raw))
	if raw == "" {
		return "", false
	}
	var parts [catCount]string
	for token := range strings.SplitSeq(raw, "+") {
		token = strings.TrimSpace(token)
		if e, ok := effects[token]; ok {
			parts[e.cat] = e.name
			continue
		}
		stops := strings.Split(token, ">")
		if len(stops) > maxGradientStops {
			return "", false
		}
		for i, stop := range stops {
			c, ok := parseColor(strings.TrimSpace(stop))
			if !ok {
				return "", false
			}
			stops[i] = c
		}
		parts[catColor] = strings.Join(stops, ">")
	}
	var out []string
	for _, p := range parts {
		if p != "" {
			out = append(out, p)
		}
	}
	return strings.Join(out, "+"), true
}

// validSpec tells whether a stored spec is canonical, so forged props are ignored.
func validSpec(spec string) bool {
	canonical, ok := parseSpec(spec)
	return ok && canonical == spec
}
