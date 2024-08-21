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
    <h1>CreateSodan</h1>
    <MarkDownEditor />
</template>
<style module>

</style>
