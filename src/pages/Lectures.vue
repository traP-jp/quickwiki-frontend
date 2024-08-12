<script setup lang="ts">


const sougou = 


</script>

<template>
    <h1>Lectures 講習会資料</h1>
    <div>
        <button class="side-bar" @click="sougou">総合/融合</button>
        <button class="side-bar" @click="SysAd">SysAd</button>
        <button class="side-bar" @click="algorithm">algorithm</button>
        <button class="side-bar" @click="CTF">CTF</button>
        <button class="side-bar" @click="Kaggle">Kaggle</button>
        <button class="side-bar" @click="Game">Game</button>
        <button class="side-bar" @click="sound">sound</button>
        <button class="side-bar" @click="graphics">graphics/design</button>

    </div>
</template>

<style >
.side-bar {
  margin: 5px;
  padding: 10px;
  background-color: #f0f0f0;
  border: none;
  cursor: pointer;
}

.side-bar:hover {
  background-color: #ccc;
}
</style>