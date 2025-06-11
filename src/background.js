chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "loadData" && message.data) {
    getCurrentTabId().then((tabId) => {
      console.log("Background received autoprompts:", message.data);
      chrome.tabs.sendMessage(tabId, {
        action: "loadDataInChat",
        data: message.data,
      });
    });
  }
});

async function getCurrentTabId() {
  let queryOptions = { active: true, lastFocusedWindow: true }; // Query options to find the last focused active tab
  let [tab] = await chrome.tabs.query(queryOptions); // Get the tab that matches the query
  return tab.id; // Return the ID of the tab
}
