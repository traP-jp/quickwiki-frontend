<script setup lang="ts">
import { ref } from "vue";
import router from "../router";
import { useRoute } from "vue-router";

const SearchWord = ref<string>("");
const Words = ref<string[]>([]);
const ErrorMessage = ref<string>("");
const tags = ref<string[]>([]);
const keywords = ref<string[]>([]);
const Submit = () => {
  if (SearchWord.value == "") {
    return false;
  }
  tags.value = [];
  keywords.value = [];
  const SearchWords = SearchWord.value.split(/\s+/);
  // SearchWords.forEach((SearchWord) =>{
  //     Words.value = Words.value.concat(SearchWord.split("　"));
  // })
  SearchWords.forEach((word) => {
    if (word.substring(0, 1) == "#" || word.substring(0, 1) == "＃") {
      if (word.substring(1) != "") {
        tags.value.push(word.substring(1));
      }
    } else {
      if (word != "") {
        keywords.value.push(word);
      }
    }
  });
  router.push(
    "/wiki/search?tags=" +
      tags.value.join(",") +
      "&keywords=" +
      keywords.value.join(",") +
      "&page=0"
  );
};</script>
<template>
  <div :class="$style.header">
    <div :class="$style.header_header">QuickWiki</div>
    <div :class="$style.search">
      <input v-model="SearchWord" type="search" @keypress.enter="Submit" :class="$style.text_box" size="50" placeholder="すべてのsodanとmemoを検索"/>
      <button @click="Submit"><font-awesome-icon :icon="['fas', 'fa-search']" /></button>
    </div>
    <header :class="$style.header_list">
      <ul>
        <router-link to="/wiki/mywiki">
          <li>QuickWiki</li>
        </router-link>
        <router-link to="/createsodan">
          <li>匿名質問</li>
        </router-link>
        <router-link to="/creatememo">
          <li>Wikiを書く</li>
        </router-link>
        <router-link to="/lectures/sougou">
          <li>講習会資料</li>
        </router-link>
      </ul>
    </header>
  </div>
</template>

<style module>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #ffffff;
  box-shadow: 0 2px 1px 0 #5e5e5e;
}

.header_list a {
  font-size: 25px;
  color: #1a1a1a;
  user-select: none;
}

.header_header {
  top: 0;
  z-index: 10;
  color: rgb(253, 122, 0);
  font-size: 62px;
  background-color: #ffffff;
  text-align: left;
  padding-left: 30px;
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

.header_list li a:hover {
  font-size: 25px;
  color: #1a1a1a;
}

.header_list ul li:hover {
  background-color: #dedede;
  border-radius: 10px;;
}

.header_list li {
  display: inline-block;
  padding: 0px 10px;
}

.text_box {
  height: 30px;
  border-radius: 8px;
  border: 1px solid #aaa;
}

.search {
  position: absolute;
  top: 30px;
  right: 50px;
}
</style>