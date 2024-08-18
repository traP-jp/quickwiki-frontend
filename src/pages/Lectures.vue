<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import "../styles/SideBar.css";
const lectures = ref<string>("Now Preparing");

onMounted(async () => {
  const res = await fetch(
    "/api/lecture/byFolder/path?folderpath=" + useRoute().params.teams
  );
  if (res.ok) {
    lectures.value = await res.json();
  }
});
const isUrl = (url: string) => {
  return url == useRoute().params.teams;
};
</script>
<template>
  <div :class="$style.container">
    <sidebar class="sidebar">
      <h2 class="sidebar_header">講習会</h2>
      <ul>
        <router-link to="/lectures/sougou">
          <li>総合/融合</li>
        </router-link>
        <router-link to="/lectures/SysAd">
          <li>SysAd</li>
        </router-link>
        <router-link to="/lectures/algorithm">
          <li>アルゴリズム</li>
        </router-link>
        <router-link to="/lectures/CTF">
          <li>CTF</li>
        </router-link>
        <router-link to="/lectures/Kaggle">
          <li>Kaggle</li>
        </router-link>
        <router-link to="/lectures/Game">
          <li>ゲーム</li>
        </router-link>
        <router-link to="/lectures/sound">
          <li>サウンド</li>
        </router-link>
        <router-link to="/lectures/graphics">
          <li>グラフィック/デザイン</li>
        </router-link>
        <router-link to="/lectures/others">
          <li>その他講習会</li>
        </router-link>
      </ul>
    </sidebar>
    <main>
      <div :class="$style.secHeader">
        <p v-if="isUrl('sougou')">総合/融合</p>
        <p v-if="isUrl('SysAd')">SysAd</p>
        <p v-if="isUrl('algorithm')">アルゴリズム</p>
        <p v-if="isUrl('CTF')">CTF</p>
        <p v-if="isUrl('Kaggle')">Kaggle</p>
        <p v-if="isUrl('Game')">ゲーム</p>
        <p v-if="isUrl('sound')">サウンド</p>
        <p v-if="isUrl('graphics')">グラフィック</p>
        <p v-if="isUrl('others')">その他講習会</p>
      </div>
      <div
        v-for="lecture in lectures"
        :key="lecture.id"
        :class="$style.content"
      >
      <ul>
        <li :class="$style.title">
          title: {{ lecture.title }}
        </li>
        <li :class="$style.content">
          content: {{ lecture.content }}
        </li>
      </ul>
      </div>
    </main>
  </div>
</template>
<style module>
.secHeader {
  font-size: 35px;
  user-select: none;
  text-align: left;
}

.container {
  display: flex;
  margin-top: 95px;
  height: 100vh;
  overflow-y: scroll;
}

main {
  flex: 1 1 auto;
  background: coral;
}

.content {
  background-color: #d63a3a;
  font-size: 35px;
  width: 100%;
  height: 100%;
  text-align: center;
}
</style>
