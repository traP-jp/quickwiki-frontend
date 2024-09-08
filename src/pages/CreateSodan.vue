<script setup lang="ts">
import MarkDownEditor from '../components/MarkDownEditor.vue';
</script>
<template>
    <div :class="$style.contents">
        <h1>匿名質問</h1>
        <MarkDownEditor :editorType=2 />
    </div>
</template>
<style module>
.contents{
    padding-left: 20px;
}
</style>
