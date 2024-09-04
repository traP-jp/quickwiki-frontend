<script setup>
import '../styles/header.css';
</script>

<template>
  <div :class="$style.header_list">
    <ul>
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
    </ul>
  </div>
</template>

<style module>
.header_list a {
  font-size: 25px;
  color: #1a1a1a;
  user-select: none;
}

.header_list ul {
  padding-left: 10px;
  text-align: left;
  font-size: 20px;
  list-style: none;
  margin: 5px;
  display: block;
  height: 100%;
  line-height: 40px;
  color: #1a1a1a;
}

.header_list li a {
  color: #1a1a1a;
}

.header_list ul li:hover {
  background-color: #f0f0f0;
  border-bottom: 3px solid #fd7a00;
}

.header_list li {
  display: inline-block;
  padding: 0px 10px;
}
</style>