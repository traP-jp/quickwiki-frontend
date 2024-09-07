<script setup lang="ts">
import { ref, onMounted, onUpdated } from 'vue'
import { useRoute } from 'vue-router'
import router from '../router'
import { Marked } from 'marked'
import hljs from 'highlight.js'
import markedKatex from 'marked-katex-extension'
import customHeadingId from "marked-custom-heading-id";
import { markedHighlight } from 'marked-highlight'
import 'highlight.js/styles/github-dark.css'
import { useUserStore } from '../store/user'
import Info from '../components/Info.vue'
import getPassedTime from '../scripts/getPassedTime'
import { get } from 'http'
import Memo from '../types/memo'
import Wiki from "../types/wiki";

const myid = ref<string>("")
const title = ref<string>("");
const content = ref<string>("");
const updatedAt = ref<string>("");
const passedYear = ref<string>("")
const route = useRoute();
const userStore = useUserStore();
const isLiking = ref<boolean>(false)
const favorites = ref<Wiki[]>([])
const marked = new Marked(markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext'
        return hljs.highlight(code, { language }).value
      }
    })
).use(markedKatex({
    throwOnError: false,
    nonStandard: true
})).use(customHeadingId());;
marked.setOptions({ breaks: true });
const memo = ref<Memo>({
    id: -1,
    title: "",
    ownerTraqId: "",
    content: "",
    createdAt: "",
    updatedAt: "",
    tags: [""]
});

onMounted(async () => {

  const responce = await fetch('/api/memo?wikiId=' + route.params.id)
  if(responce.ok){
      memo.value = await responce.json();
  }
  title.value = await marked.parse(memo.value.title);
  content.value = await marked.parse(memo.value.content);
  updatedAt.value = memo.value.updatedAt;
  myid.value = memo.value.ownerTraqId
  console.log("user判定", memo.value.ownerTraqId, userStore.traqId, memo.value.ownerTraqId == userStore.traqId);
  
  const res = await fetch("/api/wiki/user/favorite");
  if(res != null && res.ok){
    favorites.value = await res.json();
  }
  favorites.value.forEach(favorite => {
    if(memo.value != null && favorite.id == memo.value.id){
      isLiking.value = true;
    }
  });
  passedYear.value = getPassedTime(memo.value.updatedAt).year
})
const TagClick = (tag :string) => {
    router.push('/wiki/tag/' + tag.replace(/ /g, "+"))
}
const Edit = () =>{
  router.push("/wiki/editmemo/" + memo.value.id);
}
const StartLiking = async (memo: Memo) => {
  if (isLiking.value) {
    isLiking.value = false;
    await fetch("/api/wiki/user/favorite", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wikiId: memo.id.toString()
      })
    });
    memo.favorites -= 1;
  }else {
    isLiking.value = true;
    await fetch("/api/wiki/user/favorite", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wikiId: memo.id.toString()
      })
    });
    memo.favorites += 1;
  }
}
</script>

<template>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn" crossorigin="anonymous">
  <div :class="$style.title" v-html="title"></div>
  <Info :year="passedYear" v-if="passedYear != ''" />
  <button type="button" @click="Edit" :class="$style.editButton" v-if="myid == memo.ownerTraqId">edit</button>
  <div :class="$style.tagcontainer">
    <button type="button" @click="TagClick(tag)" v-for="tag in memo.tags" :key="tag" :class="$style.tag">{{ tag }}</button>
  </div>
  <br>
  <br>
  <button v-if="isLiking" :class="$style.iine" @click.stop="StartLiking(memo)">
    <font-awesome-icon :icon="['fas', 'heart']" />
    <span>いいね！</span>
    <span class="favorite_count">{{ memo.favorites }}</span>
  </button>
  <button v-else :class="$style.iine" @click.stop="StartLiking(memo)">
    <font-awesome-icon :icon="['far', 'heart']" />
    <span>いいね！</span>
    <span class="favorite_count">{{ memo.favorites }}</span>
  </button>
  <br>
  <div v-html="content" :class="$style.content"></div>
  <br>
  <br>
</template>
<style module>
.iine{
  background-color: rgb(245, 245, 245);
  margin-left: 20px;
  margin-top: -10px;
  float: left;
}
.title{
    text-align: left;
    margin: 10px 10px;
    padding:5px;
    font-size: 200%;
    font-weight:bold;
    padding-left: 40px;
    padding-right: 40px;
    border-bottom: 5px double lightgray;
}
.tagcontainer{
  margin-top: 10px;
  margin-left: 20px;
}
.editButton{
  background-color: rgb(245, 245, 245);
  font-weight: bold;
  margin-right: 30px;
  float: right;
}
.editButton:hover{
    background-color: rgb(230, 230, 230);
}
.tag{
    background-color: rgb(244, 244, 244);
    border-radius: 2px;
    margin: 2px;
    font-size: 13px;
    font-weight: bold;
    width: 15%;
    height: 25px;
    line-height: 10px;
    float: left;
}
.content h1,h2{
  border-bottom: 1px solid lightgray;
  margin-bottom: 20px;
  padding-top: 140px;
  margin-top: -140px;
}

.content h3,h4,h5,h6{
  text-align: left;
  padding-top: 140px;
  margin-top: -140px;
}
.content{
  margin-top: 15px;
  padding:5px;
  padding-left: 50px;
  padding-right: 40px;
  text-align: left;
}
.content p{
  line-height: 1.9em;
}
.content :not(pre) > code{
  background-color: rgb(236, 236, 236);
  font-size: 16px;
  background-color: rgb(236, 236, 236);
  border-radius: 6px;
  padding: 3px 10px;
  margin: 0px 2px;
}
.content pre > code{
  margin: 10px 0px;
  border-radius: 10px ;
}
.content th{
    border: 1px solid black;
    background-color: rgb(244, 244, 244);
}
.content td{
    border: 1px solid black;
    background-color: rgb(255, 255, 255);
}
.content tr{
    padding-right: 4px;
    padding-left: 4px;
    width: 30%;
    height: 40px;
}
.content table{
    border: 1px solid black;
    border-collapse: collapse;
    width: 90%;
    table-layout: fixed;
    margin: 0 auto; 
}
.content ul{
    padding-left: 30px;
    text-align: left;
}
.content li:has(input){
    list-style:none;
    text-align: left;
}
.content li > input{
  margin-right: 10px
}
.content ol{
  margin-left: 10px;
}
.content li{
  padding-left: 10px;
}
.content blockquote{
    border-left: 3px solid lightgray;
    color: gray;
    padding-left: 10px;
}
.content img{
    max-width: 100%;
}
.editor{
    font-size: large;
    line-height: 1.5em;
    padding-top: 5px;
    padding-left: 10px;
    padding-right: 10px;
    width: 90%;
    height: 200px;
    resize:none;
    border-color: lightgray;
}
.editor:focus{
    border-color: gray;
}
.editors{
    display: flex;
}
.uppercontent{
    text-align: left;
}
.uppercontent button{
    color: rgb(90, 90, 90);
}

</style>