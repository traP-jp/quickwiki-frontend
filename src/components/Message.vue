<script setup lang="ts">
import {onMounted, ref} from "vue";
import {Marked} from "marked";
import {markedHighlight} from "marked-highlight";
import hljs from "highlight.js";
import TraqMessage from "../types/message";

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
// const icon = ref<string>("https://q.trap.jp/api/v3/public/icon/" + message.value.userTraqId)
const icon = ref<string>("https://q.trap.jp/api/v3/public/icon/kavos")

onMounted( async () => {
  content.value = await marked.parse(message.value.content)
})
</script>

<template>
  <div :class="$style.msg">
    <img :src="icon" width="40" height="40" alt="icon" :class="$style.icon">
    <header :class="$style.header">
      <span>{{message.userTraqId}}</span>
      <span>{{message.createdAt}}</span>
    </header>
    <div v-html="content" :class="$style.msg_content"></div>
  </div>
</template>

<style module>
.msg{
  background-color: rgb(244, 244, 244);
  margin-top: 15px;
  padding:5px;
  display: grid;
  grid-template-rows: 20px 20px 1fr;
  grid-template-columns: 40px 1fr;
}

.msg_content {
  font-weight:bold;
  grid-row: 2 / 4;
  grid-column: 2;
  padding-left: 10px;
}

.header {
  display: flex;
  grid-row: 1;
  grid-column: 2;
  padding-left: 10px;
}

.icon {
  grid-row: 1 / 3;
  grid-column: 1;
  border-radius: 50%;
}
</style>