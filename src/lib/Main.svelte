<script lang="ts">
  let newItem = '';
  let newDescription = '';
  let error = '';

  import { fade } from 'svelte/transition';
  import { _ } from '../services/i18n';
  import CircumIcon from "@klarr-agency/circum-icons-svelte";

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
      error = ''
      return;
    }

    // Check if only the title is provided
    if (trimmedTitle && !trimmedDescription) {
      // Ask the user to provide the description as well
      error = $_('error.description')
      document.getElementById("errorSound")?.play();
      return;
    }

    // Check if only the description is provided
    if (!trimmedTitle && trimmedDescription) {
      // Ask the user to provide the title as well
      error = $_('error.title')
      document.getElementById("errorSound")?.play();
      return;
    }

    document.getElementById("addSound")?.play();

    // If both title and description are provided, add the new task
    error = ''
    todoList = [...todoList, { text: trimmedTitle, description: trimmedDescription, status: false }];
    newItem = '';
    newDescription = ''; // Clear the input fields after adding a new task

    // Save updated todoList to localStorage after adding an item
    saveTodoListToLocalStorage();
  }

  function removeFromList(index) {
    todoList = todoList.filter((item, i) => i !== index);
    // Save updated todoList to localStorage after removing an item
    saveTodoListToLocalStorage();
  }

  // function playNavigationSound() {
  //   const navigationSound = new Audio("/sfx/navigate.ogg");
  //   navigationSound.currentTime = 0; // Reset playback position to start from the beginning
  //   navigationSound.play();
  // }
</script>

    <span class="flex flex-col">
      <input class="p-4 rounded-t-xl" bind:value={newItem} type="text" placeholder="{$_('task.create.title')}">
      <input class="p-4" bind:value={newDescription} type="text" placeholder="{$_('task.create.description')}">
      <button class="flex-row content-center w-full p-2 rounded-b-xl px-auto" on:click={addToList}><span class="flex content-center"><CircumIcon class="mx-2" name="square_plus"/><p class="p-1 uppercase">{$_('add')}</p></span></button>
  </span>
  
  
  {#if error}
    <br>
    <p class="text-white-500 bg-red-800 p-2 rounded-xl" transition:fade={{ delay: 250, duration: 100 }}><i>{error}</i></p>
    
  {/if}
  
  <br/>
  
  <ul>
    {#each todoList as item, index}
      <li transition:fade={{ delay: 250, duration: 300 }} class="bg-slate-100 dark:bg-slate-600 rounded-xl">
        <div class="flex flex-row items-center px-3 py-3">
          <input class="h-8 w-8" bind:checked={item.status} type="checkbox">
          <p class:checked={item.status} class="text-3xl px-3"><b>{item.text}</b></p>
          {#await item.status then }
            <script lang="ts">
              completeSound = document.getElementById("completeSound") as HTMLAudioElement;
              completeSound.currentTime = 0; // Reset playback position to start from the beginning
              completeSound.play();
            </script>
          {/await }
        </div>
        <p class:checked={item.status} class="text-xl px-3 py-2"><i>{item.description}</i></p>
        <button class="flex-row content-center w-full p-2 rounded-b-xl px-auto" on:click={() => removeFromList(index)}><span class="flex content-center"><CircumIcon name="square_remove"/><p class="p-1 uppercase">{$_('delete')}</p></span></button>
      </li>
      <br/>
    {/each}
    {#if todoList == false}
    <div transition:fade={{ delay: 250, duration: 300 }} class="flex flex-col items-center">
      <p class="text-xl"><b>{$_('task.empty.title')}</b></p>
      <p><i>{$_('task.empty.description')}</i></p>
    </div>
    {/if}
  </ul>


<audio id="newSound">
  <source src="/sfx/new.ogg" type="audio/ogg">
</audio>
<audio id="completeSound">
  <source src="/sfx/complete.ogg" type="audio/ogg">
</audio>
<audio id="errorSound">
  <source src="/sfx/error.ogg" type="audio/ogg">
</audio>