<script setup lang="ts">
import { onMounted, ref } from "vue";

const wikis = ref<string>("Now Preparing");

onMounted(async () => {
  const resMyWiki = await fetch("/api/wiki/user");
  if (resMyWiki.ok) {
    wikis.value = await resMyWiki.json();
  }
});
</script>

<template>
  <div :class="$style.container">
    <main>
      <h1>MyWiki</h1>
    </main>
  </div>
</template>
<style module>
* {
  margin: 0;
  padding: 0;
}

body {
  height: 100vh;
}

.container {
  display: flex;
  height: 100vh;
}

main {
  flex: 1 1 auto;
  background: #f2f2f2;
}
</style>
