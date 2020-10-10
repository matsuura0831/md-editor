<template>
    <!--
        Base: https://tailwindcomponents.com/component/slack-clone-1
    -->
    <div class="font-sans antialiased w-screen h-screen flex overflow-hidden">
        <!-- Sidebar -->
        <Sidebar/>

        <Markdown/>
    </div>
</template>

<script>
import Sidebar from './Sidebar.vue'
import Markdown from './Markdown.vue'

export default {
  components: {
      Sidebar,
      Markdown,
  }
}
</script>