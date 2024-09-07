<script setup lang="ts">
import {onMounted, ref} from "vue";
import {Marked} from "marked";
import {markedHighlight} from "marked-highlight";
import hljs from "highlight.js";
import TraqMessage from "../types/message";
import {convertDate} from "../lib/date";
import markedKatex from "marked-katex-extension";

const props = defineProps<{
  message: TraqMessage
}>()
const message = ref<TraqMessage>(props.message)
const content = ref<string>("")
const citations = ref<string[]>([])
const marked = new Marked(markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'js'
        return hljs.highlight(code, { language }).value
      }
    })).use(markedKatex({
          throwOnError: false,
          nonStandard: true
    })
);
marked.setOptions({ breaks: true });
const icon = ref<string>("https://q.trap.jp/api/v3/public/icon/" + message.value.userTraqId)
// const icon = ref<string>("https://q.trap.jp/api/v3/public/icon/kavos")
const fileUrls = ref<string[]>([])

onMounted( async () => {
  content.value = await marked.parse(message.value.content)
  content.value = content.value.replaceAll("<pre><code>",'<pre><code class="hljs language-js">')
  const stamps = content.value.match(/:[\w-]+:/g)
  // console.log(stamps)
  // if(stamps != null){
  //   const stampContents = stamps.map(async(stamp) =>{
  //     ---------------stampid不明-------------
  //   })
  // }
  for(let i=0; i < message.value.citations.length; i++){
    const citation = await marked.parse(message.value.citations[i].content)
    message.value.citations[i].content = citation.replaceAll("<pre><code>",'<pre><code class="hljs language-js">')
  }

  for (const stamp of message.value.stamps) {
    const res = await fetch("/api/stamps/" + stamp.stampId)
    const body = await res.blob()
    stamp.stampUrl = URL.createObjectURL(body)
  }

  await extraceFileUrls()
  extractCitation()
})

const extraceFileUrls = async () => {
  const re = /https:\/\/q.trap.jp\/files\/[0-9a-zA-Z-]{36}/g;
  const urls = [...message.value.content.matchAll(re)].map((match) => match[0])
  if(urls === null) return
  for (const url of urls) {
    const fileId = url.slice("https://q.trap.jp/files/".length)
    const res = await fetch("/api/files/" + fileId)
    const body = await res.blob()
    if (body.type.startsWith("image")){
      fileUrls.value.push(URL.createObjectURL(body))
    }
  }
}

const extractCitation = () => {
  const re = /https:\/\/q.trap.jp\/messages\/[0-9a-zA-Z-]{36}/g
  content.value = content.value.replaceAll(re, "")
}
</script>

<template>
  <div :class="$style.msg">
    <div :class="$style.msg_body">
      <img :src="icon" width="40" height="40" alt="icon" :class="$style.icon">
      <header :class="$style.header">
        <p :class="$style.user_traq_id">@{{message.userTraqId}}</p>
        <p :class="$style.created_at">{{message.createdAt}}</p>
      </header>
      <div :class="$style.msg_content" >
        <div v-html="content"></div>
        <img v-for="url in fileUrls" :src="url" :class="$style.image" alt="file">
        <div v-for="citation in message.citations" :key="citation.createdAt" :class="$style.citation">
          <img :src="'https://q.trap.jp/api/v3/public/icon/' + citation.userTraqId" width="24" height="24" alt="icon" :class="$style.citation_icon">
          <div :class="$style.citation_header">
            <p :class="$style.citation_user_traq_id">@{{citation.userTraqId}}</p>
            <p :class="$style.citation_created_at">{{citation.createdAt}}</p>
          </div>
          <div :class="$style.citation_content">
            <div v-html="citation.content"></div>
          </div>
        </div>
      </div>
    </div>
    <div :class="$style.stamps">
      <div v-for="stamp in message.stamps" :class="$style.stamp">
        <img :src="stamp.stampUrl" width="20" height="20" alt="stamp">
        <p>{{stamp.count}}</p>
      </div>
    </div>
  </div>
</template>

<style module>
.msg{
  margin-top: 15px;
  padding:5px;
  font-family: "M PLUS 1p", sans-serif;
}

.msg_body {
  display: grid;
  grid-template-rows: 20px 20px 1fr;
  grid-template-columns: 40px 1fr;
  text-align: left;
}

.msg_content {
  grid-row: 2 / 4;
  grid-column: 2;
  padding-left: 10px;
  max-width: 145vh;
  word-break: break-all;
}
.msg_content :not(pre) > code{
  background-color: rgb(236, 236, 236);
  font-size: 16px;
  background-color: rgb(236, 236, 236);
  border-radius: 6px;
  padding: 3px 10px;
  margin: 0px 2px;
}
.msg_content pre > code{
  margin: 10px 0px;
  border-radius: 10px ;
}
.msg_contentt th{
    border: 1px solid black;
    background-color: rgb(244, 244, 244);
}
.msg_content td{
    border: 1px solid black;
    background-color: rgb(255, 255, 255);
}
.msg_content tr{
    padding-right: 4px;
    padding-left: 4px;
    width: 30%;
    height: 40px;
}
.msg_content table{
    border: 1px solid black;
    border-collapse: collapse;
    width: 90%;
    table-layout: fixed;
    margin: 0 auto; 
}
.msg_content ul{
    padding-left: 30px;
    text-align: left;
}
.msg_content li:has(input){
    list-style:none;
    text-align: left;
}
.msg_content li > input{
  margin-right: 10px
}
.msg_content ol{
  margin-left: 10px;
}
.msg_content li{
  padding-left: 10px;
}
.msg_content blockquote{
    border-left: 3px solid lightgray;
    color: gray;
    padding-left: 10px;
}
.msg_content img{
    max-width: 100%;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  grid-row: 1;
  grid-column: 2;
  padding-left: 10px;
}

.icon {
  grid-row: 1 / 3;
  grid-column: 1;
  border-radius: 50%;
}

.user_traq_id {
  font-weight: bold;
  font-size: 1.1em;
}

.created_at {
  font-size: 0.8em;
  color: #777777;
  margin-left: 8px;
}

.stamps {
  display: flex;
  flex-direction: row;
  margin-top: 5px;
}

.stamp {
  display: flex;
  flex-direction: row;
  background-color: #eeeeee;
  margin-left: 10px;
  border-radius: 5px;
  padding: 2px;
}

.citation {
  display: grid;
  grid-template-rows: 24px 1fr;
  grid-template-columns: 24px 1fr;
  border-left: 3px solid #dddddd;
  padding-left: 10px;
  margin-top: 5px;
}

.citation_icon {
  grid-row: 1;
  grid-column: 1;
  border-radius: 50%;
}

.citation_header {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  grid-row: 1;
  grid-column: 2;
  padding-left: 5px;
}

.citation_content {
  grid-row: 2;
  grid-column: 2;
  padding-left: 5px;
  color: #444444;
}

.citation_user_traq_id {
  font-weight: bold;
  color: #444444;
}

.citation_created_at {
  font-size: 0.7em;
  color: #999999;
  margin-left: 8px;
}

.image {
  width: 50%;
}
</style>