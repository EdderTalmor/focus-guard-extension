// Focus Guard — Popup Script
// Manage blocked sites list

(function () {
  "use strict";

  const PRESETS = [
    "facebook.com", "twitter.com", "x.com", "instagram.com",
    "tiktok.com", "reddit.com", "youtube.com", "netflix.com",
    "twitch.tv", "discord.com", "pinterest.com", "snapchat.com",
    "threads.net", "linkedin.com", "news.ycombinator.com",
  ];

  let blockedSites = [];

  // ── Load sites ──
  function loadSites() {
    chrome.runtime.sendMessage({ action: "getBlockedSites" }, (response) => {
      if (response && response.sites) {
        blockedSites = response.sites;
        renderList();
        renderPresets();
        updateCount();
      }
    });
  }

  // ── Render site list ──
  function renderList() {
    const list = document.getElementById("site-list");

    if (blockedSites.length === 0) {
      list.innerHTML = `
        <div class="empty">
          <div class="empty-icon">✨</div>
          No sites blocked yet.<br>Add one below!
        </div>
      `;
      return;
    }

    list.innerHTML = blockedSites
      .map(
        (site) => `
      <div class="site-item">
        <div class="site-info">
          <div class="site-icon">🚫</div>
          <div class="site-name">${escapeHtml(site)}</div>
        </div>
        <button class="remove-btn" data-site="${escapeHtml(site)}" title="Remove">✕</button>
      </div>
    `
      )
      .join("");

    // Remove handlers
    list.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const site = btn.dataset.site;
        blockedSites = blockedSites.filter((s) => s !== site);
        saveSites();
      });
    });
  }

  // ── Render presets ──
  function renderPresets() {
    const container = document.getElementById("presets");
    container.innerHTML = PRESETS.map((site) => {
      const isBlocked = blockedSites.includes(site);
      return `<span class="preset-chip ${isBlocked ? "blocked" : ""}" data-site="${site}">${site}</span>`;
    }).join("");

    container.querySelectorAll(".preset-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const site = chip.dataset.site;
        if (blockedSites.includes(site)) {
          blockedSites = blockedSites.filter((s) => s !== site);
        } else {
          blockedSites.push(site);
        }
        saveSites();
      });
    });
  }

  // ── Save sites ──
  function saveSites() {
    chrome.runtime.sendMessage(
      { action: "saveBlockedSites", sites: blockedSites },
      () => {
        renderList();
        renderPresets();
        updateCount();
      }
    );
  }

  // ── Update count ──
  function updateCount() {
    const count = blockedSites.length;
    document.getElementById("site-count").textContent =
      count === 0
        ? "No sites blocked"
        : count === 1
        ? "1 site blocked"
        : count + " sites blocked";
  }

  // ── Add site ──
  function addSite() {
    const input = document.getElementById("add-input");
    let site = input.value.trim().toLowerCase();

    // Clean up URL if user pasted one
    site = site.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");

    if (!site || site.includes(" ") || !site.includes(".")) return;
    if (blockedSites.includes(site)) {
      input.value = "";
      return;
    }

    blockedSites.push(site);
    input.value = "";
    saveSites();
  }

  // ── Helpers ──
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Init ──
  document.getElementById("add-btn").addEventListener("click", addSite);
  document.getElementById("add-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") addSite();
  });

  loadSites();
})();
