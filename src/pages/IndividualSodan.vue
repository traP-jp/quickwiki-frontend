<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import { useRoute } from 'vue-router'
import router from '../router'
import MarkDownEditor from '../components/MarkDownEditor.vue'
import 'highlight.js/styles/github-dark.css'
import { useUserStore } from '../store/user.js';
import TraqMessage from "../types/message";
import Message from "../components/Message.vue";
import Wiki from "../types/wiki";
import {convertDate, convertDateTime} from "../scripts/date";
import getPassedTime from '../scripts/getPassedTime.js'
import Info from '../components/Info.vue'
import {channelId2Name} from "../scripts/channelNameMap";

const userStore = useUserStore();

type Sodan = {
  id: number,
  title: string,
  channelId: string,
  tags: string[],
  questionMessage: TraqMessage,
  answerMessages: TraqMessage[],
  favorites: number
}
const title = ref<string>("");
const question = ref<string>("");
const answers = ref<string[]>([]);
const myid = ref<string>("");
const isClose = ref<boolean>(false);
const passedYear = ref<string>("")
const route = useRoute();
const isLiking = ref<boolean>(false)
const favorites = ref<Wiki[]>([])
const sodan = ref<Sodan>({
  id: 0,
  title: "",
  channelId: "",
  tags: [
    ""
  ],
  questionMessage: {
    userTraqId: "",
    content: "",
    createdAt: "",
    updatedAt: "",
    messageTraqId: "",
    stamps: [
      {
        stampId: "",
        stampUrl: "",
        count: 0
      }
    ],
    citations: [
      {
        userTraqId: "",
        content: "",
        createdAt: "",
        updatedAt: "",
      }
    ]
  },
  answerMessages: [
    {
      userTraqId: "",
      content: "",
      createdAt: "",
      updatedAt: "",
      messageTraqId: "",
      stamps: [
        {
          stampId: "",
          stampUrl: "",
          count: 0
        }
      ],
      citations: [
        {
          userTraqId: "",
          content: "",
          createdAt: "",
          updatedAt: "",
        }
      ]
    }
  ],
  favorites: 0
});
const messageReady = ref<boolean>(false);
const channelName = ref<string>("");

const Close = () =>{
  const updateDate = sodan.value.questionMessage.updatedAt.split(" ")
  const updateDates = updateDate[0].split("-")
  const now = new Date();
  const updateAt = new Date(Number(updateDates[0]), Number(updateDates[1]) - 1, Number(updateDates[2]), 0, 0, 0)
  updateAt.setDate(updateAt.getDate() + 7);
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

  const res = await fetch("/api/wiki/user/favorite");
  if(res != null && res.ok){
    favorites.value = await res.json();
  }
  if(favorites.value != null){
    favorites.value.forEach(favorite => {
      if(sodan.value != null && favorite.id == sodan.value.id){
        isLiking.value = true;
      }
    });
  }
  sodan.value.questionMessage.createdAt = convertDateTime(sodan.value.questionMessage.createdAt)
  sodan.value.questionMessage.updatedAt = convertDateTime(sodan.value.questionMessage.updatedAt)
  for (let i = 0; i < sodan.value.answerMessages.length; i++) {
    sodan.value.answerMessages[i].createdAt = convertDateTime(sodan.value.answerMessages[i].createdAt)
    sodan.value.answerMessages[i].updatedAt = convertDateTime(sodan.value.answerMessages[i].updatedAt)
  }
  passedYear.value = getPassedTime(sodan.value.questionMessage.updatedAt).year

  channelName.value = channelId2Name.get(sodan.value.channelId)
})

const TagClick = (tag :string) => {
    router.push('/wiki/tag/' + tag.replace(/ /g, "+"))
}
const StartLiking = async (sodan: Sodan) => {
  if (isLiking.value) {
    isLiking.value = false;
    await fetch("/api/wiki/user/favorite", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wikiId: sodan.id.toString()
      })
    });
    sodan.favorites -= 1;
  }else {
    isLiking.value = true;
    await fetch("/api/wiki/user/favorite", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wikiId: sodan.id.toString()
      })
    });
    sodan.favorites += 1;
  }
}

</script>

<template>
  <div class="contents">
    <div class="title" v-html="title"></div>
  <Info :year="passedYear" v-if="passedYear != ''" />
    <div class="tagcontainer">
      <button type="button" @click="TagClick(tag)" v-for="tag in sodan.tags" :key="tag" class="tag">{{ tag }}</button>
    </div>
    <button v-if="isLiking" class="iine" @click.stop="StartLiking(sodan)">
      <font-awesome-icon :icon="['fas', 'heart']" />
      <span>いいね！</span>
      <span class="favorite_count">{{ sodan.favorites }}</span>
    </button>
    <button v-else class="iine" @click.stop="StartLiking(sodan)">
      <font-awesome-icon :icon="['far', 'heart']" />
      <span>いいね！</span>
      <span class="favorite_count">{{ sodan.favorites }}</span>
    </button>
    <p class="channel_name">#{{ channelName }}</p>
    <div class="messages">
      <h2>Question:</h2>
      <message :message="sodan.questionMessage" v-if="messageReady" />
      <h2>Answer:</h2>
      <div v-for="msg in sodan.answerMessages" :key="msg.createdAt" class="leftContent">
        <div>
          <message :message="msg" v-if="messageReady" />
        </div>
      </div>
      <div class="mdeditor">
        <MarkDownEditor :editorType=3 :editSodanId="sodan.id" v-if="sodan.questionMessage.userTraqId == myid"/>
      </div>
    </div>
  </div>
</template>

<style scoped>

.title{
    text-align: left;
    margin-top: 5px;
    padding:5px;
    font-weight:bold;
    font-size: 32px;
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
    overflow: hidden;
}
.tag:hover{
    background-color: rgb(228, 228, 228);
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
.contents{
  width: 80%;
  margin: 0 auto;
}
.messages {
  margin-top: 50px;
  border-top: 1px solid #aaaaaa;
}
.channel_name {
  text-align: right;
}
</style>