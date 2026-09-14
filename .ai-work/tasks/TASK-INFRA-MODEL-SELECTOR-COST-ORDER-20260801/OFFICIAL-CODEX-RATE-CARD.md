# Official Codex Rate Card

- Retrieved at UTC: 2026-09-07T00:24:00Z
- Source URL: https://help.openai.com/en/articles/20001106-codex-rate-card
- Pricing basis: `CODEX_CREDITS_PER_1M_TOKENS_STANDARD_SPEED`
- Speed: Standard

The live official token-based Codex rate card reports these credits per 1M input / cached-input / output tokens:

| Model identifier | Input | Cached input | Output |
| --- | ---: | ---: | ---: |
| `gpt-5.6-luna` | `5` | `0.5` | `30` |
| `gpt-5.6-terra` | `50` | `5` | `300` |
| `gpt-5.6-sol` | `100` | `10` | `500` |
| `gpt-5.5` | `125` | `12.50` | `750` |
| `gpt-6-astra` | `250` | `25` | `1250` |

The official page announces that GPT-5.4 and GPT-5.4 Mini retire in Codex for users signed in with ChatGPT on 2026-08-31. The current picker inventory therefore excludes both retired models and includes GPT-6 Astra.

The selector authority is official Codex credits per token, not API dollar pricing, legacy average credits per message, Fast-mode rates, or model ordering. No numerical effort price multiplier is known or invented. All efforts for a model use that model's exact vector.

The active vectors are component-wise comparable and derive these ordered cost tiers:

1. `gpt-5.6-luna`
2. `gpt-5.6-terra`
3. `gpt-5.6-sol`
4. `gpt-5.5`
5. `gpt-6-astra`
