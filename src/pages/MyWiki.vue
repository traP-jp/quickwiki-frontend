<script setup lang="ts">
import { onMounted, ref } from "vue";
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import WikiCard from '../components/WikiCard.vue';
import router from "../router";
import Wiki from "../types/wiki";

const $toast = useToast();

const wikis = ref<Wiki[]>([]);
const memos = ref<Wiki[]>([]);
const sodans = ref<Wiki[]>([]);

// search box
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
      "&page=0&sort=none"
  );
};
// search box end

onMounted(async () => {
  const resMyWiki = await fetch("/api/wiki/user");
  if (resMyWiki.ok) {
    wikis.value = await resMyWiki.json();
    memos.value = wikis.value.filter(value =>{
      return value.type == "memo"
    });
    sodans.value = wikis.value.filter(value =>{
      return value.type == "sodan"
    });
  }else{
    $toast.error("something wrong", {
        duration: 1200,
        position:  'top-right'
    })
  }
});
</script>

<template>
  <div>
    <main>
      <h1 :class="$style.head_text">QuickWiki</h1>
      <div>
        <input v-model="SearchWord" type="search" @keypress.enter="Submit" :class="$style.text_box" size="50" placeholder="すべてのsodanとmemoを検索"/>
        <button @click="Submit" :class="$style.search_button"><font-awesome-icon :icon="['fas', 'fa-search']" /></button>
      </div>
      <h2 :class="$style.anker" id="memo">自分の備忘録一覧</h2>
      <div>
        <WikiCard :wiki="memo" :isMyPage="true" v-for="memo in memos" :key="memo.id" />
        <p v-if="memos.length == 0" :class="$style.nowiki_text">まだ備忘録がありません 作成は<router-link to="/wiki/creatememo">こちら</router-link></p>
      </div>
      <h2 :class="$style.anker" id="sodan">自分の相談一覧</h2>
      <div>
        <WikiCard :wiki="sodan" :isMyPage="true" v-for="sodan in sodans" :key="sodan.id" :class="$style.card" />
        <p v-if="sodans.length == 0" :class="$style.nowiki_text">まだ相談がありません 作成は<router-link to="/wiki/createsodan">こちら</router-link></p>
      </div>
      <h2>すべて 後で消す！！！！！！！！</h2>
      <div>
        <WikiCard :wiki="wiki" :isMyPage="true" v-for="wiki in wikis" :key="wiki.id" :class="$style.card" />
      </div>
    </main>
  </div>
</template>
<style module>
* {
  margin: 0;
  padding: 0;
}
.anker{
  padding-top: 140px;
  margin-top: -140px;
}

main {
  height: fit-content;
}

.head_text {
  font-family: "Alfa Slab One", serif;
  font-weight: 400;
  font-style: normal;
  font-size: 90px;
  padding: 10px;
}

.text_box {
  height: 30px;
  border-radius: 20px;
  border: 1px solid #000000;
  padding: 25px;
  margin-top: 30px;
  margin-bottom: 30px;
}

.search_button {
  font-size: 20px;
}

.nowiki_text {
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
 } 
 .card{
  width: 100%;
  max-width: 170vh;
}
</style>
