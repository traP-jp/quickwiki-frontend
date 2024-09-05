<script setup lang="ts">
import {onMounted, ref} from "vue";
import {Marked} from "marked";
import {markedHighlight} from "marked-highlight";
import hljs from "highlight.js";
import TraqMessage from "../types/message";
import {convertDate} from "../lib/date";

const props = defineProps<{
  message: TraqMessage
}>()
const message = ref<TraqMessage>(props.message)
const content = ref<string>("")
const marked = new Marked(markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext'
        return hljs.highlight(code, { language }).value
      }
    })
);
const icon = ref<string>("https://q.trap.jp/api/v3/public/icon/" + message.value.userTraqId)
// const icon = ref<string>("https://q.trap.jp/api/v3/public/icon/kavos")
const fileUrls = ref<string[]>([])

onMounted( async () => {
  content.value = await marked.parse(message.value.content)

  for (const stamp of message.value.stamps) {
    const res = await fetch("/api/stamps/" + stamp.stampId)
    const body = await res.blob()
    stamp.stampUrl = URL.createObjectURL(body)
  }

  await extraceFileUrls()
  message.value.createdAt = convertDate(message.value.createdAt)
  message.value.updatedAt = convertDate(message.value.updatedAt)
  for (let i = 0; i < message.value.citations.length; i++) {
    message.value.citations[i].createdAt = convertDate(message.value.citations[i].createdAt)
    message.value.citations[i].updatedAt = convertDate(message.value.citations[i].updatedAt)
  }
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