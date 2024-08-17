<script setup lang="ts">
import { url } from 'inspector';
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router';
const lectures = ref<string>('Now Preparing')

onMounted(async () => {
    const res = await fetch('/api/lecture/byFolder/path?folderpath=' + useRoute().params.teams)
    if (res.ok) {
        lectures.value = await res.json()
    } 
})
const isUrl = (url :string) =>{
  return url == useRoute().params.teams
}

</script>
<template>
    <h1>Lectures</h1>
  <main>
    <div :class="$style.container">
        <header :class="$style.header">
          <p v-if="isUrl('sougou')">総合/融合</p>
          <p v-if="isUrl('SysAd')">SysAd</p>
          <p v-if="isUrl('algorithm')">アルゴリズム</p>
          <p v-if="isUrl('CTF')">CTF</p>
          <p v-if="isUrl('Kaggle')">Kaggle</p>
          <p v-if="isUrl('Game')">ゲーム</p>
          <p v-if="isUrl('sound')">サウンド</p>
          <p v-if="isUrl('graphics')">グラフィック</p>
          <p v-if="isUrl('others')">その他講習会</p>
        </header>
        <div v-for="lecture in lectures" :key="lecture.id">
            title: {{ lecture.title }}, 
            content: {{ lecture.content }}, 
        </div>
        <sidebar :class="$style.sidebar">
            <h2>講習会</h2>
            <router-link to="/lectures/sougou">総合/融合</router-link>
            <router-link to="/lectures/SysAd">SysAd</router-link>
            <router-link to="/lectures/algorithm">アルゴリズム</router-link>
            <router-link to="/lectures/CTF">CTF</router-link>
            <router-link to="/lectures/Kaggle">Kaggle</router-link>
            <router-link to="/lectures/Game">ゲーム</router-link>
            <router-link to="/lectures/sound">サウンド</router-link>
            <router-link to="/lectures/graphics">グラフィック/デザイン</router-link>
            <router-link to="/lectures/others"><h2>その他講習会</h2></router-link>
        </sidebar>
    </div>
  </main>
</template>
<style module>
.container {
  max-width: fit-content;
  margin: auto;
}
.header {
  display: flex;
  justify-content: center;
}
.sidebar {
  display: flex;
  justify-content: left;
  background-color:aqua;
}
</style>