<script setup lang="ts">
import { ref } from "vue";
import router from "../router";
import { useRoute } from "vue-router";
</script>

<template>
  <div :class="$style.container">
    <sidebar class="sidebar">
      <ul>
        <router-link to="/wiki/mywiki">
          <li>自分のWiki</li>
        </router-link>
        <router-link to="/wiki/favoritewiki">
          <li>お気に入りのWiki</li>
        </router-link>
        <router-link to="/creatememo">
          <li>Wikiを書く</li>
        </router-link>
      </ul>
    </sidebar>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style module>
* {
  margin: 0;
  padding: 0;
}

body {
  height: 100vh;
}

.container {
  display: flex;
  margin-top: 95px;
  height: 100vh;
  overflow-y: scroll;
  overflow-x: hidden;
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

.mainHeader {
  font-size: 35px;
  user-select: none;
  text-align: left;
  padding:  20px ;
}
</style>
