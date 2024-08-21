<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import router from '../router';
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

type Wiki = {
    id: number,
    type: string,
    title: string,
    Abstract: string,
    createdAt: string,
    updatedAt: string,
    ownerTraqId: string,
    tags: string[]
}
const $toast = useToast();
const ErrorMessage = ref<string>("");
const getTags = ref<string[]>([]);
const getKeywords = ref<string[]>([]);
const route = useRoute();
const wikis = ref<Wiki[]>([])

async function Search(keywords :string[],tags :string[]) {
    const responce = await fetch('/api/wiki/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: keywords[0], 
            tags: tags})
    }).catch((e) => {
        $toast.error("something wrong", {
            duration: 1200,
            position:  'top-right'
        })
        return e;   
    })
    if(responce && responce.ok){
        wikis.value = await responce.json();
    }
}
onMounted(() =>{
    if(route.query.keywords != null && route.query.tags != null && typeof(route.query.keywords) == 'string' && typeof(route.query.tags) == 'string'){
        getKeywords.value = route.query.keywords.split(',');
        getTags.value = route.query.tags.split(',');
    }
    Search(getKeywords.value, getTags.value);
});
onBeforeRouteUpdate((to, from) => {
    console.log('search')
    if(to.query.keywords != null && to.query.tags != null && typeof(to.query.keywords) == 'string' && typeof(to.query.tags) == 'string'){
        getKeywords.value = to.query.keywords.split(',');
        getTags.value = to.query.tags.split(',');
    }
    Search(getKeywords.value,getTags.value);
});
const SelectWiki = (wiki :Wiki) =>{
    console.log(wiki)
    if(wiki.type == 'sodan'){
        router.push('/sodan/' + wiki.id.toString())
    }else if(wiki.type == 'memo'){
        router.push('/memo/' + wiki.id.toString())
    }
}
const TagClick = (tag :string) => {
    router.push('/tag/' + tag)
}
// tagとwikiが同時に作動しないように
// errorがユーザーに伝わるように
// 
</script>

<template>
    <table class="searchCard">
        <tr v-for="wiki in wikis" :key="wiki.id" @click="SelectWiki(wiki)">
            <!-- <button type="button" @click="SelectWiki(wiki)"> -->
                <th class="title">{{ wiki.title }}</th>
                <th class="content">{{ wiki.Abstract }}</th>
                <th class="tags">
                    <div  v-for="tag in wiki.tags" :key="tag" class="tag">
                        <button class="tagbutton" type="button" @click.stop="TagClick(tag)"> {{ tag }}</button>
                    </div>
                </th>
            <!-- </button> -->
        </tr>
    </table>
</template>
<style scoped>
.tagbutton{
    width: 100%;
    height:100%;
    border-radius: 0%;
}
.searchCard tr:hover{
    background-color: rgb(211, 211, 211);
}
.searchCard tr:has(.tag:hover){
    background-color: rgb(244, 244, 244);
}
.searchCard tr{
    background-color: rgb(244, 244, 244);
    padding-right: 4px;
    width: 30%;
    height: 70px;
    transition: background-color 0.175s 0.075s ease-out;
}
.searchCard{
    border-spacing: 0 2px;
    width: 90%;
    table-layout: fixed;
    margin: 0 auto; 
}
.title{
    font-size: 20px;
}
.content{
    font-size: 15px;
}
.tag{
    background-color: rgb(200, 200, 200);
    border-radius: 2px;
    margin: 3px;
    margin-right: 7px;
    font-size: 10px;
}
</style>