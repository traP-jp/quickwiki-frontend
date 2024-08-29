<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '../router'
import MarkDownEditor from '../components/MarkDownEditor.vue'
import { Marked } from 'marked'
import hljs from 'highlight.js'
import { markedHighlight } from 'marked-highlight'
import 'highlight.js/styles/github-dark.css'

type Sodan = {
  id: number,
  title: string,
  tags: string[],
  questionMessage: {
    userTraqId: string,
    content: string,
    createdAt: string,
    updatedAt: string,
    stamps: [
      {
        stampId: string,
        count: number
      }
    ]
  },
  answerMessages: [
    {
      userTraqId: string,
      content: string,
      createdAt: string,
      updatedAt: string,
      stamps: [
        {
          stampId: string,
          count: number
        }
      ]
    }
  ]
}
const title = ref<string>("");
const question = ref<string>("");
const answers = ref<string[]>([]);
const myid = ref<string>("");
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
const sodan = ref<Sodan>({
  id: 0,
  title: "",
  tags: [
    ""
  ],
  questionMessage: {
    userTraqId: "",
    content: "",
    createdAt: "",
    updatedAt: "",
    stamps: [
      {
        stampId: "",
        count: 0
      }
    ]
  },
  answerMessages: [
    {
      userTraqId: "",
      content: "",
      createdAt: "",
      updatedAt: "",
      stamps: [
        {
          stampId: "",
          count: 0
        }
      ]
    }
  ]
});

onMounted(async () => {

  const responce = await fetch('/api/sodan?wikiId=' + route.params.id)
  if(responce.ok){
      sodan.value = await responce.json();
  }
  title.value = await marked.parse(sodan.value.title);
  question.value = await marked.parse(sodan.value.questionMessage.content);
  for(let i=0; i < sodan.value.answerMessages.length; i++){
    answers.value[i] = await marked.parse(sodan.value.answerMessages[i].content);
    sodan.value.answerMessages[i].content = answers.value[i]
  }
  myid.value = sodan.value.questionMessage.userTraqId
})
const TagClick = (tag :string) => {
    router.push('/tag/' + tag)
}
// errorがユーザーに伝わるように
// 
</script>

<template>
  <h2>title:</h2>
  <div class="title" v-html="title"></div>
  <div class="tagcontainer">
    <button type="button" @click="TagClick(tag)" v-for="tag in sodan.tags" :key="tag" class="tag">{{ tag }}</button>
  </div>
  <br>
  <br>
  <h2>question:</h2>
  <div v-html="question" class="msg leftContent"></div>
  <!-- markdownにする！！！！！！！ -->
  <h2>answer:</h2>
  <div v-for="msg in sodan.answerMessages" :key="msg.createdAt" class="leftContent">
    <div>
      <div v-html="msg.content" class="msg" :class="{ isOthers: msg.userTraqId != sodan.questionMessage.userTraqId }"></div>
    </div>
  </div>
  <div class="mdeditor">
    <MarkDownEditor :editorType=3 v-if="sodan.questionMessage.userTraqId == myid"/>
  </div>
</template>

<style scoped>
.title{
    text-align: left;
    background-color: rgb(244, 244, 244);
    margin-top: 5px;
    padding:5px;
    font-weight:bold;
    padding-left: 40px;
    padding-right: 40px;
}
.tagcontainer{
  margin-top: 10px;
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
    float: right;
}
h2{
    text-align: left;
}
.msg{
    background-color: rgb(244, 244, 244);
    margin-top: 15px;
    padding:5px;
    font-weight:bold;
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
.mdeditor{
  margin: 20px;
}
</style>