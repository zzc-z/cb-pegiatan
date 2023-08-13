<script>
  export let dialog;
  import { _ } from "../services/i18n";
</script>

<dialog bind:this={dialog} class="p-5 rounded-xl" on:close>
  <button
    aria-label={$_("app.dialog.close")}
    class="absolute top-5 right-5 px-3 align-middle rounded-full text-2xl"
    on:click={() => dialog.close()}
  >
    ×
  </button>
  <slot />
</dialog>
