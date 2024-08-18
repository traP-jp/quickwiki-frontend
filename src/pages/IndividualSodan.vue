<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '../router'
import { Marked } from 'marked'

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
const question = ref<string>( );
const answers = ref<string[]>([]);
const route = useRoute();
const marked = new Marked();
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
    question.value = await marked.parse(sodan.value.questionMessage.content);
    for(let i=0; i < sodan.value.answerMessages.length; i++){
      answers.value[i] = await marked.parse(sodan.value.answerMessages[i].content);
      sodan.value.answerMessages[i].content = answers.value[i]

    }
})
const TagClick = (tag :string) => {
    router.push('/tag/' + tag)
}
// errorがユーザーに伝わるように
// 
</script>

<template>
    <h1>{{ sodan.title }}</h1>
    <div class="clear">
    <button type="button" @click="TagClick(tag)" v-for="tag in sodan.tags" :key="tag" class="tag">{{ tag }}</button>
    </div>
    <br>
    <br>
    <h2>question:</h2>
    <div v-html="question" class="msg leftContent"></div>
    <!-- markdownにする！！！！！！！ -->
     <h2>answer:</h2>
     <div v-for="msg in sodan.answerMessages" :key="msg.createdAt" :class="{leftContent: msg.userTraqId == sodan.questionMessage.userTraqId}">
        <div :class="{rightContent: msg.userTraqId != sodan.questionMessage.userTraqId}">
            <div v-html="msg.content" class="msg"></div>
        </div>
     </div>
</template>

<style scoped>
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
.leftContent{
    text-align: left;
}
.rightContent{
    text-align: right;
}
</style>