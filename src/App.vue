<script setup lang="ts">
import Header from "./components/Header.vue";
import { ref, onMounted } from 'vue'
import { useUserStore } from './store/user.js';
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const userStore = useUserStore();
const existUser = ref<boolean>(false);
const $toast = useToast();
const userTraqId = ref<string>("");

onMounted(async() =>{
  await userStore.setUser();
  existUser.value = userStore.traqId != "";
  if(!existUser.value){
    $toast.error("can't get id", {
      duration: 1200,
      position:  'top-right'
    })
  }
  userTraqId.value = userStore.traqId;
})
</script>

<template>
  <div :class="$style.page" id="page">
    <Header :user-traq-id="userTraqId" />
    <router-view :class="$style.contents" />
  </div>
</template>
<style module>
.page {
  height: fit-content;
  min-height: 100%;
  scroll-behavior: smooth;
}
.contents {
  height: fit-content;
}
</style>