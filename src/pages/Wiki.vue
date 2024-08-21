<script setup lang="ts">
import { ref } from 'vue'
import router from '../router';

const SearchWord = ref<string>("");
const Words = ref<string[]>([])
const ErrorMessage = ref<string>("");
const tags = ref<string[]>([]);
const keywords = ref<string[]>([]);
const Submit = () => {
    if(SearchWord.value == ''){
        return false;
    }
    tags.value = [];
    keywords.value = [];
    const SearchWords = SearchWord.value.split(/\s+/);
    // SearchWords.forEach((SearchWord) =>{
    //     Words.value = Words.value.concat(SearchWord.split("　"));
    // })
    SearchWords.forEach((word) =>{
        if(word.substring(0,1) == "#" || word.substring(0,1) == "＃"){
            if(word.substring(1) != ""){
                tags.value.push(word.substring(1));
            }
        }else{
            if(word != ""){
                keywords.value.push(word);
            }
        }
    })
    router.push('/wiki/search?tags=' + tags.value.join(',') + '&keywords=' + keywords.value.join(','));
}
</script>

<template>
    <input v-model="SearchWord" type="search" @keypress.enter="Submit">
    <input type="button" @click="Submit" value="検索">
    <router-view />
</template>