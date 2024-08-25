<script setup lang="ts">
import MarkDownEditor from '../components/MarkDownEditor.vue';
</script>
<template>
    <div :class="$style.contents">
        <h1>CreateMemo</h1>
        <MarkDownEditor :isSodan="false" />
    </div>
</template>
<style module>
.contents{
    padding-left: 20px;
}
</style>
