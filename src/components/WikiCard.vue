<script setup lang="ts">
import { onMounted, ref } from "vue";
import router from "../router";
import { useUserStore } from '../store/user.js';
import { useToast } from "vue-toast-notification";

type Wiki = {
  id: number;
  type: string;
  title: string;
  Abstract: string;
  createdAt: string;
  updatedAt: string;
  ownerTraqId: string;
  tags: string[];
};
const props = defineProps({
  wiki: Object,
  isMyPage: Boolean
});
const wiki = ref(props.wiki);
const isMyPage = ref(props.isMyPage)
const canDelete = ref<boolean>(false)
const favorites = ref<Wiki[]>([])
const hide = ref<boolean>(false)
const userStore = useUserStore();
const $toast = useToast();
const passedTime = ref<string>("")

const Pass = (update: string) =>{
  const now = new Date();
  console.log(update)
  const updateDate = update.split("T")
  console.log(updateDate[0])
  const updateDates = updateDate[0].split("-")
  const updateTimes = updateDate[1].split(":")
  updateTimes[2] = updateTimes[2].slice(2)
  const updatedAt = new Date(Number(updateDates[0]), Number(updateDates[1]) - 1, Number(updateDates[2]), Number(updateTimes[0]), Number(updateTimes[1]), Number(updateTimes[2]));
  const diffDate = new Date()
  console.log(diffDate.toLocaleDateString('ja-JP'))
  console.log(updatedAt.toLocaleDateString('ja-JP'), now.getFullYear() - updatedAt.getFullYear())
  diffDate.setFullYear(now.getFullYear() - updatedAt.getFullYear());
  console.log(diffDate.toLocaleDateString('ja-JP'), now.getMonth() - updatedAt.getMonth()-1)
  diffDate.setMonth(now.getMonth() - updatedAt.getMonth()-1);
  console.log(diffDate.toLocaleDateString('ja-JP'), now.getDate() - updatedAt.getDate())
  diffDate.setDate(now.getDate() - updatedAt.getDate());
  console.log(diffDate.toLocaleDateString('ja-JP'), now.getHours() - updatedAt.getHours())
  diffDate.setHours(now.getHours() - updatedAt.getHours());
  console.log(diffDate.toLocaleDateString('ja-JP'), now.getMinutes() - updatedAt.getMinutes())
  diffDate.setMinutes(now.getMinutes() - updatedAt.getMinutes());
  console.log(diffDate.toLocaleDateString('ja-JP'), now.getSeconds() - updatedAt.getSeconds())
  diffDate.setSeconds(now.getSeconds() - updatedAt.getSeconds());
  console.log(diffDate.toLocaleDateString('ja-JP'),diffDate.getFullYear()
  ,diffDate.getMonth(),
  diffDate.getDate(),
  diffDate.getHours(),
  diffDate.getMinutes(),
  diffDate.getSeconds())
  const year = diffDate.getFullYear();
  const month = year * 12 + diffDate.getMonth() + 1;
  const seconds = Math.floor((now.getTime() - updatedAt.getTime()) / 1000)
  const minute = Math.floor(seconds / 60)
  const hour = Math.floor(minute / 60)
  const date = Math.floor(hour / 24 );
  console.log(year, month, date, hour, minute, seconds)
  if(year > 0){
    return year.toString() + "年前";
  }else if(month > 0){
    return (month % 12).toString() + "ヶ月前"
  }else if(date > 0){
    return date.toString() + "日前"
  }else if(hour > 0){
    return (hour % 24).toString() + "時間前"
  }else if(minute > 0){
    return (minute % 60).toString() + "分前"
  }else if(seconds >= 0){
    return (seconds % 60).toString() + "秒前"
  }else{
    return "error"
  }
}
const isLiking = ref<boolean>(false);
onMounted(async() =>{
  const res = await fetch("/api/wiki/user/favorite");

  if(res != null && res.ok){
    favorites.value = await res.json();
  }
  favorites.value.forEach(favorite => {
    if(wiki.value != null && favorite.id == wiki.value.id){
      isLiking.value = true;
    }
  });
  canDelete.value = wiki.value.type == "memo" && isMyPage.value
  if(wiki.value != null) passedTime.value = Pass(wiki.value.updatedAt)
  console.log(passedTime.value)
})

const SelectWiki = (wiki: Wiki) => {
  console.log(wiki);
  if (wiki.type == "sodan") {
    router.push("/wiki/sodan/" + wiki.id.toString());
  } else if (wiki.type == "memo") {
    router.push("/wiki/memo/" + wiki.id.toString());
  }
};
const TagClick = (tag: string) => {
  router.push("/wiki/tag/" + tag.replace(/ /g, "+"));
};
const StartLiking = async (wiki: Wiki) => {
  if (isLiking.value) {
    isLiking.value = false;
    await fetch("/api/wiki/user/favorite", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wikiId: wiki.id.toString()
      })
    });
  }else {
    isLiking.value = true;
    await fetch("/api/wiki/user/favorite", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wikiId: wiki.id.toString()
      })
    });
  }
}
const DeleteMemo = async(wiki: Wiki) =>{
  console.log("user判定", wiki.ownerTraqId == userStore.traqId)
  if(wiki.type == "memo"){
    const response = await fetch("/api/memo",{
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wikiId: wiki.id.toString()
      })
    }).catch((e) => {
        $toast.error("something wrong", {
            duration: 1200,
            position:  'top-right'
        })
        return e;   
    })
    if(response && response.ok){
        hide.value = true;
    }
  }
}
</script>

<template>
  <tr v-if="!hide" class="card" @click="SelectWiki(wiki)">
    <li class="title">{{ wiki.title }}</li>
    <li class="content">{{ wiki.Abstract }}</li>
    <div class="button-container">
    <div
      v-for="tag in wiki.tags"
      :key="tag"
    >
      <button
        class="tag-content"
        type="button"
        @click.stop="TagClick(tag)"
        v-if="tag != ''"
      >
        {{ tag }}
      </button>
      </div>
    </div>
    <div class="button-container">
      <button v-if="isLiking" class="iine" @click.stop="StartLiking(wiki)">
        <font-awesome-icon :icon="['fas', 'heart']" /> いいね！
      </button>
      <button v-else class="iine" @click.stop="StartLiking(wiki)">
        <font-awesome-icon :icon="['far', 'heart']" /> いいね！
      </button>
      <button v-if="canDelete" class="iine" @click.stop="DeleteMemo(wiki)">
        <font-awesome-icon :icon="['fas', 'trash-can']" transform="shrink-2" />削除
      </button>
      <div class="passed">
        <p>{{ passedTime }}</p>
      </div>
    </div>
  </tr>
</template>

<style scoped>
.passed{
  height: 50px;
  line-height: 50px;
}
.button-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  margin-left: 80px;
}

.tag-content {
  margin: 5px;
  background-color: rgb(244, 244, 244);
}

.tag-content:hover {
  background-color: rgb(211, 211, 211);
}

.card:hover {
  border: 2px solid rgba(253, 122, 0, 0.4);
  box-shadow: 0 0 5px rgba(253, 122, 0, 0.4);
  cursor: pointer;
}
.title {
  font-size: 20px;
}

.content {
  font-size: 15px;
  text-align: left;
  margin-left: 80px;
  list-style: none;
}

.card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: #fff;
  border: 2px solid #dddddd;
  border-radius: 6px;
  margin-bottom: 16px;
  transition-property: box-shadow, border;
  transition-duration: 0.2s;
}

.title {
  font-size: 35px;
  text-align: left;
  margin-left: 80px;
  list-style: none;
}

.content {
  font-size: 25px;
  list-style: none;
}

.title:hover {
  text-decoration: underline solid #000000 0.15rem;
}

.iine {
  padding: 8px;
  font-size: 18px;
  width: 120px;
}
</style>
