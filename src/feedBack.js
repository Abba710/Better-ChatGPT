const FEEDBACK_DISABLED_KEY = "feedbackDisabled";
const CHROME_STORE_URL = "*";
// Feedback dialog functions
export function initializeFeedback() {
  const dialog = document.getElementById("feedbackDialog");
  const dialogContent = dialog.querySelector("div");

  // Review button
  document.getElementById("feedbackReview").addEventListener("click", () => {
    chrome.storage.local.set({ [FEEDBACK_DISABLED_KEY]: true }, () => {
      window.open(CHROME_STORE_URL, "_blank");
      hideFeedbackDialog();
    });
  });

  // Later button
  document
    .getElementById("feedbackLater")
    .addEventListener("click", hideFeedbackDialog);

  // Never button
  document.getElementById("feedbackNever").addEventListener("click", () => {
    chrome.storage.local.set(
      { [FEEDBACK_DISABLED_KEY]: true },
      hideFeedbackDialog
    );
  });

  // Handle click outside the dialog
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      hideFeedbackDialog();
    }
  });
}

function showFeedbackDialog() {
  const dialog = document.getElementById("feedbackDialog");
  const dialogContent = dialog.querySelector("div");

  dialog.classList.remove("hidden");
  dialog.classList.add("flex");

  // Trigger animation
  requestAnimationFrame(() => {
    dialogContent.classList.remove("scale-95", "opacity-0");
    dialogContent.classList.add("scale-100", "opacity-100");
  });
}

function hideFeedbackDialog() {
  const dialog = document.getElementById("feedbackDialog");
  const dialogContent = dialog.querySelector("div");

  dialogContent.classList.remove("scale-100", "opacity-100");
  dialogContent.classList.add("scale-95", "opacity-0");

  setTimeout(() => {
    dialog.classList.remove("flex");
    dialog.classList.add("hidden");
  }, 300); // Match the duration in the CSS transition
}

export async function callFeedBack(promptList) {
  const result = await chrome.storage.local.get([FEEDBACK_DISABLED_KEY]);
  if (
    !result[FEEDBACK_DISABLED_KEY] &&
    promptList.length > 0 &&
    promptList.length % 5 === 0
  ) {
    showFeedbackDialog();
  }
}
