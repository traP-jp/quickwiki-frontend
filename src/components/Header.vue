<script setup lang="ts">
import {onMounted, ref} from "vue";
import router from "../router";
import { useRoute } from "vue-router";
import HeaderList from "./HeaderList.vue";

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
      <div :class="$style.icon_wrapper">
        <router-link to="/wiki/mywiki">
          <img :src="iconUrl" :class="$style.icon">
        </router-link>
      </div>
    </div>
    <header-list :class="$style.header_list_hide" />
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

@media screen and (max-width: 960px) {
  .header_right {
    position: relative;
    top: 0;
    left: 30px;
    display: block;
  }
  .icon_wrapper {
    position: fixed;
    top: 30px;
    right: 30px;
  }
  .text_box {
    width: 75%;
  }
  .header_header {
    text-align: center;
  }
  .header_list_hide {
    display: none;
  }
}
</style>