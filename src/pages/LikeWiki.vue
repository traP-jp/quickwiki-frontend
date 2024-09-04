<script setup lang="ts">
import { onMounted, ref } from "vue";
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import WikiCard from '../components/WikiCard.vue';
import Wiki from '../types/wiki';

const $toast = useToast();

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
  <div>
    <h1 :class="$style.head_text">お気に入りのWiki</h1>
    <div>
      <WikiCard :wiki="wiki" :isMyPage="false" v-for="wiki in wikis" :key="wiki.id" :class="$style.card" />
    </div>
  </div>
</template>

<style module>
.head_text {
  font-size: 50px;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
}
.card {
  width: 100%;
  max-width: 170vh;
}
</style>