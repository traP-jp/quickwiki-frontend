<script setup lang="ts">
import MarkDownEditor from '../components/MarkDownEditor.vue';
import { onMounted, ref } from "vue";
import { onBeforeRouteUpdate, useRoute } from "vue-router";

const memoid = ref<number>(Number(useRoute().params.memoid))

</script>
<template>
    <div :class="$style.contents">
        <h1>EditMemo</h1>
        <MarkDownEditor :editorType=1 :defaultId="memoid" />
    </div>
</template>
<style module>
.contents{
    padding-left: 20px;
}
</style>
