<script setup lang="ts">
import { onMounted, ref } from "vue";
import { onBeforeRouteUpdate, useRoute } from "vue-router";
import "../styles/SideBar.css";
const lectures = ref<string>("Now Preparing");
const getTeams = ref<string>("");

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
onBeforeRouteUpdate(async (to, from) => {
  if (to.params.teams != null && typeof to.params.teams == "string") {
    getTeams.value = to.params.teams;
  }
  const res = await fetch(
    "/api/lecture/byFolder/path?folderpath=" + getTeams.value
  );
  if (res.ok) {
    lectures.value = await res.json();
  }
});
</script>
<template>
  <div :class="$style.container">
    <div class="sidebar">
      <div class="sidebar_content">
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
      </div>
    </div>
    <main>
      <div :class="$style.teamHeader">
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
      <table>
        <tr v-for="lecture in lectures" :key="lecture.id" :class="$style.card">
          <ul>
            <li :class="$style.title">{{ lecture.title }}</li>
            <li :class="$style.content">{{ lecture.content }}</li>
          </ul>
        </tr>
      </table>
    </main>
  </div>
</template>
<style module>
.teamHeader {
  font-size: 35px;
  user-select: none;
  text-align: left;
  padding:  20px ;
}

.container {
  display: flex;
}

.card {
  width: 95%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  margin-bottom: 16px;
  transition: box-shadow 0.3s ease;
}

.title {
  font-size: 35px;
  text-align: left;
  margin-left: 80px;
  list-style: none;
}
.content {
  font-size: 25px;
  list-style: none;
}

main {
  flex-grow: 1;
}

table {
  width: 100%;
}

</style>
