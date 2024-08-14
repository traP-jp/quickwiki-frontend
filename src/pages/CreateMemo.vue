<template>
    <br>
    <input type="text" placeholder="title" v-model="title"/>
    <p></p>
    <mavon-editor :toolbars="markdownOption" language="en" style="width: 80%;margin: 0 auto;" v-model="content" />
    <br>
    <button @click="createSodan">submit</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import 'mavon-editor/dist/css/index.css';
type Memo = {
    id: number,
    type: string,
    title: string,
    content: string,
    ownerTraqId: string,
    createdAt: string,
    updatedAt: string,
    tags: string[]
}
const content = ref("");
const title = ref("");
const result = ref<Memo>()
const createSodan = async () => {
    try {
        if(title.value == "" || content.value == ""){
            throw new Error('Please Set the title and content');
        }
        const response = await fetch("/api/memo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title.value,
                content: content.value
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        result.value = await response.json();
        title.value = "";
        content.value = "";
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}
</script>
