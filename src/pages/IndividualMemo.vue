<script setup lang="ts">
import { ref, onMounted, onUpdated } from 'vue'
import { useRoute } from 'vue-router'
import router from '../router'
import { Marked } from 'marked'
import hljs from 'highlight.js'
import { markedHighlight } from 'marked-highlight'
import 'highlight.js/styles/github-dark.css'

type Sodan = {
    id: number,
    title: string,
    ownerTraqId: string,
    content: string,
    createdAt: string,
    updatedAt: string,
    tags: string[]
}
const title = ref<string>("");
const content = ref<string>("");
const updatedAt = ref<string>("");
const route = useRoute();
const marked = new Marked(markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext'
        return hljs.highlight(code, { language }).value
      }
    })
);
marked.setOptions({ breaks: true });
const memo = ref<Sodan>({
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
})
const TagClick = (tag :string) => {
    router.push('/tag/' + tag)
}
// errorがユーザーに伝わるように
// 
</script>

<template>
  <div class="title" v-html="title"></div>
  <div class="tagcontainer">
    <button type="button" @click="TagClick(tag)" v-for="tag in memo.tags" :key="tag" class="tag">{{ tag }}</button>
  </div>
  <br>
  <br>
  <div v-html="content" class="msg leftContent"></div>
</template>

<style scoped>
.title{
    text-align: left;
    margin-top: 5px;
    padding:5px;
    font-size: 200%;
    font-weight:bold;
    padding-left: 40px;
    padding-right: 40px;
}
.tagcontainer{
  margin-top: 10px;
  margin-left: 20px;
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
h2{
    text-align: left;
}
.msg{
    margin-top: 15px;
    padding:5px;
    padding-left: 40px;
    padding-right: 40px;
}
.isOthers{
  background-color: rgb(228, 228, 228);
}
.leftContent{
    text-align: left;
}
.rightContent{
    text-align: right;
}
</style>