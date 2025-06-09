(function () {
  let AUTOPROMPT = "";
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "loadDataInChat" && message.data) {
      AUTOPROMPT = message.data;
    }
  });
  // Get the editable div where user types the prompt
  function getPromptDiv() {
    return document.getElementById("prompt-textarea");
  }

  // Get the send button element by its ID
  function getSendButton() {
    return document.getElementById("composer-submit-button");
  }

  // Append the autoprompt text to the current prompt if it's not already there
  function updatePromptWithAutoPrompt(promptDiv) {
    promptDiv.focus();
    let text = promptDiv.textContent || "";

    if (!text.endsWith(AUTOPROMPT.trim())) {
      promptDiv.textContent = text + AUTOPROMPT;

      // Dispatch an input event so the ProseMirror editor recognizes the change
      const event = new InputEvent("input", { bubbles: true });
      promptDiv.dispatchEvent(event);
    }
  }

  // Listen for Enter key press (without Shift)
  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default Enter behavior (e.g., new line or submit)

      const promptDiv = getPromptDiv();
      if (!promptDiv) return;

      updatePromptWithAutoPrompt(promptDiv);

      const sendButton = getSendButton();
      if (sendButton) {
        // Wait a short moment for the editor to update, then click send
        setTimeout(() => {
          sendButton.click();
        }, 50);
      }
    }
  }

  // Initialize: add event listener to the prompt div once page loads
  function init() {
    const promptDiv = getPromptDiv();
    if (!promptDiv) return;

    // Use capture phase to catch keydown event early
    promptDiv.addEventListener("keydown", onKeyDown, true);
  }

  // Wait for the page to fully load, then initialize after a short delay
  window.addEventListener("load", () => setTimeout(init, 1000));
})();
