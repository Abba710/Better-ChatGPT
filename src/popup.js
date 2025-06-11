const PROMPT_KEY = "prompts";

document.addEventListener("DOMContentLoaded", function () {
  const promptInput = document.getElementById("promptInput");

  // savePrompt when Enter pressed
  promptInput.addEventListener("keydown", async function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      const prompt = promptInput.value.trim();
      if (prompt) {
        await savePrompt(prompt);
        promptInput.value = ""; // Clear input after saving

        const prompts = await loadPrompts();
        console.log("Prompts:", prompts);
      }
    }
  });

  async function savePrompt(prompt) {
    const prompts = await loadPrompts();
    const newPrompt = {
      isAuto: false,
      value: prompt,
    };
    prompts.push(newPrompt);
    await chrome.storage.local.set({ [PROMPT_KEY]: prompts });
    displayPrompts(); // Refresh the displayed prompts
  }

  async function loadPrompts() {
    const stored = await chrome.storage.local.get(PROMPT_KEY);
    return stored[PROMPT_KEY] || [];
  }

  async function displayPrompts() {
    // Load prompts from storage
    const promptList = await loadPrompts();

    // Get the main list container
    const list = document.getElementById("promtsList");
    list.innerHTML = ""; // Clear the existing list content

    // Iterate over each prompt with its index
    promptList.forEach((prompt, index) => {
      // Create a container div to hold both the delete button and the list item side by side
      const container = document.createElement("div");
      container.className = "flex items-center gap-2 mb-2";
      // flex for horizontal layout, gap for spacing, mb-2 for some margin between rows

      // Create the delete button
      const delBtn = document.createElement("button");
      delBtn.className =
        "h-[32px] min-w-[32px] bg-white/20 rounded-full flex items-center justify-center text-white transition-opacity duration-300 hover:opacity-100 opacity-50";
      delBtn.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
    <path d="M6.5 1a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1H13.5a.5.5 0 0 1 0 1H12v1a.5.5 0 0 1-1 0V2H5v1a.5.5 0 0 1-1 0V2H2.5a.5.5 0 0 1 0-1H6.5ZM4.118 4.5L4 13.5A1.5 1.5 0 0 0 5.5 15h5a1.5 1.5 0 0 0 1.5-1.5L11.882 4.5H4.118Z"/>
  </svg>`;

      // Add click event to delete the prompt from storage and refresh the list
      delBtn.addEventListener("click", async () => {
        const prompts = await loadPrompts();
        prompts.splice(index, 1); // Remove the prompt at current index
        await chrome.storage.local.set({ [PROMPT_KEY]: prompts });
        displayPrompts(); // Refresh the displayed list
        sendPromptToBackground(); // Send updated autoprompts to background
      });

      // Create the list item element
      const li = document.createElement("li");
      li.className =
        "w-full h-[62px] bg-white/8 rounded-[8px] flex flex-row items-center justify-between relative p-3 gap-2";

      // Create the heading element for the prompt text
      const h1 = document.createElement("h1");
      h1.className =
        "font-raleway w-[70%] min-w-0 font-medium text-[16px] overflow-hidden text-white opacity-100 white-space-nowrap text-overflow-ellipsis";
      h1.textContent = prompt.value;

      // Create the label element that will hold the toggle switch
      const label = document.createElement("label");
      label.className =
        "cursor-pointer min-h-[22px] min-w-[52px] rounded-full select-none relative bg-white/20 peer-checked:bg-white transition-colors duration-300";

      // Create the hidden checkbox input
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "peer h-[16px] w-[16px] opacity-0";
      checkbox.checked = prompt.isAuto; // Set initial checkbox state

      // When checkbox toggles, update the prompt state and save to storage
      checkbox.addEventListener("change", async () => {
        prompt.isAuto = checkbox.checked;
        const prompts = await loadPrompts();
        prompts[index] = prompt; // Update the prompt at the same index
        await chrome.storage.local.set({ [PROMPT_KEY]: prompts });
        await sendPromptToBackground(); // Send updated autoprompts to background
      });

      // Create the toggle circle element that moves left/right based on state
      const toggleSpan = document.createElement("span");
      toggleSpan.className =
        "absolute left-[3px] top-1/2 flex h-[16px] w-[16px] -translate-y-1/2 items-center justify-center rounded-full bg-[hsl(0,0%,50%)] duration-300 peer-checked:left-[calc(100%-19px)] peer-checked:bg-white";

      // "MANU" label shown when toggle is off
      const manuSpan = document.createElement("span");
      manuSpan.className =
        "absolute right-[2px] top-1/2 -translate-y-1/2 font-worksans font-semibold text-[10px] text-white/20 pointer-events-none transition-opacity duration-300 peer-checked:opacity-0 opacity-100";
      manuSpan.textContent = "MANU";

      // "AUTO" label shown when toggle is on
      const autoSpan = document.createElement("span");
      autoSpan.className =
        "absolute left-[5px] top-1/2 -translate-y-1/2 font-worksans font-semibold text-[10px] text-white pointer-events-none transition-opacity duration-300 opacity-0 peer-checked:opacity-100";
      autoSpan.textContent = "AUTO";

      // Append checkbox and toggle parts to the label
      label.appendChild(checkbox);
      label.appendChild(toggleSpan);
      label.appendChild(manuSpan);
      label.appendChild(autoSpan);

      // Append prompt text and toggle label to the list item
      li.appendChild(h1);
      li.appendChild(label);

      // Append delete button and list item to the container div
      li.appendChild(delBtn);
      container.appendChild(li);

      // Append the container div to the main list
      list.appendChild(container);
    });
  }

  async function sendPromptToBackground() {
    const promptList = await loadPrompts();
    const autoData = [];

    promptList.forEach((prompt) => {
      if (prompt.isAuto) {
        autoData.push(prompt.value);
      }
    });

    console.log("Sending autoprompts to background:", autoData);
    // Send all autoprompts at once
    chrome.runtime.sendMessage({ action: "loadData", data: autoData });
  }

  // Call displayPrompts when the window loads
  window.onload = displayPrompts;
  sendPromptToBackground();
});
