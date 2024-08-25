<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import router from '../router';
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
const ErrorMessage = ref<string>("");
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
const SelectWiki = (wiki: Wiki) => {
  console.log(wiki);
  if (wiki.type == "sodan") {
    router.push("/sodan/" + wiki.id.toString());
  } else if (wiki.type == "memo") {
    router.push("/memo/" + wiki.id.toString());
  }
};
const TagClick = (tag: string) => {
  router.push("/tag/" + tag);
};
// tagとwikiが同時に作動しないように
// errorがユーザーに伝わるように
//
</script>

<template>
  <table>
    <tr
      v-for="wiki in wikis"
      :key="wiki.id"
      class="card"
      @click="SelectWiki(wiki)"
    >
      <!-- <button type="button" @click="SelectWiki(wiki)"> -->
        <li class="title">{{ wiki.title }}</li>
        <li class="content">{{ wiki.Abstract }}</li>
      <div class="tag-container">
        <button
          v-for="tag in wiki.tags"
          :key="tag"
          class="tag-content"
          type="button"
          @click.stop="TagClick(tag)"
        >
          {{ tag }}
        </button>
      </div>
      <!-- </button> -->
    </tr>
  </table>
</template>
<style scoped>
.tag-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  margin-left: 80px;
}

.tag-content {
  display: flex;
  align-items: left;
  margin: 5px;
}

.card tr:hover {
  background-color: rgb(211, 211, 211);
}
.card tr:has(.tag:hover) {
  background-color: rgb(244, 244, 244);
}
.card tr {
  background-color: rgb(244, 244, 244);
  padding-right: 4px;
  width: 30%;
  height: 70px;
  transition: background-color 0.175s 0.075s ease-out;
}
.card {
  border-spacing: 0 2px;
  width: 90%;
  table-layout: fixed;
  margin: 0 auto;
}
.title {
  font-size: 20px;
  user-select: none;
}

.content {
  font-size: 15px;
  text-align: left;
  margin-left: 80px;
  list-style: none;
}

.card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  margin-bottom: 16px;
  transition: box-shadow 0.3s ease;
}

.title {
  font-size: 35px;
  text-align: left;
  margin-left: 80px;
  list-style: none;
}

.content {
  font-size: 25px;
  list-style: none;
}

.title:hover{
  text-decoration: underline solid #000000 0.15rem;
}
</style>
