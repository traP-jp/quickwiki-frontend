<script setup lang="ts">
import Header from "./components/Header.vue";
import { ref, onMounted } from 'vue'
import { useUserStore } from './store/user.js';
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const userStore = useUserStore();
const existUser = ref<boolean>(false);
const $toast = useToast();

onMounted(async() =>{
  await userStore.setUser();
  existUser.value = userStore.traqId != "";
  if(!existUser.value){
    $toast.error("can't get id", {
      duration: 1200,
      position:  'top-right'
    })
  }
})
</script>

<template>
  <div :class="$style.page">
    <Header />
    <router-view :class="$style.contents" />
  </div>
</template>
<style module>
.page {
  height: 100%;
  background: #f2f2f2;
  overflow-x: hidden;
}
.contents {
  height: fit-content;
}
</style>