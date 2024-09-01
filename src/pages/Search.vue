<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import WikiCard from '../components/WikiCard.vue';
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import router from '../router';

type Wiki = {
    id: number,
    type: string,
    title: string,
    Abstract: string,
    createdAt: string,
    updatedAt: string,
    ownerTraqId: string,
    tags: string[]
}
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
  <table class="cardTable">
    <WikiCard :wiki="wiki" v-for="wiki in wikis" :key="wiki.id" />
  </table>
  <button type="button" @click="backPage" v-if="pageNum > 0">back</button>
  <button type="button" @click="nextPage">next</button>
</template>
<style scoped>
.cardTable{
    margin: 10px 0px;
}
</style>