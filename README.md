# price_tracking - Internal AI Sales Copilot Bootstrap

This repository now contains a bootstrap implementation plan and skeleton for an internal Chrome extension copilot that runs alongside Pancake.

## Structure
- `docs/implementation-plan.md`: Product, security, architecture, rollout and acceptance criteria.
- `extension/manifest.json`: MV3 extension manifest.
- `extension/src/background.js`: Background service worker with suggest API proxy call.
- `extension/src/content.js`: DOM extraction and one-click input insertion helpers.

## Notes
- For production security, OpenAI credentials must remain server-side only.
- Access control should be handled by backend with manager approval and RBAC.
