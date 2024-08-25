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
const route = useRoute();
const wikis = ref<Wiki[]>([]);

async function Search(tags: string[]) {
    let apipath = '/api/wiki/tag';
    tags.forEach(tag => {
        if(tag == tags[0]){
            apipath += '?tag=';
        }else{
            apipath += '&tag=';
        }
        apipath += tag;
    });
    console.log(apipath)
    const responce = await fetch(apipath)
    if(responce && responce.ok){
        wikis.value = await responce.json();
    }else{
        $toast.error("something wrong", {
            duration: 1200,
            position:  'top-right'
        })
    }
}
onMounted(() => {
  if (
    route.params.name != null &&
    typeof route.params.name == "string"
  ){
    getTags.value = route.params.name.split(",");
  }
  Search(getTags.value);
});
onBeforeRouteUpdate((to, from) => {
  if (
    to.params.name != null &&
    typeof to.params.name == "string"
  ) {
    getTags.value = to.params.name.split(",");
  }
  Search(getTags.value);
});
</script>

<template>
    <h1>tag</h1>
  <table class="cardTable">
    <WikiCard :wiki="wiki" v-for="wiki in wikis" :key="wiki.id" />
  </table>
</template>
<style scoped>
.cardTable{
    margin: 10px 0px;
}
</style>