<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
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
const searchLength = ref<number>(20)
const wikis = ref<Wiki[]>([]);
const pageNum = ref<number>(0);
const sort = ref<string>("none");
const sortMenu = ref<string>("関連順");

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
          resultCount: searchLength.value,
          from: startNum,
          sort: sort.value
        })
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
    route.query.sort != null &&
    typeof route.query.keywords == "string" &&
    typeof route.query.tags == "string" &&
    typeof route.query.page == "string" &&
    typeof route.query.sort == "string"
  ) {
    getKeywords.value = route.query.keywords.split(",");
    getTags.value = route.query.tags.split(",");
    pageNum.value = Number(route.query.page);
    sort.value = route.query.sort;
  }
  Search(getKeywords.value, getTags.value, pageNum.value * 20);
  document.getElementById("page").scrollTop = 0;
});
onBeforeRouteUpdate((to, from) => {
  if (
    to.query.keywords != null &&
    to.query.tags != null &&
    to.query.page != null &&
    to.query.sort != null &&
    typeof to.query.keywords == "string" &&
    typeof to.query.tags == "string" &&
    typeof to.query.page == "string" &&
    typeof to.query.sort == "string"
  ) {
    getKeywords.value = to.query.keywords.split(",");
    getTags.value = to.query.tags.split(",");
    pageNum.value = Number(to.query.page);
  }
  Search(getKeywords.value, getTags.value, pageNum.value * 20);
  document.getElementById("page").scrollTop = 0;
});
watch(sortMenu, () => {
  updateSort();
})

const nextPage = () =>{
  pageNum.value++;
  router.push("/wiki/search?tags=" +
      getTags.value.join(",") +
      "&keywords=" +
      getKeywords.value.join(",") +
      "&page=" + 
      pageNum.value.toString() +
      "&sort=" + sort.value
    )
}
const backPage = () =>{
  if(pageNum.value > 0)pageNum.value--;
  router.push("/wiki/search?tags=" +
    getTags.value.join(",") +
    "&keywords=" +
    getKeywords.value.join(",") +
    "&page=" + 
    pageNum.value.toString() +
    "&sort=" + sort.value
  )
}
const updateSort = () => {
  if(sortMenu.value === "関連順"){
    sort.value = "none";
  }else if(sortMenu.value === "新しい順"){
    sort.value = "createdAt_newest";
  }else if(sortMenu.value === "古い順"){
    sort.value = "createdAt_oldest";
  }
  router.push("/wiki/search?tags=" +
      getTags.value.join(",") +
      "&keywords=" +
      getKeywords.value.join(",") +
      "&page=" +
      pageNum.value.toString() +
      "&sort=" + sort.value
  )
}
</script>

<template>
  <div>
    <h1 :class="$style.head_text">検索結果:
      {{ getKeywords.join(",") }}
      <v-chip 
      density="default" 
      size="large"
      rounded="lg"
      prepend-icon="mdi-tag-search-outline" 
      :class="$style.chip"
      v-for="tag in getTags" 
      :key="tag">
        {{ tag }}
      </v-chip>
    </h1>
    <div :class="$style.head_wrapper">
      <p :class="$style.pagenum_text" v-if="wikis.length != 0">{{ pageNum + 1 }}ページ目 {{ pageNum * 20 + 1 }}～{{ pageNum * 20 + wikis.length }}件目を表示中</p>
      <p v-else>検索結果が見つかりませんでした</p>
      <v-sheet :class="$style.sort_selector">
        <v-select
            v-model="sortMenu"
            :items="['関連順', '新しい順', '古い順']"
            label="並べ替え"
            variant="underlined"
        ></v-select>
      </v-sheet>
    </div>
    <div>
      <WikiCard :wiki="wiki" :isMyPage="false" v-for="wiki in wikis" :key="wiki.id" :class="$style.card" />
    </div>
    <button type="button" @click="backPage" v-if="pageNum > 0" :class="$style.button">back</button>
    <button type="button" @click="nextPage" :class="$style.button">next</button>
  </div>
</template>
<style module>
.chip{
  margin: 0 3px; 
}
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
.head_wrapper {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
.sort_selector {
  width: 20%;
}
</style>