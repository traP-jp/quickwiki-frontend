<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {useRoute} from "vue-router";
import HeaderListItems from "./HeaderListItems.vue";

const isSmallScreen = ref<boolean>(window.innerWidth <= 960);
const isHideSidebar = ref<boolean>(false);

watch(useRoute(), () => {
  isHideSidebar.value = true;
});
onMounted(() =>{
  window.addEventListener('resize', () => {
    isSmallScreen.value = window.innerWidth <= 960;
  });
  isHideSidebar.value = true;
})

const changeSideBarStatus = () => {
  isHideSidebar.value = !isHideSidebar.value;
}
const closeWholeClick = (e) => {
  if(e.target.classList.contains("whole_overlay")){
    isHideSidebar.value = !isHideSidebar.value;
  }
}
const closeSidebar = () => {
  isHideSidebar.value = true;
}
</script>

<template>
  <button v-if="isSmallScreen" class="sidebar_button" @click="changeSideBarStatus">
    <span class="sidebar_button_bar sidebar_button_bar_1" :class="{ sidebar_button_bar_hide_1: isHideSidebar }"></span>
    <span class="sidebar_button_bar sidebar_button_bar_2" :class="{ sidebar_button_bar_hide_2: isHideSidebar }"></span>
    <span class="sidebar_button_bar sidebar_button_bar_3" :class="{ sidebar_button_bar_hide_3: isHideSidebar }"></span>
  </button>
  <div class="sidebar" :class="{ sidebar_hide: isHideSidebar }">
    <div class="sidebar_content">
      <ul>
        <header-list-items v-if="isSmallScreen" class="sidebar_header_list" :is-my-page="false" :is-small-screen="isSmallScreen" />
        <li class="sidebar_header">講習会</li>
        <router-link to="/lectures/sougou" @click="closeSidebar">
          <li class="sidebar_link_content">総合/融合</li>
        </router-link>
        <router-link to="/lectures/SysAd" @click="closeSidebar">
          <li class="sidebar_link_content">SysAd</li>
        </router-link>
        <router-link to="/lectures/algorithm" @click="closeSidebar">
          <li class="sidebar_link_content">アルゴリズム</li>
        </router-link>
        <router-link to="/lectures/CTF" @click="closeSidebar">
          <li class="sidebar_link_content">CTF</li>
        </router-link>
        <router-link to="/lectures/Kaggle" @click="closeSidebar">
          <li class="sidebar_link_content">Kaggle</li>
        </router-link>
        <router-link to="/lectures/Game" @click="closeSidebar">
          <li class="sidebar_link_content">ゲーム</li>
        </router-link>
        <router-link to="/lectures/sound" @click="closeSidebar">
          <li class="sidebar_link_content">サウンド</li>
        </router-link>
        <router-link to="/lectures/graphics" @click="closeSidebar">
          <li class="sidebar_link_content">グラフィック/デザイン</li>
        </router-link>
        <router-link to="/lectures/others" @click="closeSidebar">
          <li class="sidebar_link_content">その他講習会</li>
        </router-link>
      </ul>
    </div>
  </div>
  <div class="whole_overlay" v-if="isSmallScreen" :class="{ whole_overlay_active: isHideSidebar }" @click="closeWholeClick"></div>
</template>

<style scoped>
.sidebar {
  z-index: 9;
  font-size: 35px;
  width: 15%;
  min-width: 180px;
  user-select: none;
  border-right: 2px solid #aaaaaa;
  box-shadow: #aaaaaa 2px 2px 2px;
  margin-top: -20px;
}
.sidebar_content {
  position: sticky;
  top: 167px;
}
.sidebar ul {
  font-size: 20px;
  list-style: none;
  margin: 0;
  display: block;
  height: 100%;
  width: 100%;
  line-height: 40px;
  color: #1a1a1a;
}

.sidebar ul a {
  color: #1a1a1a;
}

.sidebar li a:hover {
  color: #1a1a1a;
}

.sidebar_link_content {
  border-right: 5px solid #ffffff;
}

.sidebar_link_content:hover {
  background-color: #f0f0f0;
  border-right: 5px solid #fd7a00;
}

.router-link-active .sidebar_link_content {
  background-color: #f0f0f0;
  border-right: 5px solid #fd7a00;
}

.sidebar_header {
  font-size: 40px;
  font-weight: bold;
  margin: 40px 10px 10px 10px;
  padding-bottom: 10px;
  color: #1a1a1a;
  border-bottom: 2px solid #aaaaaa;
}

@media screen and (max-width: 960px) {
  .sidebar_button {
    color: #000000;
    font-size: 20px;
    font-weight: bold;
    position: fixed;
    top: 15px;
    left: 15px;
    width: 50px;
    height: 50px;
    z-index: 15;
    background: none;
    border-radius: 50%;
    transition-property: background-color;
    transition-duration: 0.2s;
  }
  .sidebar_button:hover {
    cursor: pointer;
    background-color: #f0f0f0;
  }
  .sidebar_button:focus,
  .sidebar_button:focus-visible {
    outline: none;
  }
  .sidebar_hide {
    transform: translateX(-100%);
  }
  .sidebar {
    z-index: 14;
    position: fixed;
    background-color: #ffffff;
    top: 0;
    height: 100vh;
    width: 220px;
    transition-property: transform;
    transition-duration: 0.2s;
    margin-top: 0;
    padding-bottom: 30px;
    overflow-y: auto;
  }
  .sidebar_content {
    top: 0;
    padding-top: 70px;
  }
  .sidebar_button_bar {
    position: absolute;
    left: 10px;
    width: 30px;
    height: 3px;
    background-color: #000000;
    border-radius: 3px;
  }
  .sidebar_button_bar_1 {
    top: 15px;
    transform: translateY(10px) rotate(45deg);
    transition-property: transform;
    transition-duration: 0.2s;
  }
  .sidebar_button_bar_2 {
    top: 25px;
    opacity: 0;
    transition-property: opacity;
    transition-duration: 0.2s;
  }
  .sidebar_button_bar_3 {
    top: 35px;
    transform: translateY(-10px) rotate(-45deg);
    transition-property: transform;
    transition-duration: 0.2s;
  }
  .sidebar_button_bar_hide_1 {
    transform: translateY(0) rotate(0);
  }
  .sidebar_button_bar_hide_2 {
    opacity: 1;
  }
  .sidebar_button_bar_hide_3 {
    transform: translateY(0) rotate(0);
  }
  .whole_overlay {
    opacity: 1;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.25);
    z-index: 13;
    transition-property: opacity;
    transition-duration: 0.2s;
  }
  .whole_overlay_active {
    opacity: 0;
    z-index: -1;
  }
}
</style>