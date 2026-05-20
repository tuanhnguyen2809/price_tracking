# AI Sales Copilot for Pancake (Internal Chrome Extension)

## 1. Scope (MVP)
- Overlay assistant inside Pancake screen.
- Read chat sections + current conversation history.
- Suggest replies + product recommendations + translation.
- One-click insert suggestion into chat input, while preserving staff "press Enter" as the primary send action.
- Internal access control: only approved employees can use extension; only manager admins can configure critical settings.

## 2. High-Level Architecture

### 2.1 Components
1. **Chrome Extension (MV3)**
   - `content.js`: parse allowed DOM sections from Pancake and interact with chat input.
   - `overlay.js`: render assistant panel and actions.
   - `background.js`: secure token handling, API calls, feature flags, session guard.
2. **Auth Gateway / Backend API**
   - SSO or email login for employees.
   - Manager approval workflow.
   - Role-based access control (RBAC: `employee`, `manager`, `admin`).
3. **AI Orchestration Service**
   - Context builder.
   - Product retriever (catalog search).
   - LLM generation for suggested responses.
4. **Admin Console (internal web app)**
   - Approve/revoke employee access.
   - Manage extension policy and allowed domains.
   - Audit logs.

## 3. Security Requirements

### 3.1 Key principles
- Never store OpenAI API key in extension source code.
- Extension calls **your backend**, not OpenAI directly, in production.
- Backend holds model credentials in server-side secret manager.
- Employee access is short-lived token + refresh token rotation.

### 3.2 Manager-only controls
- Only `manager/admin` can:
  - change AI prompts and policy settings,
  - manage staff approvals,
  - revoke devices/sessions,
  - enable/disable quick-send behavior.
- Signed policy payload from backend verified by extension before applying.

### 3.3 Data protection
- DOM extraction allowlist (chat body, customer metadata, input field only).
- PII masking before sending to AI (phone/email/order id partial masking if needed).
- TLS + payload signing.
- Audit logs for admin actions and suggestion usage.

## 4. Feature Design

### 4.1 Conversation analysis
- Detect intent: price inquiry, product fit, objection, complaint, logistics.
- Detect funnel stage: greeting, consulting, objection-handling, closing.

### 4.2 Suggestion outputs
Each generation returns:
- `reply_variants` (3 versions: concise, consultative, closing-oriented)
- `product_suggestions` (top 3 with reason)
- `translations` (source->target)
- `confidence` + safety tags

### 4.3 Insert/send UX
- Button A: **Insert to input** (default recommended)
- Button B: **Insert + Send now** (optional, permission-controlled)
- Priority UX: keep focus in chat input so employee can hit Enter manually.

## 5. API Contract (draft)

### POST `/v1/copilot/suggest`
Request:
```json
{
  "session_id": "string",
  "thread_id": "string",
  "agent_id": "string",
  "locale": "vi-VN",
  "messages": [{"role": "customer", "text": "..."}],
  "screen_context": {"tags": ["vip"], "order_status": "new"}
}
```
Response:
```json
{
  "reply_variants": [
    {"id": "r1", "style": "concise", "text": "..."}
  ],
  "product_suggestions": [
    {"sku": "ABC", "title": "...", "reason": "..."}
  ],
  "translations": [{"target": "en", "text": "..."}],
  "safety": {"blocked": false, "notes": []}
}
```

## 6. Rollout Plan

## Week 1
- Build extension skeleton + overlay.
- Implement secure login + token refresh.

## Week 2
- DOM extraction for Pancake chat/thread.
- Suggest API integration + render variants.

## Week 3
- Product recommendation retriever.
- Translation + tone controls.

## Week 4
- Admin approval flow + audit logs.
- Pilot with 10-20 agents.

## Week 5-6
- Harden security controls.
- Optimize suggestion quality with real chat eval.

## 7. Acceptance Criteria (MVP)
- Employee can login and access only if approved by manager.
- Manager can revoke employee and session is invalidated within 5 minutes.
- Suggestion appears in <= 2.5s for p50 requests.
- One-click insert works in Pancake input.
- Enter key send still works as default behavior.

