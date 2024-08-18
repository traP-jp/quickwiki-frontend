<script setup lang="ts">
import { ref, watch } from 'vue'
import { Marked } from 'marked'
import hljs from 'highlight.js'
import { markedHighlight } from 'marked-highlight'
import 'highlight.js/styles/github-dark.css'
import { log } from 'console'

const title = ref<string>('');
const SodanContent = ref<string>("");
const MarkedContent = ref<string>("");
const beforeContents = ref<string[]>([]);
const afterContents = ref<string[]>([]);
const enterFlg = ref<boolean>(false);
const lockFlg = ref<boolean>(false);
const tabFlg = ref<boolean>(false);
const marked = new Marked(markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext'
        return hljs.highlight(code, { language }).value
      }
    })
);
marked.setOptions({ breaks: true });

const CheckBeforeRow = (count: number) =>{
    for(let i=count-1; i >= 0; i--){
        if(afterContents.value[i] != "") return i + 1;
    }
    return -1;
}

const CheckList = (pos: number) => {
    afterContents.value = SodanContent.value.split(/\n/);
    let count = -1;
    for(let i=0; i <= beforeContents.value.length; i++){
        if(beforeContents.value[i] != afterContents.value[i]){
            count = i;
            break;
        }
    }
    // console.log(count);
    if(count < 0){
        count = beforeContents.value.length;
    }
    // console.log(count);

    count = CheckBeforeRow(count)
    // console.log(count);
    if(count >= 0){
        // console.log(afterContents.value)
        const guessCorsorPos = afterContents.value.slice(0,count).join('\n').length + 1
        // console.log(afterContents.value.slice(0,count).join('\n'));
        console.log(guessCorsorPos)
        if(guessCorsorPos == pos){
            let countTab = 0;
            while(countTab + 2 <= afterContents.value[count-1].length){
                console.log(afterContents.value[count-1].slice(countTab*2,countTab*2+2))
                if(afterContents.value[count-1].slice(countTab*2,countTab*2+2) == "  "){
                    countTab++;
                }else{
                    break;
                }
            }
            console.log(countTab);
            console.log(afterContents.value[count-1].slice(countTab,countTab + 2));
            
            if(afterContents.value[count-1].slice(countTab*2,countTab*2 + 2) == "- "){
                console.log(afterContents.value[count-1].slice(countTab*2))
                if(afterContents.value[count-1].slice(countTab*2) == "- "){
                    afterContents.value = afterContents.value.slice(0,count-1).concat(afterContents.value.slice(count));
                    return pos-3-countTab*2
                    // afterContents.value[count-1] = "";
                    // console.log(afterContents.value)
                }else{
                    let tmp= "";
                    for(let i=0;i < countTab;i++){
                        tmp = tmp + "  ";
                    }
                    afterContents.value[count] = tmp + "- ";
                    return pos+2+countTab*2
                    // console.log(afterContents.value)
                }
            }
        }        
    }
    return pos;
}

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
const toMarkDown = async() =>{
    if(!lockFlg.value){
        // console.log('before:' + document.querySelector('textarea')?.selectionStart)
        let corsorPos = document.querySelector('textarea')?.selectionStart
        if(enterFlg.value && corsorPos){
            lockFlg.value = true;
            corsorPos = CheckList(corsorPos);
            SodanContent.value = afterContents.value.join('\n');
        }
        if(tabFlg.value && corsorPos){
            lockFlg.value = true;
            // console.log(SodanContent.value.slice(corsorPos-2,corsorPos))
            if(SodanContent.value.slice(corsorPos-2,corsorPos) == '- '){
                SodanContent.value = SodanContent.value.slice(0,corsorPos-2) + "  " + SodanContent.value.slice(corsorPos-2);
            }else{
                SodanContent.value = SodanContent.value.slice(0,corsorPos) + "  " + SodanContent.value.slice(corsorPos);
            }
            corsorPos += 2;
            // console.log(SodanContent.value);
        }
        MarkedContent.value = await marked.parse(SodanContent.value);
        // console.log('after:' + corsorPos)
        if(corsorPos) document.querySelector('textarea')?.setSelectionRange(corsorPos,corsorPos)
        enterFlg.value = false;
        tabFlg.value = false;
        lockFlg.value = false;
    }
}
const EnterDown = () =>{
    beforeContents.value = SodanContent.value.split(/\n/);
    enterFlg.value = true
}
const TabDown = () =>{
    tabFlg.value = true;
    // console.log("tab")
    toMarkDown();
}
watch(SodanContent, toMarkDown);
</script>
<template>
    <h1>CreateSodan</h1>
    <div :class="$style.editors">
        <div :class="[$style.editor, $style.content]">
            <div :class="$style.uppercontent">
                <h3>title</h3>
                <input type="text" placeholder="title..." v-model="title">
                <h3>contents</h3>
            </div>   
            <textarea :class="$style.downcontent" placeholder="contents..." v-model="SodanContent" v-on:keydown.enter="EnterDown" v-on:keydown.prevent.tab.exact="TabDown"></textarea>
        </div>
        <div :class="$style.content">
            <div :class="$style.uppercontent"></div>
            <div :class="[$style.viewer, $style.downcontent]" v-html="MarkedContent"></div>
        </div>
    </div>
    <!-- <buton type="button" @click="SubmitSodan"></buton> -->
</template>
<style module>
input{
    border:1px solid lightgray;
    width: 90%;
}
textarea{
    font-size: large;
    line-height: 1.5em;
    padding-top: 5px;
    width: 90%;
    height: 100px;
    resize:none;
    border-color: lightgray;
}
.editors{
    display: flex;
}
.viewer{
    border:1px solid lightgray;
    border-radius: 10px;
    overflow: scroll;
    max-height: 200px;
}
.content{
    width:45%;
    display:flex;
    flex-direction:column;
}
.uppercontent{
    text-align: left;
    flex-grow: 3;
}
.downcontent{
    flex-grow: 10;
}
</style>
