<template>
<div class="about w-screen h-screen bg-gray-200 overflow-hidden">
    <div class="pt-2 overflow-y-auto">
        <div class="w-full max-w-6xl p-6 mx-auto">
            <h1 class="text-2xl text-gray-900 border-b border-gray-400 pb-4">Markdown Setting</h1>

            <div class="mt-6" id="setting"></div>

            <div class="flex justify-center">
                <div class="p-4 rounded-md border border-gray-400">
                    <router-link to="/">HOME</router-link>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import { mapState } from "vuex";

import { toCamelCase } from "../js/util"
import store from "@/assets/store.json";

export default {
    computed: {
        ...mapState(store.map(e => e.name)),
    },
    mounted() {
        store.filter(e => 'setting' in e && e.setting).forEach(e => {
            const div = document.createElement('div');
            div.classList.add("w-full", "px-3", "mb-6");

            div.innerHTML = `
                    <h2 class="text-2xl text-gray-900">${e.name}</h2>
                    <label class="block tracking-wide text-gray-700 text-xs font-bold mb-2">${e.description}: default=${e.default}</label>
                    <input
                        class="appearance-none block w-full border border-gray-400 rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500"
                        type="text" value="${this[e.name]}">
            `
            div.querySelector('input').addEventListener('change', (ev) => {
                const v = ev.srcElement.value;
                const camel_name = toCamelCase(e.name);

                this.$store.commit(`set${camel_name}`, v);
                console.log(`set${camel_name}`, v)
            });

            document.querySelector('#setting').appendChild(div);
        })
    }
}
</script>