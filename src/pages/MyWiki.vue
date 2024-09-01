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
  const resMyWiki = await fetch("/api/wiki/user");
  if (resMyWiki.ok) {
    wikis.value = await resMyWiki.json();
  }else{
    $toast.error("something wrong", {
        duration: 1200,
        position:  'top-right'
    })
  }
});
</script>

<template>
  <div :class="$style.container">
    <main>
      <h1>MyWiki</h1>
      <table :class="$style.cardTable">
        <WikiCard :wiki="wiki" v-for="wiki in wikis" :key="wiki.id" />
      </table>
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
}

main {
  flex: 1 1 auto;
}
.cardTable {
  width: 95%;
}
</style>
