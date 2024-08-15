<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router';
import router from '../router';

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
const ErrorMessage = ref<string>("");
const tags = ref<string[]>([]);
const keywords = ref<string[]>([]);
const route = useRoute();
const wikis = ref<Wiki[]>([])

onMounted(async () => {
    if(route.query.keywords != null && route.query.tags != null && typeof(route.query.keywords) == 'string' && typeof(route.query.tags) == 'string'){
        keywords.value = route.query.keywords.split(',');
        tags.value = route.query.tags.split(',');
    }
    const responce = await fetch('/api/wiki/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query: keywords.value[0], 
            tags: tags.value})
    }).catch((e) => console.log(e))
    if(responce && responce.ok){
        wikis.value = await responce.json();
    }
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
    <table>
        <tr v-for="wiki in wikis" :key="wiki.id" @click="SelectWiki(wiki)">
            <!-- <button type="button" @click="SelectWiki(wiki)"> -->
                <th class="title">{{ wiki.title }}</th>
                <th class="content">{{ wiki.Abstract }}</th>
                <th>
                    <div  v-for="tag in wiki.tags" :key="tag" class="tag">
                        <button type="button" @click.stop="TagClick(tag)"> {{ tag }}</button>
                    </div>
                </th>
            <!-- </button> -->
        </tr>
    </table>
</template>
<style scoped>
button{
    width: 100%;
    height:100%;
    border-radius: 0%;
}
tr:hover{
    background-color: rgb(211, 211, 211);
}
tr{
    background-color: rgb(244, 244, 244);
    padding-right: 4px;
    width: 30%;
    height: 70px;
    transition: background-color 0.25ms;
}
table {
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
    margin: 2px;
    font-size: 10px;
}
</style>