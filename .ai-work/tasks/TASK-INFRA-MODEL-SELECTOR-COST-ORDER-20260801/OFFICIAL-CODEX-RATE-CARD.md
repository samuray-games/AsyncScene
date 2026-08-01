# Official Codex Rate Card

- Retrieved at UTC: 2026-08-01T07:34:14Z
- Source URL: https://help.openai.com/en/articles/20001106-codex-rate-card
- Pricing basis: `CODEX_CREDITS_PER_1M_TOKENS_STANDARD_SPEED`
- Speed: Standard

The live official token-based Codex rate card reports these credits per 1M input / cached-input / output tokens:

| Model identifier | Input | Cached input | Output |
| --- | ---: | ---: | ---: |
| `gpt-5.6-luna` | `5` | `0.5` | `30` |
| `gpt-5.4-mini` | `18.75` | `1.875` | `113` |
| `gpt-5.6-terra` | `50` | `5` | `300` |
| `gpt-5.4` | `62.50` | `6.250` | `375` |
| `gpt-5.5` | `125` | `12.50` | `750` |
| `gpt-5.6-sol` | `125` | `12.50` | `750` |

The official page announces that GPT-5.4 and GPT-5.4 Mini retire in Codex for users signed in with ChatGPT on 2026-08-31. This does not remove either model from the current confirmed picker snapshot; inventory maintenance remains event-driven by an actual picker change, and this task does not modify inventory.

The selector authority is official Codex credits per token, not API dollar pricing, legacy average credits per message, Fast-mode rates, or model ordering. No numerical effort price multiplier is known or invented. All efforts for a model use that model's exact vector.

The active vectors are component-wise comparable and derive these ordered cost tiers:

1. `gpt-5.6-luna`
2. `gpt-5.4-mini`
3. `gpt-5.6-terra`
4. `gpt-5.4`
5. `gpt-5.5`, `gpt-5.6-sol`
