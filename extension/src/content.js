function findChatInput() {
  return document.querySelector('[contenteditable="true"], textarea, input[type="text"]');
}

function insertTextToInput(text) {
  const input = findChatInput();
  if (!input) return false;

  input.focus();

  if (input.isContentEditable) {
    document.execCommand("selectAll", false, null);
    document.execCommand("insertText", false, text);
  } else {
    input.value = text;
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  return true;
}

function collectThreadMessages() {
  const nodes = document.querySelectorAll('[data-message], .message, .chat-message');
  const messages = [];
  nodes.forEach((node) => {
    const text = node.textContent?.trim();
    if (text) messages.push({ role: "unknown", text });
  });
  return messages.slice(-20);
}

window.InternalSalesCopilot = {
  insertTextToInput,
  collectThreadMessages
};
