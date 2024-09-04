<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import WikiCard from '../components/WikiCard.vue';
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import Wiki from '../types/wiki';

const $toast = useToast();
const getTags = ref<string[]>([]);
const route = useRoute();
const wikis = ref<Wiki[]>([]);
const tagsString = ref<string>("");

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
    // console.log(apipath)
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
    tagsString.value = route.params.name.replaceAll("+", " ");;
    getTags.value = route.params.name.split(",");
  }
  Search(getTags.value);
  document.getElementById("page").scrollTop = 0;
});
onBeforeRouteUpdate((to, from) => {
  if (
    to.params.name != null &&
    typeof to.params.name == "string"
  ) {
    tagsString.value = to.params.name.replaceAll("+", " ");
    getTags.value = to.params.name.split(",");
  }
  Search(getTags.value);
  document.getElementById("page").scrollTop = 0;
});
getTags.value.forEach(tag => {
    tagsString.value += tag + " ";
});
</script>

<template>
  <div>
    <h1 :class="$style.head_text">タグ: {{ tagsString }} の一覧</h1>
    <div>
      <WikiCard :wiki="wiki" :isMyPage=false v-for="wiki in wikis" :key="wiki.id" :class="$style.card" />
    </div>
  </div>
</template>
<style module>
.head_text {
  font-size: 50px;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.card {
  width: 100%;
}
</style>