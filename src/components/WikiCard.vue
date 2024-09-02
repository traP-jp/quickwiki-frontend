<script setup lang="ts">
import { onMounted, ref } from "vue";
import router from "../router";
import { useUserStore } from '../store/user.js';
import { useToast } from "vue-toast-notification";
import Wiki from "../types/wiki";


const props = defineProps<{
  wiki: Wiki,
  isMyPage: Boolean
}>();
const wiki = ref(props.wiki);
const isMyPage = ref(props.isMyPage)
const canDelete = ref<boolean>(false)
const favorites = ref<Wiki[]>([])
const hide = ref<boolean>(false)
const userStore = useUserStore();
const $toast = useToast();


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
})
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
  <div v-if="!hide" class="card" @click="SelectWiki(wiki)">
    <div class="title">{{ wiki.title }}</div>
    <div class="content">{{ wiki.Abstract }}</div>
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
    </div>
  </div>
</template>

<style scoped>
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
