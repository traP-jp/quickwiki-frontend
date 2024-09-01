<script setup lang="ts">
import { onMounted, ref } from "vue";
import "../styles/SideBar.css";
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
  const resMyWiki = await fetch(
    "/api/wiki/user"
  );
  if (resMyWiki.ok) {
    wikis.value = await resMyWiki.json();
  }
});
</script>

<template>
  <div :class="$style.container">
    <main>
      <h1>MyWiki</h1>
      <table class="cardTable">
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
  margin-top: 95px;
}

main {
  flex: 1 1 auto;
  background: #f2f2f2;
}

.content {
  background-color: #d63a3a;
  font-size: 35px;
  width: 100%;
  height: 100%;
  text-align: center;
}
</style>
