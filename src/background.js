chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === "reload_tab" && sender.tab?.id) {
    chrome.tabs.reload(sender.tab.id);
  }
});
