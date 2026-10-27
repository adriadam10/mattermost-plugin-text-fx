package main

import (
	"reflect"
	"strings"
	"testing"
)

// visible shows the markers as « and » so expectations are readable.
func visible(s string) string {
	return strings.NewReplacer(startMark, "«", endMark, "»").Replace(s)
}

func TestEncode(t *testing.T) {
	cases := []struct {
		name, in, want string
		old, specs     []string
	}{
		{"plain text", "hola {mundo}", "hola {mundo}", nil, nil},
		{"one range", "a {rainbow}b{/} c", "a «b» c", nil, []string{"rainbow"}},
		{"combined and spanish", "{ola+arcoiris}x{/ola}", "«x»", nil, []string{"rainbow+wave"}},
		{"colour and gradient", "{#F80}a{/} {rojo>azul}b{/}", "«a» «b»", nil, []string{"#ff8800", "#e53935>#1e88e5"}},
		{"nested", "{red}a{wave}b{/}c{/}", "«a«b»c»", nil, []string{"#e53935", "wave"}},
		{"unclosed closes at end", "{glow}abc", "«abc»", nil, []string{"glow"}},
		{"stray close is text", "a{/}b", "a{/}b", nil, nil},
		{"invalid token", "{rainbow+foo}x{/}", "{rainbow+foo}x{/}", nil, nil},
		{"inline code", "`{red}x{/}` {red}y{/}", "`{red}x{/}` «y»", nil, []string{"#e53935"}},
		{"double backticks", "``a ` {red}``{red}b", "``a ` {red}``«b»", nil, []string{"#e53935"}},
		{"fenced code", "```\n{red}x{/}\n```\n{red}y{/}", "```\n{red}x{/}\n```\n«y»", nil, []string{"#e53935"}},
		{"markers keep old specs", "«a» {blue}b{/}", "«a» «b»", []string{"shake"}, []string{"shake", "#1e88e5"}},
		{"markers without spec dropped", "«a»", "a", nil, nil},
		{"forged spec dropped", "«a»", "a", []string{"<script>"}, nil},
		{"stray end marker dropped", "a»b", "ab", nil, nil},
	}
	for _, c := range cases {
		in := strings.NewReplacer("«", startMark, "»", endMark).Replace(c.in)
		got, specs := encode(in, c.old)
		if visible(got) != c.want || !reflect.DeepEqual(specs, c.specs) {
			t.Errorf("%s: got %q %v, want %q %v", c.name, visible(got), specs, c.want, c.specs)
		}
	}
}

func TestEncodeIsIdempotent(t *testing.T) {
	once, specs := encode("{fire+neon}hot{/} and {pulse}{blue}cool{/}", nil)
	twice, again := encode(once, specs)
	if once != twice || !reflect.DeepEqual(specs, again) {
		t.Fatalf("re-encoding changed it: %q %v -> %q %v", visible(once), specs, visible(twice), again)
	}
}

func TestParseSpec(t *testing.T) {
	cases := map[string]string{
		"rainbow":            "rainbow",
		"WAVE + rainbow":     "rainbow+wave",
		"red+blue":           "#1e88e5",
		"#abc>#123456>verde": "#aabbcc>#123456>#43a047",
		"latido+brillo":      "glow+pulse",
	}
	for in, want := range cases {
		if got, ok := parseSpec(in); !ok || got != want {
			t.Errorf("parseSpec(%q) = %q, %v; want %q", in, got, ok, want)
		}
	}
	for _, in := range []string{"", "hola", "#12", "a>b", "red>red>red>red>red", "red+"} {
		if got, ok := parseSpec(in); ok {
			t.Errorf("parseSpec(%q) = %q, want invalid", in, got)
		}
	}
}
