const COPILOT_PANEL_ID = "internal-sales-copilot-panel";

function findChatInput() {
  return document.querySelector('[contenteditable="true"], textarea, input[type="text"]');
}

function setInputValue(input, text) {
  if (input.isContentEditable) {
    input.focus();
    document.execCommand("selectAll", false);
    document.execCommand("insertText", false, text);
    input.dispatchEvent(new InputEvent("input", { bubbles: true, data: text, inputType: "insertText" }));
    return;
  }

  input.value = text;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function insertTextToInput(text) {
  const input = findChatInput();
  if (!input) return false;
  setInputValue(input, text);
  input.focus();
  return true;
}

function sendCurrentInput() {
  const input = findChatInput();
  if (!input) return false;
  input.focus();
  input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Enter", code: "Enter" }));
  input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: "Enter", code: "Enter" }));
  return true;
}

function collectThreadMessages() {
  const nodes = document.querySelectorAll('[data-message], .message, .chat-message');
  const messages = [];
  nodes.forEach((node) => {
    const text = node.textContent?.trim();
    if (text) messages.push({ role: "unknown", text });
  });
  return messages.slice(-30);
}

function extractContext() {
  return {
    url: location.href,
    title: document.title,
    messages: collectThreadMessages()
  };
}

function createPanel() {
  if (document.getElementById(COPILOT_PANEL_ID)) return;

  const panel = document.createElement("div");
  panel.id = COPILOT_PANEL_ID;
  panel.innerHTML = `
    <div class="isc-header">AI Sales Copilot (Internal)</div>
    <div class="isc-row">
      <button id="isc-suggest-btn">Gợi ý</button>
      <button id="isc-login-btn">Đăng nhập</button>
    </div>
    <div class="isc-row">
      <select id="isc-tone-select">
        <option value="concise">Ngắn gọn</option>
        <option value="consultative">Tư vấn</option>
        <option value="closing">Chốt đơn</option>
      </select>
    </div>
    <div id="isc-status" class="isc-status">Sẵn sàng.</div>
    <div id="isc-suggestions" class="isc-suggestions"></div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    #${COPILOT_PANEL_ID} { position: fixed; top: 80px; right: 16px; width: 320px; background: #111827; color: #f3f4f6; z-index: 2147483647; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.25); font-family: Arial, sans-serif; }
    #${COPILOT_PANEL_ID} .isc-header { padding: 10px 12px; font-weight: 700; border-bottom: 1px solid #374151; }
    #${COPILOT_PANEL_ID} .isc-row { display: flex; gap: 8px; padding: 8px 12px; }
    #${COPILOT_PANEL_ID} button, #${COPILOT_PANEL_ID} select { flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #4b5563; background: #1f2937; color: #f9fafb; }
    #${COPILOT_PANEL_ID} .isc-status { padding: 0 12px 8px; font-size: 12px; color: #9ca3af; }
    #${COPILOT_PANEL_ID} .isc-suggestions { max-height: 380px; overflow: auto; padding: 8px 12px 12px; }
    #${COPILOT_PANEL_ID} .isc-card { background: #1f2937; border: 1px solid #374151; border-radius: 10px; padding: 10px; margin-bottom: 8px; }
    #${COPILOT_PANEL_ID} .isc-actions { display: flex; gap: 6px; margin-top: 8px; }
    #${COPILOT_PANEL_ID} .isc-actions button { flex: 1; font-size: 12px; padding: 6px; }
  `;

  document.documentElement.appendChild(style);
  document.body.appendChild(panel);

  document.getElementById("isc-login-btn").addEventListener("click", async () => {
    const status = document.getElementById("isc-status");
    status.textContent = "Đang đăng nhập demo...";
    const response = await chrome.runtime.sendMessage({ type: "COPILOT_LOGIN_DEMO" });
    status.textContent = response?.ok ? "Đăng nhập thành công." : `Đăng nhập lỗi: ${response?.error || "unknown"}`;
  });

  document.getElementById("isc-suggest-btn").addEventListener("click", onSuggest);
}

function renderSuggestions(result) {
  const container = document.getElementById("isc-suggestions");
  container.innerHTML = "";

  result.reply_variants.forEach((variant) => {
    const card = document.createElement("div");
    card.className = "isc-card";
    card.innerHTML = `
      <div><b>${variant.style}</b></div>
      <div>${variant.text}</div>
      <div class="isc-actions">
        <button data-action="insert">Import vào ô chat</button>
        <button data-action="send">Import + gửi</button>
      </div>
    `;

    const [insertBtn, sendBtn] = card.querySelectorAll("button");
    insertBtn.addEventListener("click", () => insertTextToInput(variant.text));
    sendBtn.addEventListener("click", () => {
      if (insertTextToInput(variant.text)) sendCurrentInput();
    });

    container.appendChild(card);
  });
}

async function onSuggest() {
  const status = document.getElementById("isc-status");
  const tone = document.getElementById("isc-tone-select").value;
  status.textContent = "Đang lấy gợi ý...";

  const response = await chrome.runtime.sendMessage({
    type: "COPILOT_SUGGEST",
    payload: {
      locale: "vi-VN",
      preferred_tone: tone,
      ...extractContext()
    }
  });

  if (!response?.ok) {
    status.textContent = `Lỗi: ${response?.error || "không rõ"}`;
    return;
  }

  renderSuggestions(response.data);
  status.textContent = "Đã có gợi ý.";
}

createPanel();

window.InternalSalesCopilot = {
  insertTextToInput,
  collectThreadMessages,
  sendCurrentInput
};
