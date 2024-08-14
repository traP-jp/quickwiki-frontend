<script setup lang="ts">
import { ref, onMounted, computed, transformVNodeArgs } from 'vue'

const SearchWord = ref<string>("");
const tags = ref<string[]>([]);
const keywords = ref<string[]>([]);
const submit = async () => {
    if(SearchWord.value == ""){
        
    }
    tags.value = [];
    keywords.value = [];
    const SearchWords = SearchWord.value.split(" ");
    SearchWords.forEach((word) =>{
        if(word.substring(0,1) == "#"){
            tags.value.push(word);
        }else{
            keywords.value.push(word);
        }
    })
    const responce = await fetch('/api/wiki/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: keywords.value, 
            tags: tags.value})
    }).catch((e) => console.log(e))
}
</script>

<template>
    <input v-model="SearchWord" type="text">
    <input type="button" @click="submit" value="検索">
    <router-view />
</template>