<script setup lang="ts">
import MarkDownEditor from '../components/MarkDownEditor.vue';
const SubmitSodan = async() =>{
    // sodan作るAPiない...
    // const responce = await fetch('/api/wiki/search', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         query: keywords[0], 
    //         tags: tags})
    // }).catch((e) => console.log(e))
    // if(responce && responce.ok){
    //     wikis.value = await responce.json();
    // }
}
</script>
<template>
    <div :class="$style.contents">
        <h1>CreateSodan</h1>
        <MarkDownEditor :isSodan="true" />
    </div>
</template>
<style module>
.contents{
    padding-left: 20px;
}
</style>
