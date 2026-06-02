// Focus Guard — Background Script
// Intercepts navigation to blocked sites and redirects to block page

(function () {
  "use strict";

  const DEFAULT_BLOCKED = [
    "facebook.com",
    "twitter.com",
    "x.com",
    "instagram.com",
    "tiktok.com",
    "reddit.com",
    "youtube.com",
    "netflix.com",
    "twitch.tv",
  ];

  // ── Storage helpers ──
  function getBlockedSites() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ blockedSites: DEFAULT_BLOCKED }, (data) => {
        resolve(data.blockedSites);
      });
    });
  }

  function saveBlockedSites(sites) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ blockedSites: sites }, resolve);
    });
  }

  function isBlocked(url) {
    try {
      const hostname = new URL(url).hostname.replace("www.", "");
      return getBlockedSites().then((sites) => {
        return sites.some((site) => {
          const clean = site.replace("www.", "").toLowerCase();
          return hostname === clean || hostname.endsWith("." + clean);
        });
      });
    } catch {
      return Promise.resolve(false);
    }
  }

  function getBlockPageUrl(originalUrl) {
    return chrome.runtime.getURL(
      "block.html?url=" + encodeURIComponent(originalUrl)
    );
  }

  // Check if URL has our bypass token (user confirmed via block page)
  function hasBypassToken(url) {
    try {
      const u = new URL(url);
      return u.searchParams.get("fg_confirmed") === "1";
    } catch { return false; }
  }

  // ── Intercept navigation ──
  // Use webNavigation.onBeforeNavigate for reliable interception
  chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    // Only check main frame (not iframes)
    if (details.frameId !== 0) return;

    // Skip our own block page and settings
    if (details.url.includes("block.html") || details.url.includes("popup.html")) return;

    // If user confirmed via block page, allow through (strip token)
    if (hasBypassToken(details.url)) {
      try {
        const u = new URL(details.url);
        u.searchParams.delete("fg_confirmed");
        const cleanUrl = u.toString();
        if (cleanUrl !== details.url) {
          chrome.tabs.update(details.tabId, { url: cleanUrl });
        }
      } catch {}
      return;
    }

    const blocked = await isBlocked(details.url);
    if (blocked) {
      chrome.tabs.update(details.tabId, {
        url: getBlockPageUrl(details.url),
      });
    }
  });

  // ── Message handler for popup/settings ──
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "getBlockedSites") {
      getBlockedSites().then((sites) => sendResponse({ sites }));
      return true; // async
    }
    if (msg.action === "saveBlockedSites") {
      saveBlockedSites(msg.sites).then(() => sendResponse({ ok: true }));
      return true;
    }
    if (msg.action === "isBlocked") {
      isBlocked(msg.url).then((blocked) => sendResponse({ blocked }));
      return true;
    }
    if (msg.action === "getBlockPageUrl") {
      sendResponse({ url: getBlockPageUrl(msg.url) });
      return true;
    }
  });

  // ── Install: set defaults ──
  chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get({ blockedSites: null }, (data) => {
      if (data.blockedSites === null) {
        chrome.storage.sync.set({ blockedSites: DEFAULT_BLOCKED });
      }
    });
  });

  console.log("Focus Guard installed");
})();
