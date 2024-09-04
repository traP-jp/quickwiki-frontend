<script setup>
import '../styles/header.css';
</script>

<template>
  <router-link to="/wiki/mywiki">
    <li class="header_link_content">QuickWiki</li>
  </router-link>
  <router-link to="/wiki/createsodan">
    <li class="header_link_content">匿名質問</li>
  </router-link>
  <router-link to="/wiki/creatememo">
    <li class="header_link_content">Wikiを書く</li>
  </router-link>
  <router-link to="/lectures/sougou">
    <li class="header_link_content">講習会資料</li>
  </router-link>
</template>

<style scoped>

</style>