<script setup lang="ts">
import { use } from 'marked';
import { onBeforeUpdate, onMounted, ref, Ref } from 'vue';
import { useRoute } from 'vue-router';

console.log(useRoute().path)
const isMyPage = ref<boolean>(false);
onMounted(() =>{
  isMyPage.value = useRoute().path == "/" || useRoute().path == "/wiki/mywiki"
})

onBeforeUpdate(() =>{
  isMyPage.value = useRoute().path == "/" || useRoute().path == "/wiki/mywiki"
})
</script>
<template>
  <div :class="$style.container">
    <div class="sidebar">
      <div class="sidebar_content">
        <ul>
          <router-link to="/wiki/mywiki">
            <li>自分のWiki</li>
          </router-link>
          <a :class="$style.headerLink" href="#memo" v-if="isMyPage">
            <li>備忘録一覧</li>
          </a>
          <a :class="$style.headerLink" href="#sodan" v-if=isMyPage>
            <li>相談一覧</li>
          </a>
          <router-link to="/wiki/favoritewiki">
            <li>お気に入りのWiki</li>
          </router-link>
          <router-link to="/wiki/creatememo">
            <li>Wikiを書く</li>
          </router-link>
        </ul>
      </div>
    </div>
    <main :class="$style.view">
      <router-view />
    </main>
  </div>
</template>

<style module>
* {
  margin: 0;
  padding: 0;
}
.headerLink{
  background-color: blue;
  color: gray;
}
.container {
  display: flex;
  height: 100vh;
}

main {
  flex: 1 1 auto;
}

.sidebar_content {
  top: 0;
}
.view{
  border-left: 5px double gray;
}
</style>
