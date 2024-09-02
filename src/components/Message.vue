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

onMounted( async () => {
  console.log(`message: ${message.value.content}`)
  content.value = await marked.parse(message.value.content)
  console.log(`content: ${content.value}`)
})
</script>

<template>
  <div v-html="content" :class="$style.msg"></div>
</template>

<style module>
.msg{
  background-color: rgb(244, 244, 244);
  margin-top: 15px;
  padding:5px;
  font-weight:bold;
  padding-left: 40px;
  padding-right: 40px;
}
</style>