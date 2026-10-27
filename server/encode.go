package main

import (
	"strings"
)

// Tags are swapped for invisible markers so every client shows clean text
// (the mobile apps do not run webapp plugins), and the effect of each range is
// kept in the post props, in the order the ranges open. The markers are two
// zero-width characters each, a sequence nobody types.
const (
	startMark = "​⁠"
	endMark   = "⁠​"
	propSpecs = "text_fx"

	maxRanges = 200
	maxTagLen = 64
)

// encode turns the tags of a message into markers. Markers already in the
// message (an edit from a client that showed them) keep their effect from
// oldSpecs; unpaired markers and closing tags are dropped, and ranges left
// open are closed at the end. Tags inside code are left as they are.
func encode(message string, oldSpecs []string) (string, []string) {
	var (
		out     strings.Builder
		specs   []string
		stack   []bool // per open range: whether its markers are written
		oldIdx  int
		inFence bool
	)
	open := func(spec string, ok bool) {
		if ok && len(specs) < maxRanges {
			specs = append(specs, spec)
			out.WriteString(startMark)
			stack = append(stack, true)
			return
		}
		stack = append(stack, false)
	}
	closeRange := func() {
		if len(stack) == 0 {
			return
		}
		if stack[len(stack)-1] {
			out.WriteString(endMark)
		}
		stack = stack[:len(stack)-1]
	}

	for i := 0; i < len(message); {
		rest := message[i:]
		if atLineStart(message, i) {
			if line, fence := fenceLine(rest); fence {
				inFence = !inFence
				out.WriteString(line)
				i += len(line)
				continue
			}
		}
		if inFence {
			n := lineLen(rest)
			out.WriteString(rest[:n])
			i += n
			continue
		}
		switch {
		case strings.HasPrefix(rest, startMark):
			spec := ""
			if oldIdx < len(oldSpecs) {
				spec = oldSpecs[oldIdx]
			}
			oldIdx++
			open(spec, validSpec(spec))
			i += len(startMark)
		case strings.HasPrefix(rest, endMark):
			closeRange()
			i += len(endMark)
		case rest[0] == '`':
			n := codeSpanLen(rest)
			out.WriteString(rest[:n])
			i += n
		case rest[0] == '{':
			tag, closing, n := readTag(rest)
			switch {
			case n == 0:
				out.WriteByte('{')
				i++
				continue
			case closing && len(stack) > 0:
				closeRange()
			case closing:
				// A closing tag with nothing open is plain text.
				out.WriteString(rest[:n])
			default:
				spec, ok := parseSpec(tag)
				if !ok {
					out.WriteString(rest[:n])
					break
				}
				open(spec, true)
			}
			i += n
		default:
			out.WriteByte(rest[0])
			i++
		}
	}
	for len(stack) > 0 {
		closeRange()
	}
	return out.String(), specs
}

// readTag reads "{spec}" or "{/...}" at the start of s. n is 0 when s does
// not start with something shaped like a tag.
func readTag(s string) (body string, closing bool, n int) {
	end := strings.IndexByte(s, '}')
	if end < 2 || end > maxTagLen || strings.ContainsAny(s[1:end], "{\n") {
		return "", false, 0
	}
	body = s[1:end]
	if strings.HasPrefix(body, "/") {
		return "", true, end + 1
	}
	return body, false, end + 1
}

// codeSpanLen is the length of the inline code span starting at s, or of the
// backtick run alone when it is never closed (then it is not code).
func codeSpanLen(s string) int {
	run := tickRun(s)
	for j := run; j < len(s); {
		k := strings.IndexByte(s[j:], '`')
		if k < 0 {
			break
		}
		k += j
		n := tickRun(s[k:])
		if n == run {
			return k + n
		}
		j = k + n
	}
	return run
}

func tickRun(s string) int {
	return len(s) - len(strings.TrimLeft(s, "`"))
}

func atLineStart(s string, i int) bool {
	return i == 0 || s[i-1] == '\n'
}

func lineLen(s string) int {
	if n := strings.IndexByte(s, '\n'); n >= 0 {
		return n + 1
	}
	return len(s)
}

// fenceLine returns the line at the start of s and whether it opens or closes
// a fenced code block (up to three spaces, then ``` or ~~~).
func fenceLine(s string) (string, bool) {
	line := s[:lineLen(s)]
	trimmed := strings.TrimLeft(line, " ")
	if len(line)-len(trimmed) > 3 {
		return line, false
	}
	return line, strings.HasPrefix(trimmed, "```") || strings.HasPrefix(trimmed, "~~~")
}
