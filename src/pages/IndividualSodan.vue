<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import { useRoute } from 'vue-router'
import router from '../router'
import MarkDownEditor from '../components/MarkDownEditor.vue'
import { Marked } from 'marked'
import hljs from 'highlight.js'
import { markedHighlight } from 'marked-highlight'
import 'highlight.js/styles/github-dark.css'
import { useUserStore } from '../store/user.js';
import TraqMessage from "../types/message";
import Message from "../components/Message.vue";

const userStore = useUserStore();

type Sodan = {
  id: number,
  title: string,
  tags: string[],
  questionMessage: TraqMessage,
  answerMessages: TraqMessage[]
}
const title = ref<string>("");
const question = ref<string>("");
const answers = ref<string[]>([]);
const myid = ref<string>("");
const isClose = ref<boolean>(false);
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
const messageReady = ref<boolean>(false);

const Close = () =>{
  const updateDate = sodan.value.questionMessage.updatedAt.split(" ")
  console.log(updateDate[0])
  const updateDates = updateDate[0].split("-")
  const now = new Date();
  const updateAt = new Date(Number(updateDates[0]), Number(updateDates[1]) - 1, Number(updateDates[2]), 0, 0, 0)
  updateAt.setDate(updateAt.getDate() + 7);
  console.log(now, updateAt)
  return now > updateAt;
}

onMounted(async () => {

  const responce = await fetch('/api/sodan?wikiId=' + route.params.id)
  if(responce.ok){
      sodan.value = await responce.json();
      messageReady.value = true;
  }
  title.value = sodan.value.title
  myid.value = sodan.value.questionMessage.userTraqId
  console.log("user判定", sodan.value.questionMessage.userTraqId, userStore, sodan.value.questionMessage.userTraqId == userStore.traqId)
  isClose.value = Close() && sodan.value.questionMessage.userTraqId == userStore.traqId;
  console.log("時間＆user判定", isClose.value)
})

const TagClick = (tag :string) => {
    router.push('/wiki/tag/' + tag.replace(/ /g, "+"))
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
  <message :message="sodan.questionMessage" v-if="messageReady" />
  <!-- markdownにする！！！！！！！ -->
  <h2>answer:</h2>
  <div v-for="msg in sodan.answerMessages" :key="msg.createdAt" class="leftContent">
    <div>
      <message :message="msg" v-if="messageReady" />
    </div>
  </div>
  <div class="mdeditor">
    <MarkDownEditor :editorType=3 :editSodanId="sodan.id" v-if="sodan.questionMessage.userTraqId == myid"/>
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