<template>
  <div :class="$style.container">
    <wiki-side-bar :isMyPage="isMyPage" />
    <main>
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
  color: gray;
}
.container {
  display: flex;
  margin-top: -10px;
  padding-top: 10px;
  gap: 10px;
  height: fit-content;
  min-height: 100vh;
}

main {
  flex: 1 1 auto;
  height: 100vh;
}
.view{
  border-left: 5px double gray;
}
</style>
<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onBeforeUpdate, onMounted, ref } from 'vue';
import WikiSideBar from "../components/WikiSideBar.vue";

const isMyPage = ref<boolean>(false);
onMounted(() =>{
  isMyPage.value = useRoute().path == "/" || useRoute().path == "/wiki/mywiki"
})

onBeforeUpdate(() =>{
  isMyPage.value = useRoute().path == "/" || useRoute().path == "/wiki/mywiki"
})
</script>