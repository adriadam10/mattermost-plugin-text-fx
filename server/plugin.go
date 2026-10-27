package main

import (
	"strings"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/plugin"
)

const command = "fx"

type Plugin struct {
	plugin.MattermostPlugin
}

func (p *Plugin) OnActivate() error {
	return p.API.RegisterCommand(&model.Command{
		Trigger:          command,
		AutoComplete:     true,
		AutoCompleteDesc: "Coloured and animated text: shows how to write it, with examples.",
		DisplayName:      "Text FX",
	})
}

func (p *Plugin) MessageWillBePosted(_ *plugin.Context, post *model.Post) (*model.Post, string) {
	apply(post, nil)
	return post, ""
}

// MessageWillBeUpdated re-encodes the edited text. The webapp turns markers
// back into tags before editing; a client that does not keeps the markers,
// and they keep the effects they had.
func (p *Plugin) MessageWillBeUpdated(_ *plugin.Context, newPost, oldPost *model.Post) (*model.Post, string) {
	apply(newPost, storedSpecs(oldPost))
	return newPost, ""
}

func (p *Plugin) ExecuteCommand(_ *plugin.Context, args *model.CommandArgs) (*model.CommandResponse, *model.AppError) {
	locale := "en"
	if user, appErr := p.API.GetUser(args.UserId); appErr == nil {
		locale = user.Locale
	}
	post := &model.Post{UserId: args.UserId, ChannelId: args.ChannelId, RootId: args.RootId, Message: helpText(locale)}
	apply(post, nil)
	p.API.SendEphemeralPost(args.UserId, post)
	return &model.CommandResponse{}, nil
}

func apply(post *model.Post, oldSpecs []string) {
	var specs []string
	if strings.Contains(post.Message, "{") || strings.Contains(post.Message, startMark) {
		post.Message, specs = encode(post.Message, oldSpecs)
	}
	if len(specs) == 0 && post.GetProp(propSpecs) == nil {
		return
	}
	// []any, as props read back from the database, so the type is the same either way.
	// Never DelProp: the hook result reaches the server through gob, which merges
	// the props map into the original one, so a deleted key would come back.
	values := make([]any, len(specs))
	for i, s := range specs {
		values[i] = s
	}
	post.AddProp(propSpecs, values)
}

func storedSpecs(post *model.Post) []string {
	if specs, ok := post.GetProp(propSpecs).([]string); ok {
		return specs
	}
	values, _ := post.GetProp(propSpecs).([]any)
	specs := make([]string, 0, len(values))
	for _, v := range values {
		s, _ := v.(string)
		specs = append(specs, s)
	}
	return specs
}

func main() {
	plugin.ClientMain(&Plugin{})
}
