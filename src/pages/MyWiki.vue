<script setup lang="ts">
import { onMounted, ref } from "vue";
import "../styles/SideBar.css";
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const wikis = ref<string>("Now Preparing");
const $toast = useToast();

onMounted(async () => {
  const resMyWiki = await fetch(
    "/api/wiki/user"
  );
  if (resMyWiki.ok) {
    wikis.value = await resMyWiki.json();
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
    </main>
  </div>
</template>
<style module>
* {
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  margin-top: 95px;
}

main {
  flex: 1 1 auto;
  background: #f2f2f2;
}

.content {
  background-color: #d63a3a;
  font-size: 35px;
  width: 100%;
  height: 100%;
  text-align: center;
}
</style>
