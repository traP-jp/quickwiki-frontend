<script setup lang="ts">
import { onMounted, ref } from "vue";
const wikis = ref<string>("Now Preparing");

onMounted(async () => {
  const resFavoriteWiki = await fetch("/api/wiki/user/favorite");
  if (resFavoriteWiki.ok) {
    wikis.value = await resFavoriteWiki.json();
  }
});
</script>

<template>
    <h1>LikeWiki</h1>
</template>