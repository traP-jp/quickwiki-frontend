<script setup lang="ts">
import { onMounted, ref } from "vue";
import { onBeforeRouteUpdate, useRoute } from "vue-router";
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import LectureSideBar from "../components/LectureSideBar.vue";

const $toast = useToast();
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
    <lecture-side-bar />
    <main>
      <div :class="$style.mainHeader">
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
      <table width="80%">
        <tr v-for="lecture in lectures" :key="lecture.id" :class="$style.card">
          <ul>
            <li :class="$style.title">{{ lecture.title }}</li>
            <li :class="$style.content">講義資料url:<a href="{{ lecture.content }}" :class="$style.link">{{ lecture.content }}</a></li>
          </ul>
        </tr>
      </table>
    </main>
  </div>
</template>
<style module>
.mainHeader {
  font-size: 35px;
  font-weight: bold;
  user-select: none;
  text-align: left;
  padding:  20px ;
}

.container {
  display: flex;
  gap: 10px;
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
  transition-property: box-shadow, border;
  transition-duration: 0.2s;
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
.link:hover {
  text-decoration: underline;
}
</style>
