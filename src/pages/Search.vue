<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import WikiCard from '../components/WikiCard.vue';
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import router from '../router';
import Wiki from '../types/wiki';

const $toast = useToast();
const getTags = ref<string[]>([]);
const getKeywords = ref<string[]>([]);
const route = useRoute();
const wikis = ref<Wiki[]>([]);
const pageNum = ref<number>(0);

async function Search(keywords :string[], tags :string[], startNum: number) {
  const filterTags = tags.filter(function(value){
    return value != "";
  })
  const filterKeyWord = keywords.filter(function(value){
    return value != "";
  })
  const responce = await fetch('/api/wiki/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: filterKeyWord[0], 
          tags: filterTags,
          resultCount: 20,
          from: startNum})
    }).catch((e) => {
        $toast.error("something wrong", {
            duration: 1200,
            position:  'top-right'
        })
        return e;   
    })
    if(responce && responce.ok){
        wikis.value = await responce.json();
    }else{
      wikis.value = []
    }
}
onMounted(() => {
  if (
    route.query.keywords != null &&
    route.query.tags != null &&
    route.query.page != null &&
    typeof route.query.keywords == "string" &&
    typeof route.query.tags == "string" &&
    typeof route.query.page == "string"
  ) {
    getKeywords.value = route.query.keywords.split(",");
    getTags.value = route.query.tags.split(",");
    pageNum.value = Number(route.query.page);
  }
  Search(getKeywords.value, getTags.value, pageNum.value * 20);
  document.getElementById("page").scrollTop = 0;
});
onBeforeRouteUpdate((to, from) => {
  console.log("search");
  if (
    to.query.keywords != null &&
    to.query.tags != null &&
    to.query.page != null &&
    typeof to.query.keywords == "string" &&
    typeof to.query.tags == "string" &&
    typeof to.query.page == "string"
  ) {
    getKeywords.value = to.query.keywords.split(",");
    getTags.value = to.query.tags.split(",");
    pageNum.value = Number(to.query.page);
  }
  Search(getKeywords.value, getTags.value, pageNum.value * 20);
  document.getElementById("page").scrollTop = 0;
});

const nextPage = () =>{
  pageNum.value++;
  router.push("/wiki/search?tags=" +
      getTags.value.join(",") +
      "&keywords=" +
      getKeywords.value.join(",") +
      "&page=" + 
      pageNum.value.toString()
    )
}
const backPage = () =>{
  if(pageNum.value > 0)pageNum.value--;
  router.push("/wiki/search?tags=" +
    getTags.value.join(",") +
    "&keywords=" +
    getKeywords.value.join(",") +
    "&page=" + 
    pageNum.value.toString()
  )
}
</script>

<template>
  <div>
    <h1 :class="$style.head_text">検索結果: {{ getKeywords.join(",") }}</h1>
    <p :class="$style.pagenum_text" v-if="wikis.length != 0">{{ pageNum + 1 }}ページ目 {{ pageNum * 20 + 1 }}～{{ pageNum * 20 + wikis.length }}件目を表示中</p>
    <p v-else>検索結果が見つかりませんでした</p>
    <div>
      <WikiCard :wiki="wiki" :isMyPage="false" v-for="wiki in wikis" :key="wiki.id" :class="$style.card" />
    </div>
    <button type="button" @click="backPage" v-if="pageNum > 0" :class="$style.button">back</button>
    <button type="button" @click="nextPage" :class="$style.button">next</button>
  </div>
</template>
<style module>
.head_text {
  font-size: 50px;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.pagenum_text {
  font-size: 15px;
  text-align: left;
  margin-top: 20px;
  margin-bottom: 20px;
}

.button {
  background-color: #eeeeee;
  border-radius: 10px;
}

.button:hover {
  background-color: #dddddd;
}

.card {
  width: 100%;
  max-width: 170vh;
}
</style>