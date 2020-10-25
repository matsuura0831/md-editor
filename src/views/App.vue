<template>
    <div>
        <Home v-if="isShowHome"/>
        <About v-if="!isShowHome"/>
    </div>
</template>

<script>
import Home from '../views/Home.vue';
import About from '../views/About.vue';

export default {
    name: 'App',
    components: {
        Home,
        About,
    },
    computed: {
        isShowHome() {
            return this.$store.state.show_home;
        },
    }
}
</script>