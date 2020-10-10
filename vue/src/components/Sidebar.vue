<template>
    <div class="flex">
        <Notebook/>
        <Page/>
    </div>
</template>

<script>
import Notebook from './SidebarNotebook.vue'
import Page from './SidebarPage.vue'

export default {
  components: {
      Notebook,
      Page,
  },
}
</script>