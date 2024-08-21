<script setup lang="ts">
import Header from "./components/Header.vue";
</script>

<template>
  <div>
    <Header />
    <div :class="$style.contents">
      <router-view />
    </div>
  </div>
</template>
<style module>
.contents {
  margin-top: 100px;
  height: 100vh;
}
</style>