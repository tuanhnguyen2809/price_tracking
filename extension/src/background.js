const API_BASE = "https://copilot-internal.yourcompany.local";
const TOKEN_KEY = "copilot_access_token";
const ROLE_KEY = "copilot_role";

async function getSession() {
  const stored = await chrome.storage.local.get([TOKEN_KEY, ROLE_KEY]);
  return {
    accessToken: stored[TOKEN_KEY],
    role: stored[ROLE_KEY] || "employee"
  };
}

async function setSession(accessToken, role) {
  await chrome.storage.local.set({ [TOKEN_KEY]: accessToken, [ROLE_KEY]: role });
}

function localSuggestFallback(payload) {
  const customerText = payload.messages?.at(-1)?.text || "anh/chị";
  return {
    reply_variants: [
      { id: "r1", style: "concise", text: `Dạ em đã nhận thông tin của ${customerText}. Em tư vấn nhanh mẫu phù hợp ngay ạ.` },
      { id: "r2", style: "consultative", text: "Dạ để em gợi ý 2 lựa chọn theo nhu cầu và ngân sách của mình, anh/chị ưu tiên mức giá nào ạ?" },
      { id: "r3", style: "closing", text: "Nếu mình chốt trong hôm nay em xin giữ ưu đãi và hỗ trợ lên đơn ngay cho mình ạ." }
    ],
    product_suggestions: []
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "COPILOT_LOGIN_DEMO") {
    setSession("demo-token", "manager")
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  if (message.type === "COPILOT_SUGGEST") {
    getSession().then(async ({ accessToken }) => {
      if (!accessToken) {
        sendResponse({ ok: false, error: "Bạn chưa đăng nhập nội bộ." });
        return;
      }

      const requestPayload = {
        session_id: crypto.randomUUID(),
        messages: message.payload.messages || [],
        locale: message.payload.locale,
        preferred_tone: message.payload.preferred_tone,
        screen_context: {
          url: message.payload.url,
          title: message.payload.title
        }
      };

      try {
        const response = await fetch(`${API_BASE}/v1/copilot/suggest`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify(requestPayload)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        sendResponse({ ok: true, data });
      } catch (_error) {
        sendResponse({ ok: true, data: localSuggestFallback(requestPayload) });
      }
    });

    return true;
  }
});
