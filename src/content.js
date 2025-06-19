(async function () {
  const PROMPT_KEY = "prompts";
  let AUTOPROMPT = ""; // Holds the auto-prompt text

  console.log("Better GPT content script loaded");

  // Load saved prompts from local storage
  async function loadPrompts() {
    try {
      const stored = await chrome.storage.local.get(PROMPT_KEY);
      return stored[PROMPT_KEY] || [];
    } catch (error) {
      chrome.runtime.sendMessage({ action: "reload_tab" });
      return [];
    }
  }

  // Update AUTOPROMPT with current auto prompts
  async function updateAutoprompt() {
    const promptList = await loadPrompts();
    AUTOPROMPT = promptFilter(promptList);
    console.log("Loaded autoprompts:", AUTOPROMPT);
  }

  // Filter prompts marked as "auto" and join them into a string
  function promptFilter(unfilteredPrompts) {
    return unfilteredPrompts
      .filter((prompt) => prompt.isAuto)
      .map((prompt) => prompt.value)
      .join(", ");
  }

  // Get the editable div where the user types the prompt
  function getPromptDiv() {
    return document.getElementById("prompt-textarea");
  }

  // Get the send button element
  function getSendButton() {
    return document.getElementById("composer-submit-button");
  }

  // Append AUTOPROMPT to the current prompt if it's not already there
  function updatePromptWithAutoPrompt(promptDiv) {
    promptDiv.focus();
    const currentText = promptDiv.textContent || "";

    if (!currentText.endsWith(AUTOPROMPT)) {
      promptDiv.textContent = currentText + " instruction: " + AUTOPROMPT;

      // Dispatch an input event so the editor recognizes the change
      const event = new InputEvent("input", { bubbles: true });
      promptDiv.dispatchEvent(event);
    }
  }

  // Handle Enter key press (without Shift)
  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const promptDiv = getPromptDiv();
      if (!promptDiv) return;

      updatePromptWithAutoPrompt(promptDiv);

      const sendButton = getSendButton();
      if (sendButton) {
        setTimeout(() => {
          sendButton.click();
        }, 50);
      }
    }
  }

  // Initialize key listener
  function init() {
    const promptDiv = getPromptDiv();
    if (!promptDiv) return;

    promptDiv.addEventListener("keydown", onKeyDown, true);
  }

  // Watch for URL changes (e.g., switching between chats)
  let lastUrl = location.href;

  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      if (currentUrl.includes("/")) {
        console.log("Chat changed:", currentUrl);
        updateAutoprompt().then(() => {
          waitForPromptDiv(init);
        });
      }
    }
  }).observe(document, { subtree: true, childList: true });

  // Handle messages from the extension
  chrome.storage.onChanged.addListener(() => {
    updateAutoprompt().then(() => {
      console.log("Autoprompt updated");
    });
  });

  function waitForPromptDiv(callback) {
    const observer = new MutationObserver(() => {
      const promptDiv = getPromptDiv();
      if (promptDiv) {
        observer.disconnect();
        callback(promptDiv);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  waitForPromptDiv(() => {
    init();
  });

  // Initial setup after page load
  window.addEventListener("load", async () => {
    await updateAutoprompt();
    init();
  });
})();
