<script setup lang="ts">
import { onMounted, ref } from "vue";
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import WikiCard from '../components/WikiCard.vue';

const $toast = useToast();

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
  }else{
    $toast.error("something wrong", {
        duration: 1200,
        position:  'top-right'
    })
  }
});
</script>

<template>
    <h1>LikeWiki</h1>
    <table class="cardTable">
      <WikiCard :wiki="wiki" :isMyPage="false" v-for="wiki in wikis" :key="wiki.id" />
    </table>
</template>