<template>
    <div class="relative flex-1 flex pt-8" id="main" style="width: 0px">
        <div class="absolute top-0 left-0 w-full h-8 bg-indigo-darker text-white flex items-center justify-center">
            <div>
                Toggle:
                <button id="toggle-notebook" class="ml-1 w-6 h-6"><i class="fas fa-book"></i></button>
                <button id="toggle-page" class="ml-1 w-6 h-6"><i class="fas fa-file-alt"></i></button>
                <button id="toggle-editor" class="ml-1 w-6 h-6"><i class="fas fa-edit"></i></button>
                <button id="toggle-viewer" class="ml-1 w-6 h-6"><i class="fas fa-book-open"></i></button>
            </div>
            <div class="ml-4">
                Tools:
                <button id="invoke-drawio" class="ml-1 w-6 h-6"><i class="fas fa-draw-polygon"></i></button>
                <button id="invoke-now" class="ml-1 w-6 h-6"><i class="far fa-clock"></i></button>
            </div>
        </div>

        <div class="flex-1" id="editor"></div>

        <div class="flex-1 bg-gray-300 overflow-auto p-4" id="viewer">
        </div>
    </div>
</template>

<script>
export default {
}
</script>