<script setup lang="ts">
import { onMounted, ref } from "vue";
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import WikiCard from '../components/WikiCard.vue';

const $toast = useToast();

type Wiki = {
    id: number,
    type: string,
    title: string,
    Abstract: string,
    createdAt: string,
    updatedAt: string,
    ownerTraqId: string,
    tags: string[]
}

const wikis = ref<Wiki[]>([]);
const memos = ref<Wiki[]>([]);
const sodans = ref<Wiki[]>([]);

onMounted(async () => {
  const resMyWiki = await fetch("/api/wiki/user");
  if (resMyWiki.ok) {
    wikis.value = await resMyWiki.json();
    memos.value = wikis.value.filter(value =>{
      return value.type == "memo"
    });
    sodans.value = wikis.value.filter(value =>{
      return value.type == "sodan"
    });
  }else{
    $toast.error("something wrong", {
        duration: 1200,
        position:  'top-right'
    })
  }
});
</script>

<template>
  <div :class="$style.container">
    <main>
      <h1>MyWiki</h1>
      <h2 :class="$style.anker" id="memo">備忘録一覧</h2>
      <table class="cardTable">
        <WikiCard :wiki="memo" :isMyPage="true" v-for="memo in memos" :key="memo.id" />
      </table>
      <h2 :class="$style.anker" id="sodan">相談一覧</h2>
      <table class="cardTable">
        <WikiCard :wiki="sodan" :isMyPage="true" v-for="sodan in sodans" :key="sodan.id" />
      </table>
      <h2>すべて 後で消す！！！！！！！！</h2>
      <table class="cardTable">
        <WikiCard :wiki="wiki" :isMyPage="true" v-for="wiki in wikis" :key="wiki.id" />
      </table>
    </main>
  </div>
</template>
<style module>
* {
  margin: 0;
  padding: 0;
}
.anker{
  padding-top: 140px;
  margin-top: -140px;
}
.container {
  display: flex;
  height: 100vh;
}

main {
  flex: 1 1 auto;
  /* background: #f2f2f2; */
}
</style>
