const API_BASE = "https://copilot-internal.yourcompany.local";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "COPILOT_SUGGEST") {
    fetch(`${API_BASE}/v1/copilot/suggest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${message.accessToken}`
      },
      body: JSON.stringify(message.payload)
    })
      .then((r) => r.json())
      .then((data) => sendResponse({ ok: true, data }))
      .catch((error) => sendResponse({ ok: false, error: String(error) }));

    return true;
  }
});
