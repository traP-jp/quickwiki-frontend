<script setup lang="ts">
import { onMounted, ref } from "vue";
import router from "../router";
import { useUserStore } from '../store/user.js';
import { useToast } from "vue-toast-notification";
import Wiki from "../types/wiki";
import { convertDate } from "../lib/date";

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
const iconUrl = ref<string>("")


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
  iconUrl.value = "https://q.trap.jp/api/v3/public/icon/" + wiki.value.ownerTraqId
  //iconUrl.value = "https://q.trap.jp/api/v3/public/icon/kavos"
  wiki.value.createdAt = convertDate(wiki.value.createdAt)
  wiki.value.updatedAt = convertDate(wiki.value.updatedAt)
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
    wiki.favorites -= 1;
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
    wiki.favorites += 1;
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
  <div v-if="!hide" :class="$style.card" @click="SelectWiki(wiki)">
    <img :src="iconUrl" :class="$style.icon" />
    <header :class="$style.header">
      <p :class="$style.owner_traq_id">@{{wiki.ownerTraqId}}</p>
      <p :class="$style.created_at">{{wiki.createdAt}}</p>
    </header>
    <div :class="$style.content">
      <div :class="$style.title">{{ wiki.title }}</div>
      <div :class="$style.abstract">{{ wiki.Abstract }}</div>
      <div :class="$style.button_container">
        <div
            v-for="tag in wiki.tags"
            :key="tag"
        >
          <button
              :class="$style.tag_content"
              type="button"
              @click.stop="TagClick(tag)"
              v-if="tag != ''"
          >
            {{ tag }}
          </button>
        </div>
      </div>
      <div :class="$style.button_container">
        <button v-if="isLiking" :class="$style.iine" @click.stop="StartLiking(wiki)">
          <font-awesome-icon :icon="['fas', 'heart']" />
          <span>いいね！</span>
          <span :class="$style.favorite_count">{{ wiki.favorites }}</span>
        </button>
        <button v-else :class="$style.iine" @click.stop="StartLiking(wiki)">
          <font-awesome-icon :icon="['far', 'heart']" />
          <span>いいね！</span>
          <span :class="$style.favorite_count">{{ wiki.favorites }}</span>
        </button>
        <button v-if="canDelete" :class="$style.iine" @click.stop="DeleteMemo(wiki)">
          <font-awesome-icon :icon="['fas', 'trash-can']" transform="shrink-2" />削除
        </button>
      </div>
    </div>
  </div>
</template>

<style module>
.button_container {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  align-items: center;
}

.tag_content {
  margin: 5px;
  background-color: rgb(244, 244, 244);
}

.tag_content:hover {
  background-color: rgb(211, 211, 211);
}

.card:hover {
  border: 2px solid rgba(253, 122, 0, 0.4);
  box-shadow: 0 0 5px rgba(253, 122, 0, 0.4);
  cursor: pointer;
}

.abstract {
  font-size: 15px;
  text-align: left;
  list-style: none;
  overflow-wrap: anywhere;
}

.card {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  grid-template-rows: 20px 20px 1fr;
  padding: 16px;
  background-color: #fff;
  border: 2px solid #dddddd;
  border-radius: 6px;
  margin-bottom: 16px;
  transition-property: box-shadow, border;
  transition-duration: 0.2s;
}

.title {
  font-size: 22px;
  text-align: left;
  list-style: none;
  overflow-wrap: anywhere;
}

.title:hover {
  text-decoration: underline solid #000000 0.15rem;
}

.iine {
  font-size: 18px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
}

.icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  grid-column: 1;
  grid-row: 1 / 3;
}

.header {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  padding-left: 10px;
}

.content {
  grid-column: 2;
  grid-row: 2 / 4;
  padding-left: 10px;
}

.owner_traq_id {
  font-weight: bold;
  font-size: 1.1em;
}

.created_at {
  font-size: 0.8em;
  color: #777777;
  margin-left: 8px;
}

@media screen and (max-width: 960px) {

}
</style>
