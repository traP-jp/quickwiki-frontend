<script setup lang="ts">
import { onBeforeUpdate, onMounted, ref, Ref } from 'vue';
import { watch } from 'vue';
import HeaderList from "./HeaderList.vue";
import HeaderListItems from "./HeaderListItems.vue";

const props =defineProps<{
  isMyPage: Boolean
}>();
const mypage = ref<boolean>(false)
console.log(props.isMyPage);

const isSmallScreen = ref<boolean>(window.innerWidth <= 960);
const isHideSidebar = ref<boolean>(false);

watch(() => props.isMyPage,
  () =>{
    if(typeof props.isMyPage === "boolean"){
      mypage.value = props.isMyPage
    }
  }
);
onMounted(() =>{
  window.addEventListener('resize', () => {
    isSmallScreen.value = window.innerWidth <= 960;
  });
})

const changeSideBarStatus = () => {
  isHideSidebar.value = !isHideSidebar.value;
}
</script>
<template>
  <button v-if="isSmallScreen" class="sidebar_button" @click="changeSideBarStatus">
    aaa
    <font-awesome-icon :icon="['fas', 'bars']" />
  </button>
  <div class="sidebar" :class="{ sidebar_hide: isHideSidebar }">
    <div class="sidebar_content">
      <ul>
        <header-list-items v-if="isSmallScreen" class="sidebar_header_list" />
        <router-link to="/wiki/mywiki">
          <li class="sidebar_link_content">自分のWiki</li>
        </router-link>
        <a href="#memo" v-if="mypage">
          <li class="headerLink sidebar_link_content">備忘録一覧</li>
        </a>
        <a href="#sodan" v-if="mypage">
          <li class="headerLink sidebar_link_content">相談一覧</li>
        </a>
        <router-link to="/wiki/favoritewiki">
          <li class="sidebar_link_content">お気に入りのWiki</li>
        </router-link>
        <router-link to="/wiki/creatememo">
          <li class="sidebar_link_content">Wikiを書く</li>
        </router-link>
      </ul>
    </div>
  </div>
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
  margin-top: -10px;
}
.sidebar_content {
  position: sticky;
  top: 145px;
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
.headerLink{
  color: gray;
}

@media screen and (max-width: 960px) {
  .sidebar_content {
    top: 175px;
  }
  .sidebar_button {
    color: #000000;
    font-size: 20px;
    font-weight: bold;
    position: fixed;
    top: 0;
    z-index: 15;
  }
  .sidebar_hide {
    transform: scaleX(0);
  }
  .sidebar {
    z-index: 14;
    position: fixed;
    background-color: #ffffff;
    top: 0;
    height: 110vh;
    transition-property: transform;
    transition-duration: 0.2s;
  }
}
</style>
