package midjourney

import (
	"chat/globals"
	"chat/utils"
	"fmt"
	"strings"
)

const maxActions = 4
const (
	ImagineAction   = "IMAGINE"
	UpscaleAction   = "UPSCALE"
	VariationAction = "VARIATION"
	RerollAction    = "REROLL"
)

const (
	ImagineCommand   = "/IMAGINE"
	UpscaleCommand   = "/UPSCALE"
	VariationCommand = "/VARIATION"
	RerollCommand    = "/REROLL"
)

type ChatProps struct {
	Messages []globals.Message
	Model    string
}

func getMode(model string) string {
	switch model {
	case globals.Midjourney: // relax
		return RelaxMode
	case globals.MidjourneyFast: // fast
		return FastMode
	case globals.MidjourneyTurbo: // turbo
		return TurboMode
	default:
		return RelaxMode
	}
}

func (c *ChatInstance) GetCleanPrompt(model string, prompt string) string {
	arr := strings.Split(strings.TrimSpace(prompt), " ")
	var res []string

	for _, word := range arr {
		if utils.Contains[string](word, RendererMode) {
			continue
		}
		res = append(res, word)
	}

	res = append(res, getMode(model))
	target := strings.Join(res, " ")
	return target
}

func (c *ChatInstance) GetPrompt(props *ChatProps) string {
	return c.GetCleanPrompt(props.Model, props.Messages[len(props.Messages)-1].Content)
}

func (c *ChatInstance) CreateStreamChatRequest(props *ChatProps, callback globals.Hook) error {
	// partial response like:
	// ```progress
	// 0
	// ...
	// 100
	// ```
	// ![image](...)

	action, prompt := c.ExtractPrompt(c.GetPrompt(props))
	if len(prompt) == 0 {
		return fmt.Errorf("format error: please provide available prompt")
	}

	var begin bool

	form, err := c.CreateStreamTask(action, prompt, func(form *StorageForm, progress int) error {
		if progress == 0 {
			begin = true
			if err := callback("```progress\n"); err != nil {
				return err
			}
		} else if progress == 100 && !begin {
			if err := callback("```progress\n"); err != nil {
				return err
			}
		}

		if err := callback(fmt.Sprintf("%d\n", progress)); err != nil {
			return err
		}

		if progress == 100 {
			if err := callback("```\n"); err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return fmt.Errorf("error from midjourney: %s", err.Error())
	}

	if err := callback(utils.GetImageMarkdown(form.Url)); err != nil {
		return err
	}

	return c.CallbackActions(form, callback)
}

func toVirtualMessage(message string) string {
	return "https://chatnio.virtual" + strings.Replace(message, " ", "-", -1)
}

func (c *ChatInstance) CallbackActions(form *StorageForm, callback globals.Hook) error {
	if form.Action == UpscaleAction {
		return nil
	}

	actions := utils.Range(1, maxActions+1)

	upscale := strings.Join(utils.Each(actions, func(index int) string {
		return fmt.Sprintf("[U%d](%s)", index, toVirtualMessage(fmt.Sprintf("/UPSCALE %s %d", form.Task, index)))
	}), " ")

	variation := strings.Join(utils.Each(actions, func(index int) string {
		return fmt.Sprintf("[V%d](%s)", index, toVirtualMessage(fmt.Sprintf("/VARIATION %s %d", form.Task, index)))
	}), " ")

	reroll := fmt.Sprintf("[REROLL](%s)", toVirtualMessage(fmt.Sprintf("/REROLL %s", form.Task)))

	return callback(fmt.Sprintf("\n\n%s\n\n%s\n\n%s\n", upscale, variation, reroll))
}
