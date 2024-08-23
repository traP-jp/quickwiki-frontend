<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import WikiCard from '../components/WikiCard.vue';
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

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

async function Search(keywords :string[],tags :string[]) {
    const responce = await fetch('/api/wiki/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: keywords[0], 
            tags: tags})
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
    typeof route.query.keywords == "string" &&
    typeof route.query.tags == "string"
  ) {
    getKeywords.value = route.query.keywords.split(",");
    getTags.value = route.query.tags.split(",");
  }
  Search(getKeywords.value, getTags.value);
});
onBeforeRouteUpdate((to, from) => {
  console.log("search");
  if (
    to.query.keywords != null &&
    to.query.tags != null &&
    typeof to.query.keywords == "string" &&
    typeof to.query.tags == "string"
  ) {
    getKeywords.value = to.query.keywords.split(",");
    getTags.value = to.query.tags.split(",");
  }
  Search(getKeywords.value, getTags.value);
});
</script>

<template>
  <table 
    v-for="wiki in wikis"
    :key="wiki.id"
  >
    <WikiCard :wiki="wiki" />
  </table>
</template>