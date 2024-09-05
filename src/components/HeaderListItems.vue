<script setup lang="ts">
import { watch } from "vue";
import { defineProps, ref } from "vue";

const props =defineProps<{
  isMyPage: Boolean,
  isSmallScreen: Boolean,
}>();
</script>

<template>
  <router-link to="/wiki/mywiki">
    <li class="header_link_content">QuickWiki</li>
  </router-link>
  <a href="#memo" v-if="props.isMyPage && props.isSmallScreen">
    <li class="headerLink header_link_content">備忘録一覧</li>
  </a>
  <a href="#sodan" v-if="props.isMyPage && props.isSmallScreen">
    <li class="headerLink header_link_content">相談一覧</li>
  </a>
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
@media screen and (max-width: 960px) {
  .header_link_content {
    font-size: 20px;
    border-right: 5px solid #ffffff;
    color: #1a1a1a;
    border-bottom: none;
  }
  .header_link_content:hover {
    background-color: #f0f0f0;
    border-right: 5px solid #fd7a00;
  }
  .router-link-active .header_link_content {
    background-color: #f0f0f0;
    border-right: 5px solid #fd7a00;
    border-bottom: none;
  }
  .headerLink{
    color: gray;
  }
}
</style>