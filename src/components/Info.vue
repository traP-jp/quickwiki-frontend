<script setup lang="ts">
defineProps({
    year: String
})
</script>
<template>
<div :class="$style.info">
    <h4>
        <font-awesome-icon :icon="['fas', 'circle-info']" />
        この記事は最終更新日から{{ year }}年以上経過しています
    </h4>
</div>
</template>
<style module>
.info{
  background-color: rgb(255, 243, 168);
  border-radius: 5px;
  text-align: left;
  padding: 1.5vh 20px;
}
</style>