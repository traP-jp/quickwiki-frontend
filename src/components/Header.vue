<script setup lang="ts">
import {onMounted, ref} from "vue";
import router from "../router";
import { useRoute } from "vue-router";
import '../styles/header.css';

const props = defineProps<{userTraqId: string}>();
const iconUrl = ref<string>("");

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
};

onMounted(() => {
  iconUrl.value = "https://q.trap.jp/api/v3/public/icon/" + props.userTraqId;
  // iconUrl.value = "https://q.trap.jp/api/v3/public/icon/kavos"
});

</script>
<template>
  <div :class="$style.header">
    <div :class="$style.header_header">
      <router-link to="/" :class="$style.header_header_text">QuickWiki</router-link>
    </div>
    <div :class="$style.header_right">
      <div>
        <input v-model="SearchWord" type="search" @keypress.enter="Submit" :class="$style.text_box" size="50" placeholder="すべてのsodanとmemoを検索"/>
        <button @click="Submit"><font-awesome-icon :icon="['fas', 'fa-search']" /></button>
      </div>
      <div>
        <router-link to="/wiki/mywiki">
          <img :src="iconUrl" :class="$style.icon">
        </router-link>
      </div>
    </div>
    <div :class="$style.header_list">
      <ul>
        <router-link to="/wiki/mywiki">
          <li class="header_link_content">QuickWiki</li>
        </router-link>
        <router-link to="/wiki/createsodan">
          <li>匿名質問</li>
        </router-link>
        <router-link to="/wiki/creatememo">
          <li>Wikiを書く</li>
        </router-link>
        <router-link to="/lectures/sougou">
          <li class="header_link_content">講習会資料</li>
        </router-link>
      </ul>
    </div>
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
  text-align: left;
  padding-left: 30px;
  user-select: none;
}

.header_header_text {
  color: rgb(253, 122, 0);
  font-size: 62px;
  font-weight: normal;
}

.header_header_text:hover {
  color: rgb(253, 122, 0);
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

.text_box {
  height: 30px;
  border-radius: 8px;
  border: 1px solid #aaa;
  padding: 5px;
}

.icon {
  width: 40px;
  border-radius: 50%;
}

.header_right {
  position: absolute;
  top: 30px;
  right: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>