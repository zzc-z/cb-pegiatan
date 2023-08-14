<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { _ } from "../services/i18n";
  import CircumIcon from "@klarr-agency/circum-icons-svelte";
  import GamepadIndicator from "./GamepadIndicator.svelte";
  import Dialog from "./Dialog.svelte";

  let completedTasks = parseInt(localStorage.getItem("completedTasks")) || 0;
  let userName = "";
  let userLevel = 0;
  let dialog;
  let newItem = "";
  let newDescription = "";
  let error = "";
  let gamepad;
  let focusedElementIndex = 0; // Index of the currently focused element
  let elements;
  let aButtonWasPressed;
  let tasksToNextLevel = 3;

  function saveName() {
    localStorage.setItem("userName", userName);
  }

  // Add a flag to track if we have already moved focus
  let hasMovedFocus = false;

  onMount(() => {
    const storedTasks = localStorage.getItem("todoList");
    if (storedTasks) {
      todoList = JSON.parse(storedTasks);
      completedTasks = todoList.filter((item) => item.status).length;
      calculateUserLevel(completedTasks);
    }

    // Check if the browser supports the Gamepad API
    if (!("getGamepads" in navigator)) {
      console.error("Gamepad API is not supported in this browser.");
      return;
    }

    console.log("Gamepad API is supported.");

    // Get the list of focusable elements
    elements = document.querySelectorAll(".focusable");

    // Start polling the gamepad state
    requestAnimationFrame(pollGamepad);
  });

  function pollGamepad() {
    // Get the list of connected gamepads
    const gamepads = navigator.getGamepads();

    // Use the first gamepad found
    gamepad = gamepads[0];

    if (gamepad) {
      // Map gamepad inputs to UI navigation
      const yAxis = gamepad.axes[1];
      const aButton = gamepad.buttons[0];

      // If the thumbstick is in the "neutral" position, reset the flag
      if (Math.abs(yAxis) < 0.1) {
        hasMovedFocus = false;
      }

      // Set focus to the next or previous element based on gamepad input
      if (yAxis > 0.5 && !hasMovedFocus) {
        // Move focus downward
        hasMovedFocus = true;
        handleNavigation(1);
        console.log("down");
        playNavigationSound();
      } else if (yAxis < -0.5 && !hasMovedFocus) {
        // Move focus upward
        hasMovedFocus = true;
        handleNavigation(-1);
        console.log("up");
        playNavigationSound();
      }

      // Handle A button press as Enter key press
      if (aButton.pressed && !aButtonWasPressed) {
        elements[focusedElementIndex]?.click();
        aButtonWasPressed = true;
      } else if (!aButton.pressed) {
        // Reset the flag if the A button is released
        aButtonWasPressed = false;
      }
    }

    // Continue polling gamepad state
    requestAnimationFrame(pollGamepad);
  }

  function handleNavigation(direction) {
    focusedElementIndex =
      (focusedElementIndex + direction + elements.length) % elements.length;
    elements[focusedElementIndex]?.focus();
  }

  // Function to load tasks data from localStorage
  function loadTodoListFromLocalStorage() {
    const storedDataString = localStorage.getItem("todoList");

    if (storedDataString) {
      // Convert the string back to JSON
      return JSON.parse(storedDataString);
    } else {
      // If no data is found in localStorage, return an empty array
      return [];
    }
  }

  // Initialize todoList with data from localStorage
  let todoList = loadTodoListFromLocalStorage();

  // Function to save tasks data to localStorage
  function saveTodoListToLocalStorage() {
    const todoListDataString = JSON.stringify(todoList);
    localStorage.setItem("todoList", todoListDataString);
  }

  function addToList() {
    // Trim any leading and trailing whitespaces from the title and description
    const trimmedTitle = newItem.trim();
    const trimmedDescription = newDescription.trim();

    // Check if both title and description are empty
    if (!trimmedTitle && !trimmedDescription) {
      // Prevent adding empty to-do items
      error = "";
      return;
    }

    // Check if only the title is provided
    if (trimmedTitle && !trimmedDescription) {
      // Ask the user to provide the description as well
      error = $_("error.description");
      document.getElementById("errorSound")?.play();
      return;
    }

    // Check if only the description is provided
    if (!trimmedTitle && trimmedDescription) {
      // Ask the user to provide the title as well
      error = $_("error.title");
      document.getElementById("errorSound")?.play();
      return;
    }

    document.getElementById("addSound")?.play();

    // If both title and description are provided, add the new task
    error = "";
    todoList = [
      ...todoList,
      { text: trimmedTitle, description: trimmedDescription, status: false },
    ];
    newItem = "";
    newDescription = ""; // Clear the input fields after adding a new task

    // Save updated todoList to localStorage after adding an item
    saveTodoListToLocalStorage();
  }

  function removeFromList(index) {
    todoList = todoList.filter((item, i) => i !== index);

    // Save updated todoList to localStorage after removing an item
    saveTodoListToLocalStorage();
    updateCompletedTasks();
  }

  function playNavigationSound() {
    const navigationSound = new Audio("/sfx/navigate.ogg");
    navigationSound.currentTime = 0; // Reset playback position to start from the beginning
    navigationSound.play();
  }

  function playCompleteSound() {
    const completeSound = new Audio("/sfx/complete.ogg");
    completeSound.currentTime = 0; // Reset playback position to start from the beginning
    completeSound.play();
  }

  function playRewardSound() {
    const rewardSound = new Audio("/sfx/reward.ogg");
    rewardSound.currentTime = 0; // Reset playback position to start from the beginning
    rewardSound.play();
  }

  function exportToJson() {
    const jsonContent = JSON.stringify(todoList);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pegiatan-backup-" + Date.now() + ".json";
    link.click();
  }

  function importFromJson(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const importedData = JSON.parse(event.target.result);
        todoList = importedData;
      };
      reader.readAsText(file);
    }
  }

  function exportToCsv() {
    const csvContent =
      "data:text/csv;charset=utf-8," + encodeURIComponent(todoListToCsv());
    const link = document.createElement("a");
    link.href = csvContent;
    link.download = "todo-list-" + Date.new() + ".csv";
    link.click();
  }

  function todoListToCsv() {
    const header = ["Task", "Description", "Status"];
    const rows = todoList.map((item) => [
      item.text,
      item.description,
      item.status ? "Complete" : "Incomplete",
    ]);
    return [header, ...rows].map((row) => row.join(",")).join("\n");
  }

  // Function to calculate user level
  function calculateUserLevel(tasks) {
    // Calculate the level based on the number of completed tasks
    userLevel = Math.floor(tasks / 3); // Level up after every 3 completed tasks
  }

  // Function to update completed tasks and user level
  function updateCompletedTasks() {
    completedTasks = todoList.filter((item) => item.status).length;
    calculateUserLevel(completedTasks);

    // Save updated completed tasks and todoList to localStorage
    localStorage.setItem("completedTasks", completedTasks.toString());
    localStorage.setItem("todoList", JSON.stringify(todoList));
  }

  // Function to mark a task as complete
  function markTaskAsComplete(index) {
    todoList[index].status = true;
    updateCompletedTasks();
  }

  // Function to mark a task as incomplete
  function markTaskAsIncomplete(index) {
    todoList[index].status = false;
    updateCompletedTasks();
  }

  let currentTime = new Date().getHours();
  let greeting = $_("app.welcome");

  if (currentTime >= 0 && currentTime < 12) {
    greeting = $_("app.welcome.morning");
  } else if (currentTime >= 12 && currentTime < 17) {
    greeting = $_("app.welcome.afternoon");
  } else if (currentTime >= 17 && currentTime < 20) {
    greeting = $_("app.welcome.evening");
  } else {
    greeting = $_("app.welcome.night");
  }
</script>

<span class="flex flex-row content-center my-2 select-none">
  <img width="30" height="30" alt="Pegiatan icon" src="./icons/icon.svg" />
  <p class="mx-2"><b>pegiatan</b></p>
  <button
    on:click={() => dialog.showModal()}
    aria-label={$_("app.settings")}
    class="ml-auto rounded-full bg-gray-100 dark:bg-gray-500 py-1 px-2 focus:outline-none focus:ring focus:ring-blue-300 focusable"
    ><CircumIcon name="settings" size="16" /></button
  >
  <div class="ml-1 rounded-full bg-gray-100 dark:bg-gray-500 py-1">
    <a
      class="rounded-full py-1 px-2 dark:text-blue-200 focus:outline-none focus:ring focus:ring-blue-300 focusable"
      href="https://codeberg.org/Linerly/pegiatan"
      target="_blank"
      rel="noreferrer">1.0.0</a
    >
  </div>
</span>

<Dialog bind:dialog on:close={() => console.log("closed")}>
  <p class="text-3xl"><b>{$_("app.settings")}</b></p>
  <br />

  <div class="bg-slate-200 dark:bg-slate-800 p-2 rounded-xl">
    <p class="text-2xl"><b>{$_("app.settings.you")}</b></p>
    <hr class="my-2" />
    <form class="flex flex-col my-2" on:submit|preventDefault={saveName}>
      <label for="name">{$_("app.settings.you.name")}</label>
      <p><b>{$_("app.settings.you.reload")}</b></p>
      <input
        class="my-2 rounded-full focus:outline-none focus:ring focus:ring-blue-300"
        type="text"
        id="name"
        bind:value={userName}
        required
      />
      <button
        class="uppercase rounded-full focus:outline-none focus:ring focus:ring-blue-300"
        type="submit">{$_("app.settings.you.save")}</button
      >
    </form>
  </div>
  <br />
  <div class="bg-slate-200 dark:bg-slate-800 p-2 rounded-xl">
    <p class="text-2xl my-2"><b>{$_("app.settings.data")}</b></p>
    <hr class="my-2" />
    <div class="flex flex-col">
      <label for="file" class="text-2xl"
        >{$_("app.settings.data.import_backup")}
        <code class="bg-slate-300 dark:bg-slate-700">JSON</code></label
      >
      <p><b>{$_("app.settings.data.overwrite")}</b></p>
      <input
        class="my-2"
        type="file"
        accept=".json"
        on:change={importFromJson}
      />
    </div>

    <p class="text-2xl my-2">{$_("app.settings.data.export_data")}</p>
    <button
      class="p-3 my-2 rounded-xl focus:outline-none focus:ring focus:ring-blue-300"
      on:click={exportToCsv}
      >{$_("app.settings.data.export_data.tasks")}
      <code class="bg-slate-300 dark:bg-slate-700">CSV</code></button
    >
    <button
      class="p-3 my-2 rounded-xl focus:outline-none focus:ring focus:ring-blue-300"
      on:click={exportToJson}
      >{$_("app.settings.data.export_data.backup")}
      <code class="bg-slate-300 dark:bg-slate-700">JSON</code></button
    >
  </div>
</Dialog>

<span class="flex flex-row content-center my-8 select-none">
  <span class="flex flex-col content-center">
    <p>{greeting},</p>
    <p class="my-2 text-2xl">
      <b>{localStorage.getItem("userName") || "Guest"}</b>
    </p>
  </span>

  <p
    class="ml-auto rounded-full bg-blue-200 dark:bg-blue-800 p-6 px-8"
    aria-label="Level"
    on:change={() => {
      if (userLevel >= 1) {
        playRewardSound();
      }
    }}
  >
    {userLevel}
  </p>
</span>

<span class="flex flex-col">
  <input
    class="p-4 rounded-t-xl focusable bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring focus:ring-blue-300"
    bind:value={newItem}
    type="text"
    placeholder={$_("task.create.title")}
  />
  <input
    class="p-4 focusable bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring focus:ring-blue-300"
    bind:value={newDescription}
    type="text"
    placeholder={$_("task.create.description")}
  />
  <button
    class="flex-row content-center w-full p-2 rounded-b-xl px-auto focusable focus:outline-none focus:ring focus:ring-blue-300"
    on:click={addToList}
    ><span class="flex content-center"
      ><CircumIcon class="mx-2" name="square_plus" />
      <p class="p-1 uppercase">{$_("add")}</p></span
    ></button
  >
</span>

{#if error}
  <br />
  <p
    class="select-none text-white-500 bg-red-200 dark:bg-red-800 p-2 rounded-xl text-center"
  >
    <i>{error}</i>
  </p>
{/if}

<br />

<ul class="focusable">
  {#each todoList as item, index}
    <li transition:fade class="bg-slate-100 dark:bg-slate-600 rounded-xl">
      <div class="flex flex-row items-center px-3 py-3">
        <input
          class="h-8 w-8 focusable text-indigo-600 border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
          bind:checked={item.status}
          type="checkbox"
          on:change={() => {
            if (item.status) {
              markTaskAsComplete(index);
              playCompleteSound();
            } else {
              markTaskAsIncomplete(index);
            }
          }}
        />
        <p class:checked={item.status} class="text-3xl px-3">
          <b>{item.text}</b>
        </p>
      </div>
      <p class:checked={item.status} class="text-xl px-3 py-2">
        <i>{item.description}</i>
      </p>
      <button
        class="flex-row content-center w-full p-2 rounded-b-xl px-auto focusable focus:outline-none focus:ring focus:ring-blue-300"
        on:click={() => removeFromList(index)}
        ><span class="flex content-center"
          ><CircumIcon name="square_remove" />
          <p class="p-1 uppercase">{$_("delete")}</p></span
        ></button
      >
    </li>
    <br />
  {/each}
  {#if todoList == false}
    <div
      transition:fade={{ delay: 250, duration: 300 }}
      class="flex flex-col items-center select-none"
    >
      <img class="my-8" alt="No tasks" src="./assets/no-tasks.svg" />
      <p class="select-none text-xl"><b>{$_("task.empty.title")}</b></p>
      <p class="select-none"><i>{$_("task.empty.description")}</i></p>
    </div>
  {/if}
</ul>

<audio id="newSound">
  <source src="/sfx/new.ogg" type="audio/ogg" />
</audio>
<audio id="errorSound">
  <source src="/sfx/error.ogg" type="audio/ogg" />
</audio>

<GamepadIndicator {gamepad} />
