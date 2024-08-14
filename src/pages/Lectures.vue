<script setup lang="ts">
import { compileToFunction, devtools, onMounted, ref } from 'vue'
import router from '../router';
import { useRoute } from 'vue-router';
import { invokeArrayFns } from '@vue/shared';

const lectures = ref<string>('Now Preparing')

const dictonary = {
    'sougou':'総合/融合',
    'SysAd':'SysAd',
    'algorithm':'アルゴリズム',
    'CTF':'CTF',
    'Kaggle':'Kaggle',
    'Game':'ゲーム',
    'sound':'サウンド',
    'graphics':'グラフィック/デザイン',
    'others':'その他講習会',
}

onMounted(async () => {
    const res = await fetch('/api/lecture/byFolder/path?folderpath=' + useRoute().params.teams)
    if (res.ok) {
        lectures.value = await res.json()
    } 
    console.log(change.value)
})
const change = ref<string>('')
change.value=dictonary[useRoute().params.teams]



</script>
<template>
    <h1>Lectures</h1>
  <main>
    <div :class="$style.container">
        <header :class="$style.header">
            {{ change }}
        </header>

        <sidebar :class="$style.sidebar">
            <h2>講習会</h2>
            <router-link @click="change=dictonary['sougou']" to="/lectures/sougou">総合/融合</router-link>
            <router-link @click="change=dictonary['SysAd']" to="/lectures/SysAd">SysAd</router-link>
            <router-link @click="change=dictonary['algorithm']" to="/lectures/algorithm">アルゴリズム</router-link>
            <router-link @click="change=dictonary['CTF']" to="/lectures/CTF">CTF</router-link>
            <router-link @click="change=dictonary['Kaggle']" to="/lectures/Kaggle">Kaggle</router-link>
            <router-link @click="change=dictonary['Game']" to="/lectures/Game">ゲーム</router-link>
            <router-link @click="change=dictonary['sound']" to="/lectures/sound">サウンド</router-link>
            <router-link @click="change=dictonary['graphics']" to="/lectures/graphics">グラフィック/デザイン</router-link>
            <router-link @click="change=dictonary['others']" to="/lectures/others"><h2>その他講習会</h2></router-link>
        </sidebar>

    </div>
  </main>
</template>

<style module>
.container {
  max-width: fit-content;
  margin: auto;
}
.header {
  display: flex;
  justify-content: center;
}
.sidebar {
  display: flex;
  justify-content: left;
  background-color:aqua;
}
</style>