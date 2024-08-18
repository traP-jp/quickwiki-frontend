<script setup lang="ts">
import Header from "./components/Header.vue";
</script>

<template>
  <div>
    <Header />
    <router-view />
    <div>
      <footer>
        <router-link to="/mywiki">QuickWiki</router-link>|
        <router-link to="/createsodan">CreateSodan</router-link>|
        <router-link to="/sodan/1">Sodan1</router-link>|
        <router-link to="/search">Search</router-link>|
        <router-link to="/lectures/sougou">Lectures</router-link>|
        <router-link to="/mysodan">MySodan</router-link>|
        <router-link to="/creatememo">CreateMemo</router-link>|
        <router-link to="/mywiki">MyWiki</router-link>|
        <router-link to="/apitest">apitest</router-link>|
        <router-link to="/tekitounayatu">notfound</router-link>|
      </footer>
    </div>
  </div>
</template>
