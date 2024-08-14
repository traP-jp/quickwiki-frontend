<script setup lang="ts">
import { watch, ref } from 'vue';
import { Marked } from "marked";

const props = defineProps({
    source: {
        type: String,
        required: true,
    },
});
const marked = new Marked();
const compiledMarkdown = ref("");
watch(() => props.source, () => {
    compiledMarkdown.value = marked.parse(props.source)
})
</script>

<template>
    <div v-html="compiledMarkdown" />
</template>