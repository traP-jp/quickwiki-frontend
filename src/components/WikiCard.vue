<script setup lang="ts">
import { onMounted, ref } from "vue";
import router from "../router";
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
});
const wiki = ref(props.wiki);
const favorites = ref<Wiki[]>([])

const SelectWiki = (wiki: Wiki) => {
  console.log(wiki);
  if (wiki.type == "sodan") {
    router.push("/sodan/" + wiki.id.toString());
  } else if (wiki.type == "memo") {
    router.push("/memo/" + wiki.id.toString());
  }
};
const TagClick = (tag: string) => {
  router.push("/tag/" + tag.replace(/ /g, "+"));
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
</script>

<template>
  <tr v-if="wiki != null" class="card" @click="SelectWiki(wiki)">
    <li class="title">{{ wiki.title }}</li>
    <li class="content">{{ wiki.Abstract }}</li>
    <div class="tag-container">
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
    <button v-if="isLiking" class="iine" @click.stop="StartLiking(wiki)">
      <font-awesome-icon :icon="['fas', 'heart']" /> いいね！
    </button>
    <button v-else class="iine" @click.stop="StartLiking(wiki)">
      <font-awesome-icon :icon="['far', 'heart']" /> いいね！
    </button>
  </tr>
</template>

<style scoped>
.tag-container {
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
  background-color: rgb(211, 211, 211);
}
.card:has(.tag-container:hover) {
  background-color: rgb(244, 244, 244);
}
.card:has(.iine:hover) {
  background-color: rgb(244, 244, 244);
}
.card{
  background-color: rgb(244, 244, 244);
  padding-right: 4px;
  width: 30%;
  height: 70px;
  transition: background-color 0.25s ease-in-out;
}
.card {
  border-spacing: 0 2px;
  width: 90%;
  table-layout: fixed;
  margin: 0 auto;
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
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  margin-bottom: 16px;
  transition: box-shadow 0.3s ease;
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
  margin-left: 80px;
}
</style>
