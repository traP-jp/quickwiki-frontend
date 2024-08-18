<script setup lang="ts">
import { compile, ref, watch } from 'vue'
import { Marked } from 'marked'
import hljs from 'highlight.js'
import { markedHighlight } from 'marked-highlight'
import 'highlight.js/styles/github-dark.css'
import { log } from 'console'
import { extractIdentifiers } from 'vue/compiler-sfc'

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

// 2回以上改行した際の補正
const CheckBeforeRow = (count: number) =>{
    for(let i=count-1; i >= 0; i--){
        if(afterContents.value[i] != "") return i + 1;
    }
    return -1;
}
// enterで改行されて増えた行のindexを探す
const searchChangedRow = () =>{
    afterContents.value = SodanContent.value.split(/\n/);
    let count = -1;
    for(let i=0; i <= beforeContents.value.length; i++){
        if(beforeContents.value[i] != afterContents.value[i]){
            if(afterContents.value[i] == ""){
                count = i;
            }else{
                count = i+1;
            }
            break;
        }
    }
    // console.log(count);
    if(count < 0){
        count = beforeContents.value.length;
    }
    // console.log(count);

    count = CheckBeforeRow(count)

    return count
}

const guessCorsorPosisCorsorPos = (count: number, pos: number) =>{
    const guessCorsorPos = afterContents.value.slice(0,count).join('\n').length + 1;
    return guessCorsorPos == pos
}
const CheckList = (count: number, pos: number) => {
    let countTab = 0;
    while(countTab + 2 <= afterContents.value[count-1].length){
        // console.log(afterContents.value[count-1].slice(countTab*2,countTab*2+2))
        if(afterContents.value[count-1].startsWith("  ",countTab*2)){
            countTab++;
        }else{
            break;
        }
    }
    // console.log(countTab);
    // console.log(afterContents.value[count-1].slice(countTab,countTab + 2));
    
    if(afterContents.value[count-1].startsWith("- ",countTab*2)){
        // console.log(afterContents.value[count-1].slice(countTab*2))
        if(afterContents.value[count-1].slice(countTab*2) == "- "){
            afterContents.value = afterContents.value.slice(0,count-1).concat(afterContents.value.slice(count));
            console.log(afterContents.value)
            return pos-3-countTab*2
            // afterContents.value[count-1] = "";
            
        }else{
            let tmp= "";
            for(let i=0;i < countTab;i++){
                tmp += "  ";
            }
            afterContents.value[count] = tmp + "- " + afterContents.value[count];
            console.log(afterContents.value)
            return pos+2+countTab*2
            
        }
    }
    return pos;
}   
const getCellcontents =(row: string) =>{
    let columns = row.split("|")
    columns.shift()
    columns.pop()
    return columns
} 
const getRownum = (example: string) =>{
    return getCellcontents(example).length
} 
const getTable = (count: number, rownum: number) =>{
    let minRow = count-1;
    let maxRow = count-1;
    let target = "";
    let i = 0;
    for(i=count-2; i >= 0; i--){
        if(beforeContents.value[i].startsWith("|") && beforeContents.value[i].endsWith("|") && getRownum(beforeContents.value[i]) == rownum){
            minRow = i;
        }else{
            break;
        }
    }
    for(i=count; i < beforeContents.value.length; i++){
        if(beforeContents.value[i].startsWith("|") && beforeContents.value[i].endsWith("|") && getRownum(beforeContents.value[i]) == rownum){
            maxRow = i;
        }else{
            break;
        }
    }

    let table = [[""]];
    for(i = 0; i < maxRow-minRow+1; i++){
        table[i] = getCellcontents(beforeContents.value[i])
    }

    return {table, maxRow, minRow};
}
const CreateRow = (rownum: number, maxlength: number[]) =>{
    let result = "|"
    for(let i=0; i < rownum; i++){
        for(let j=0; j < maxlength[i]; j++){
            result += " ";
        }
        result += "|";
    }
    return result;
}
const aryMax = (x: number,y: number) =>{
    return Math.max(x,y);
}
const getMaxCellLength = (table: string[][]) =>{
    let Maxlength: number[] = Array(table.length).fill(0);
    let length: number[] = Array(table[0].length).fill(0);
    // console.log(table.length)
    // console.log(table[0].length)
    for(let col = 0; col < table[0].length; col++){
        for(let row = 0; row < table.length; row++){
            // console.log(length[row])
            length[row] = table[row][col].length;
            // console.log(length[row])
        }
        // console.log(length)
        Maxlength[col] = length.reduce(aryMax);
        // console.log(Maxlength[col]);
        length = new Array(table[0].length).fill(0);
    }
    return Maxlength;
}
const setCellLength = (table: string[][], maxLength: number[]) =>{
    let newtable: string[][] = new Array(table.length).fill(new Array(table[0].length).fill(""));
    let tmp: string[] = new Array(table[0].length).fill("")
    for(let row=0; row < table.length; row++){
        console.log(newtable[row]);
        tmp = table[row]
        for(let col=0; col < table[0].length; col++){

            for(let i=0; maxLength[col] > table[row][col].length; i++){
                
                // console.log(i,maxLength[col],table[row][col].length, i+1 < maxLength[col] - table[row][col].length)
                tmp[col] = tmp[col] + " ";
            }
        }
        newtable[row] = tmp
    }
    console.log(newtable);
    
    return newtable;
}
const CheckTable = (count: number, pos: number) =>{
    console.log(beforeContents.value)
    const rownum = getRownum(beforeContents.value[count-1])
    const tables = getTable(count,rownum);
    console.log(tables);
    const maxlength = getMaxCellLength(tables.table)
    console.log(maxlength);
    const newtable = setCellLength(tables.table,maxlength);
    console.log(newtable);
    for(let i=0; i <= tables.maxRow - tables.minRow; i++){
        afterContents.value[i + tables.minRow] = "|" + newtable[i].join("|") + "|";
    }
    
    afterContents.value[count] = CreateRow(rownum, maxlength);

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
const Check = (pos: number) =>{
    const count = searchChangedRow();
    let result = pos; 
    if(count >= 0){
        if(guessCorsorPosisCorsorPos(count,pos)){
            if(beforeContents.value[count-1].startsWith("|") && beforeContents.value[count-1].endsWith("|")){
                result = CheckTable(count, pos);
            }else{
               result =  CheckList(count, pos);
            }
            return result;
        }
    }
    return pos
}
const toMarkDown = async() =>{
    if(!lockFlg.value){
        // console.log('before:' + document.querySelector('textarea')?.selectionStart)
        let corsorPos = document.querySelector('textarea')?.selectionStart
        if(enterFlg.value && corsorPos){
            lockFlg.value = true;
            corsorPos = Check(corsorPos);
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
    padding: 10px;
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
