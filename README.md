# price_tracking - Internal AI Sales Copilot Bootstrap

Demo internal Chrome extension copilot for Pancake chat operations.

## What's included
- Floating in-page copilot panel on Pancake pages.
- Demo internal login button (session token in extension storage).
- Suggestion flow via backend (`/v1/copilot/suggest`) with local fallback for demo.
- One-click actions:
  - Import suggested text into chat input.
  - Import and send immediately.
- Enter-first workflow is preserved (manual Enter remains primary behavior).

## Structure
- `docs/implementation-plan.md`: architecture + security + rollout.
- `extension/manifest.json`: MV3 config.
- `extension/src/background.js`: login/session + suggest orchestration.
- `extension/src/content.js`: UI overlay, context collection, insert/send actions.

## Security notes
- Production setup must keep model/API keys in backend secret manager only.
- Employee and manager controls should be enforced by backend RBAC and policy signatures.
- This repo contains a demo fallback to keep showing UX without backend connectivity.
