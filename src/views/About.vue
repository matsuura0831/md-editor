<template>
<div class="about bg-gray-200">
    <div class="pt-2">
        <div class="w-full max-w-6xl p-6 mx-auto">
            <h1 class="text-2xl text-gray-900 border-b border-gray-400 pb-4">Markdown Setting</h1>

            <div class="mt-6" id="setting"></div>

            <div class="flex justify-center">
                <div class="p-4 rounded-md border border-gray-400" @click="toggleHome">
                    HOME
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<style>
.about input:checked + svg {
    display: block;
}
</style>

<script>
import { mapState } from "vuex";

import { toCamelCase } from "../js/util"
import store from "@/assets/store.json";

export default {
    computed: {
        ...mapState(store.map(e => e.name)),
    },
    methods: {
        toggleHome(v) {
            this.$store.commit('toggleShowHome', v);
        },
    },
    mounted() {
        store.filter(e => e.opt && e.opt.setting).forEach(e => {
            const opt = 'opt' in e ? e.opt : {};
            const div = document.createElement('div');
            div.classList.add("w-full", "px-3", "mb-6");

            const lower_type = e.type.toLowerCase();
            const camel_name = toCamelCase(e.name);

            if(lower_type == "boolean") {
                const is_checked = this[e.name] ? 'checked' : '';

                div.innerHTML = `
                    <h2 class="text-2xl text-gray-900">${e.name}</h2>
                    <label class="flex justify-start items-start">
                        <div class="bg-white border-2 rounded border-gray-400 w-6 h-6 flex flex-shrink-0 justify-center items-center mr-2 focus-within:border-blue-500">
                            <input type="checkbox" class="opacity-0 absolute" ${is_checked}>
                        <svg class="fill-current hidden w-4 h-4 text-green-500 pointer-events-none" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                        </div>
                        <div class="select-none">${e.description} (default: ${e.default})</div>
                    </label>
                `
                div.querySelector('input').addEventListener('change', (ev) => {
                    const v = ev.srcElement.checked;
                    this.$store.commit(`set${camel_name}`, v);
                });
            } else {
                const input_type = opt.type ? opt.type : "text";
                const display_default = e.default ? `(default: ${e.default})` : '';

                div.innerHTML = `
                    <h2 class="text-2xl text-gray-900">${e.name}</h2>
                    <label class="block tracking-wide text-gray-700 text-xs font-bold mb-2">${e.description} ${display_default}</label>
                    <input
                        class="appearance-none block w-full border border-gray-400 rounded-md py-3 px-4 leading-tight focus:outline-none focus:border-gray-500"
                        type="${input_type}" value="${this[e.name]}">
                `
                div.querySelector('input').addEventListener('change', (ev) => {
                    const v = ev.srcElement.value;
                    this.$store.commit(`set${camel_name}`, v);
                });
            }

            document.querySelector('#setting').appendChild(div);
        })
    }
}
</script>