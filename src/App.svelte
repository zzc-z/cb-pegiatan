<script lang="ts">
  import Main from "./lib/Main.svelte";
  import { fade } from "svelte/transition";
  import {
    setupI18n,
    isLocaleLoaded,
    getLocaleFromNavigator,
  } from "./services/i18n";
  import { _ } from "./services/i18n";
  $: if (!$isLocaleLoaded) {
    setupI18n({ withLocale: getLocaleFromNavigator() });
  }
</script>

<main>
  {#if $isLocaleLoaded}
    <div transition:fade>
      <Main />
    </div>
  {:else}
    <img
      width="15%"
      height="15%"
      style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"
      alt="Pegiatan"
      src="icons/icon.svg"
      transition:fade
    />
  {/if}
</main>
