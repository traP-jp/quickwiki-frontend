<script setup lang="ts">
import { onMounted, ref } from "vue";
import WikiCard from '../components/WikiCard.vue';

type Wiki = {
    id: number,
    type: string,
    title: string,
    Abstract: string,
    createdAt: string,
    updatedAt: string,
    ownerTraqId: string,
    tags: string[]
}

const wikis = ref<Wiki[]>([]);

onMounted(async () => {
  const resFavoriteWiki = await fetch("/api/wiki/user/favorite");
  if (resFavoriteWiki.ok) {
    wikis.value = await resFavoriteWiki.json();
  }
});
</script>

<template>
    <h1>LikeWiki</h1>
    <table class="cardTable">
      <WikiCard :wiki="wiki" v-for="wiki in wikis" :key="wiki.id" />
    </table>
</template>