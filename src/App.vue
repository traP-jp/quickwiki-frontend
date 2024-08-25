<script setup lang="ts">
import Header from "./components/Header.vue";
</script>

<template>
  <div :class="$style.page">
    <Header />
    <router-view :class="$style.contents" />
  </div>
</template>
<style module>
.page {
  height: 100%;
  background: #f2f2f2;
  overflow-x: hidden;
}
.contents {
  height: fit-content;
}
</style>