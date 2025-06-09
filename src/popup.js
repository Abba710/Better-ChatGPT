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
    const promptList = await loadPrompts(); // Load prompts from storage
    const list = document.getElementById("promtsList");
    list.innerHTML = ""; // Clear existing list

    promptList.forEach((prompt, index) => {
      const li = document.createElement("li");
      li.className =
        "w-full h-[62px] bg-white/8 rounded-[8px] flex flex-row items-center justify-between relative p-3 gap-2";

      // Create a heading element for the prompt text
      const h1 = document.createElement("h1");
      h1.className =
        "font-raleway font-medium text-[16px] text-wrap text-white opacity-100";
      h1.textContent = prompt.value;

      // Create the label element that styles the toggle switch
      const label = document.createElement("label");
      label.className =
        "cursor-pointer min-h-[22px] min-w-[52px] rounded-full select-none relative bg-white/20 peer-checked:bg-white transition-colors duration-300";

      // Create the hidden checkbox input
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "peer h-[16px] w-[16px] opacity-0";
      checkbox.checked = prompt.isAuto; // Set checkbox state based on prompt.isAuto

      // Create the toggle circle element
      const toggleSpan = document.createElement("span");
      toggleSpan.className =
        "absolute left-[3px] top-1/2 flex h-[16px] w-[16px] -translate-y-1/2 items-center justify-center rounded-full bg-[hsl(0,0%,50%)] duration-300 peer-checked:left-[calc(100%-19px)] peer-checked:bg-white";

      // "MANU" text shown when toggle is off
      const manuSpan = document.createElement("span");
      manuSpan.className =
        "absolute right-[2px] top-1/2 -translate-y-1/2 font-worksans font-semibold text-[10px] text-white/20 pointer-events-none transition-opacity duration-300 peer-checked:opacity-0 opacity-100";
      manuSpan.textContent = "MANU";

      // "AUTO" text shown when toggle is on
      const autoSpan = document.createElement("span");
      autoSpan.className =
        "absolute left-[5px] top-1/2 -translate-y-1/2 font-worksans font-semibold text-[10px] text-white pointer-events-none transition-opacity duration-300 opacity-0 peer-checked:opacity-100";
      autoSpan.textContent = "AUTO";

      // Append all toggle parts to the label
      label.appendChild(checkbox);
      label.appendChild(toggleSpan);
      label.appendChild(manuSpan);
      label.appendChild(autoSpan);

      // Append the prompt text and toggle to the list item
      li.appendChild(h1);
      li.appendChild(label);

      // Append the list item to the main list
      list.appendChild(li);
    });
  }
  async function displayPrompts() {
    const promptList = await loadPrompts(); // Load prompts from storage
    const list = document.getElementById("promtsList");
    list.innerHTML = ""; // Clear existing list

    promptList.forEach((prompt, index) => {
      const li = document.createElement("li");
      li.className =
        "w-full h-[62px] bg-white/8 rounded-[8px] flex flex-row items-center justify-between relative p-3 gap-2";

      // Create a heading element for the prompt text
      const h1 = document.createElement("h1");
      h1.className =
        "font-raleway font-medium text-[16px] text-wrap text-white opacity-100";
      h1.textContent = prompt.value;

      // Create the label element that styles the toggle switch
      const label = document.createElement("label");
      label.className =
        "cursor-pointer min-h-[22px] min-w-[52px] rounded-full select-none relative bg-white/20 peer-checked:bg-white transition-colors duration-300";

      // Create the hidden checkbox input
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "peer h-[16px] w-[16px] opacity-0";
      checkbox.checked = prompt.isAuto; // Set checkbox state based on prompt.isAuto
      checkbox.addEventListener("change", async () => {
        // Update the prompt's isAuto state when the checkbox is toggled
        prompt.isAuto = checkbox.checked;
        const prompts = await loadPrompts();
        prompts[index] = prompt; // Update the specific prompt
        await chrome.storage.local.set({ [PROMPT_KEY]: prompts });
      });

      // Create the toggle circle element
      const toggleSpan = document.createElement("span");
      toggleSpan.className =
        "absolute left-[3px] top-1/2 flex h-[16px] w-[16px] -translate-y-1/2 items-center justify-center rounded-full bg-[hsl(0,0%,50%)] duration-300 peer-checked:left-[calc(100%-19px)] peer-checked:bg-white";

      // "MANU" text shown when toggle is off
      const manuSpan = document.createElement("span");
      manuSpan.className =
        "absolute right-[2px] top-1/2 -translate-y-1/2 font-worksans font-semibold text-[10px] text-white/20 pointer-events-none transition-opacity duration-300 peer-checked:opacity-0 opacity-100";
      manuSpan.textContent = "MANU";

      // "AUTO" text shown when toggle is on
      const autoSpan = document.createElement("span");
      autoSpan.className =
        "absolute left-[5px] top-1/2 -translate-y-1/2 font-worksans font-semibold text-[10px] text-white pointer-events-none transition-opacity duration-300 opacity-0 peer-checked:opacity-100";
      autoSpan.textContent = "AUTO";

      // Append all toggle parts to the label
      label.appendChild(checkbox);
      label.appendChild(toggleSpan);
      label.appendChild(manuSpan);
      label.appendChild(autoSpan);

      // Append the prompt text and toggle to the list item
      li.appendChild(h1);
      li.appendChild(label);

      // Append the list item to the main list
      list.appendChild(li);
    });
  }

  window.onload = displayPrompts;
});
