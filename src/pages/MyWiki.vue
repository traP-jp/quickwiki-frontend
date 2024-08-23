<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '../store/user';
import WikiCard from '../components/WikiCard.vue';
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
const wikis = ref<Wiki[]>([]);
const userStore = useUserStore();

onMounted(async() => {
    const responce = await fetch('/api/wiki/user/' + userStore.traqId)
    if(responce && responce.ok){
        wikis.value = await responce.json();
    }else{
        $toast.error("something wrong", {
            duration: 1200,
            position:  'top-right'
        })
    }
});
</script>

<template>
    <h1>MyWiki</h1>
    <table 
    v-for="wiki in wikis"
    :key="wiki.id"
    >
        <WikiCard :wiki="wiki" />
    </table>
</template>