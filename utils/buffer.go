package utils

import (
	"chat/globals"
	"strings"
)

type Buffer struct {
	Model     string             `json:"model"`
	Quota     float32            `json:"quota"`
	Data      string             `json:"data"`
	Latest    string             `json:"latest"`
	Cursor    int                `json:"cursor"`
	Times     int                `json:"times"`
	History   []globals.Message  `json:"history"`
	Images    Images             `json:"images"`
	ToolCalls *globals.ToolCalls `json:"tool_calls"`
}

func NewBuffer(model string, history []globals.Message) *Buffer {
	return &Buffer{
		Model:   model,
		Quota:   CountInputToken(model, history),
		History: history,
	}
}

func (b *Buffer) GetCursor() int {
	return b.Cursor
}

func (b *Buffer) GetQuota() float32 {
	return b.Quota + CountOutputToken(b.Model, b.ReadTimes())
}

func (b *Buffer) Write(data string) string {
	b.Data += data
	b.Cursor += len(data)
	b.Times++
	b.Latest = data
	return data
}

func (b *Buffer) GetChunk() string {
	return b.Latest
}

func (b *Buffer) SetImages(images Images) {
	b.Images = images

	b.Quota += Sum(Each(images, func(image Image) float32 {
		return float32(image.CountTokens(b.Model)) * 0.7
	}))
}

func (b *Buffer) GetImages() Images {
	return b.Images
}

func (b *Buffer) SetToolCalls(toolCalls *globals.ToolCalls) {
	if toolCalls == nil {
		return
	}

	b.ToolCalls = toolCalls
}

func (b *Buffer) GetToolCalls() *globals.ToolCalls {
	return b.ToolCalls
}

func (b *Buffer) IsFunctionCalling() bool {
	return b.GetToolCalls() != nil
}

func (b *Buffer) WriteBytes(data []byte) []byte {
	b.Write(string(data))
	return data
}

func (b *Buffer) IsEmpty() bool {
	return b.Cursor == 0 && !b.IsFunctionCalling()
}

func (b *Buffer) Read() string {
	return b.Data
}

func (b *Buffer) ReadBytes() []byte {
	return []byte(b.Data)
}

func (b *Buffer) ReadWithDefault(_default string) string {
	if b.IsEmpty() || (len(strings.TrimSpace(b.Data)) == 0 && !b.IsFunctionCalling()) {
		return _default
	}
	return b.Data
}

func (b *Buffer) ReadTimes() int {
	return b.Times
}

func (b *Buffer) ReadHistory() []globals.Message {
	return b.History
}

func (b *Buffer) CountInputToken() int {
	return GetWeightByModel(b.Model) * NumTokensFromMessages(b.History, b.Model)
}

func (b *Buffer) CountOutputToken() int {
	return b.ReadTimes() * GetWeightByModel(b.Model)
}

func (b *Buffer) CountToken() int {
	return b.CountInputToken() + b.CountOutputToken()
}
