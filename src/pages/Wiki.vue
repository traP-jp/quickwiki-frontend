<template>
  <div :class="$style.container">
    <wiki-side-bar />
    <main>
      <router-view />
    </main>
  </div>
</template>

<style module>
* {
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  margin-top: -10px;
  padding-top: 10px;
  gap: 10px;
  height: fit-content;
}

main {
  flex: 1 1 auto;
  height: 100vh;
}
.view{
  border-left: 5px double gray;
}
</style>
<script setup lang="ts">
import WikiSideBar from "../components/WikiSideBar.vue";
</script>