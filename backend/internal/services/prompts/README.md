# Meeting Summarization Prompts

This directory contains prompt templates used by the OpenRouter service for AI-powered meeting summarization.

## Files

### `meeting_summary_system.md`

The main system prompt that instructs the LLM on how to generate structured meeting summaries.

**Structure:**
- Executive Summary
- Key Decisions
- Action Items
- Discussion Points
- Open Questions
- Participants

## How It Works

The prompt file is embedded into the Go binary at compile time using the `//go:embed` directive. This means:

1. **No runtime file I/O**: The prompt is loaded at compile time, not runtime
2. **Single binary deployment**: The prompt is bundled with the executable
3. **Version control**: Prompt changes are tracked in git alongside code

## Modifying Prompts

To modify the summarization behavior:

1. Edit `meeting_summary_system.md`
2. Rebuild the application: `go build ./cmd/server`
3. The new prompt will be embedded in the binary

## Best Practices

- Keep prompts clear and specific
- Use markdown formatting for structure
- Test prompt changes with various meeting types
- Document any major prompt changes in git commits
- Consider A/B testing different prompts for quality

## Future Enhancements

You could add additional prompt files for:
- `executive_summary.md` - High-level overview only
- `technical_summary.md` - Detailed technical discussion
- `action_items_only.md` - Just extract action items
- `multilingual_summary.md` - Summaries in different languages
