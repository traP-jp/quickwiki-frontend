<script setup lang="ts">
import { onMounted, ref } from "vue";
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const wikis = ref<string>("Now Preparing");
const $toast = useToast();

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
</template>