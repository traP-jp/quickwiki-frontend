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
const MarkedTitle = ref<string>("");
const MarkedContent = ref<string>("");
const beforeContents = ref<string[]>([]);
const afterContents = ref<string[]>([]);
const contentHistory = ref<string[]>([""]);
const HistoryNum = ref<number>(0);
const enterFlg = ref<boolean>(false);
const lockFlg = ref<boolean>(false);
const tabFlg = ref<boolean>(false);
const shiftTabFlg = ref<boolean>(false);
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
        table[i] = getCellcontents(beforeContents.value[i + minRow])
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
    console.log(table.length)
    console.log(table[0].length)
    for(let col = 0; col < table[0].length; col++){
        for(let row = 0; row < table.length; row++){
            console.log(length[row])
            length[row] = table[row][col].length;
            console.log(length[row])
        }
        console.log(length)
        Maxlength[col] = length.reduce(aryMax);
        console.log(Maxlength[col]);
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
    const rownum = getRownum(beforeContents.value[count-1])
    const tables = getTable(count,rownum);
    console.log(tables);
    const maxlength = getMaxCellLength(tables.table)
    console.log(maxlength);
    const newtable = setCellLength(tables.table,maxlength);
    console.log(newtable);
    let addRowFlg = true;
    for(let i=0; i <= tables.maxRow - tables.minRow; i++){
        console.log(i,beforeContents.value[i + tables.minRow] == "|" + newtable[i].join("|") + "|");
        
        if(beforeContents.value[i + tables.minRow] != "|" + newtable[i].join("|") + "|"){
            addRowFlg = false;
        }
        afterContents.value[i + tables.minRow] = "|" + newtable[i].join("|") + "|"
        console.log(afterContents.value[i + tables.minRow])
    }
    afterContents.value.splice(tables.maxRow + 1,1)
    console.log(addRowFlg);
    console.log(afterContents.value)
    if(addRowFlg){
        afterContents.value.splice(count, 0, CreateRow(rownum, maxlength));
    }
    console.log(afterContents.value)
    addRowFlg = true;
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
        console.log(corsorPos)
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
        if(shiftTabFlg.value && corsorPos){
            lockFlg.value = true;
            let tmpString = "";
            // console.log(SodanContent.value.slice(corsorPos-2,corsorPos))
            for(let i=corsorPos-1; i >= 0; i--){
                tmpString += SodanContent.value[i]
            }
            console.log(tmpString)
            let lengthtoKaigyou = -1;
            if(tmpString.indexOf("\n") < 0){
                lengthtoKaigyou = corsorPos;
            }else{
                lengthtoKaigyou = tmpString.indexOf("\n")
            }
            console.log(SodanContent.value.slice(corsorPos - lengthtoKaigyou,corsorPos - lengthtoKaigyou + 2))
            if(SodanContent.value.slice(corsorPos - lengthtoKaigyou,corsorPos - lengthtoKaigyou + 2) == "  "){
                SodanContent.value = SodanContent.value.slice(0,corsorPos-lengthtoKaigyou)+ SodanContent.value.slice(corsorPos-lengthtoKaigyou + 2);
                if(lengthtoKaigyou > 2){
                    corsorPos -= 2;
                }else{
                    corsorPos -= lengthtoKaigyou;
                }
            }else{
                lockFlg.value = false;
            }
            // console.log(SodanContent.value);
        }
        contentHistory.value.unshift(SodanContent.value);
        MarkedContent.value = await marked.parse(SodanContent.value);
        // console.log('after:' + corsorPos)
        if(corsorPos) document.querySelector('textarea')?.setSelectionRange(corsorPos,corsorPos)
        enterFlg.value = false;
        tabFlg.value = false;
        shiftTabFlg.value = false;
    }else{
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
const ShiftTabDown = () =>{
    shiftTabFlg.value = true;
    console.log("tab")
    toMarkDown();
}
watch(SodanContent, toMarkDown);
watch(title, async () =>{
    MarkedTitle.value = await marked.parse("## " + title.value + "\n---\n");
});

const CreateTable = () =>{
    const corsorPos = document.querySelector('textarea')?.selectionStart;
    lockFlg.value = true;
    if(corsorPos){
        SodanContent.value = SodanContent.value.slice(0,corsorPos) + "\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n" + SodanContent.value.slice(corsorPos);
        document.querySelector('textarea')?.focus();
        document.querySelector('textarea')?.setSelectionRange(corsorPos+12,corsorPos+12);
    }else{
        SodanContent.value += "| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |"
        document.querySelector('textarea')?.focus();
        document.querySelector('textarea')?.setSelectionRange(3,3);
    }
    contentHistory.value.unshift(SodanContent.value);
}
const CreateList = () =>{
    let corsorPos = document.querySelector('textarea')?.selectionStart;
    lockFlg.value = true;
    if(corsorPos){
        SodanContent.value = SodanContent.value.slice(0,corsorPos) + "\n- \n" + SodanContent.value.slice(corsorPos);
        document.querySelector('textarea')?.focus();
        document.querySelector('textarea')?.setSelectionRange(corsorPos+3,corsorPos+3);
    }else{
        SodanContent.value += "- ";
        document.querySelector('textarea')?.focus();
        document.querySelector('textarea')?.setSelectionRange(3,3);
    }
    contentHistory.value.unshift(SodanContent.value);
}
const DeleteContent = () =>{
    lockFlg.value = true;
    SodanContent.value = "";
    contentHistory.value.unshift(SodanContent.value);
}

const controlzDown = () =>{
    lockFlg.value = true;
    console.log("ctrlz");
    HistoryNum.value++;
    console.log(contentHistory.value)
    if(HistoryNum.value < contentHistory.value.length){
        SodanContent.value = contentHistory.value[HistoryNum.value]
    }else{
        HistoryNum.value = contentHistory.value.length-1;
    }
}
const controlshiftzDown = () =>{
    lockFlg.value = true;
    console.log("shift");
    HistoryNum.value--;
    if(HistoryNum.value >= 0){
        SodanContent.value = contentHistory.value[HistoryNum.value]
    }else{
        HistoryNum.value = 0;
    }
}
watch(contentHistory,() =>{
    if(HistoryNum.value != 0){
        console.log()
        contentHistory.value.splice(1,HistoryNum.value);
        HistoryNum.value = 0;
    }
    if(contentHistory.value.length > 100){
        contentHistory.value.slice(0,100);
    }
    },{ deep: true }
);
</script>
<template>
    <h1>CreateSodan</h1>
    <div :class="$style.editors">
        <div :class="[$style.editor, $style.content]">
            <div :class="$style.uppercontent">
                <h3>title</h3>
                <input type="text" placeholder="title..." v-model="title">
                <h3>contents</h3>
                <button type="button" @click="CreateTable"><svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M859.1 161H165.9c-19.8 0-35.9 16.9-35.9 37.7v627.7c0 20.8 16.1 37.7 35.9 37.7h693.3c19.8 0 35.9-16.9 35.9-37.7V198.7c-0.1-20.8-16.2-37.7-36-37.7z m0 150.6v147.2H652V311.6h207.1zM408.9 642.9V496.5h207.2V643H408.9z m207.2 37.7v145.7H408.9V680.6h207.2zM373 642.9H165.9V496.5H373v146.4z m243.1-331.3v147.2H408.9V311.6h207.2zM652 496.5h207.2V643H652V496.5zM416.9 198.7c19.8 0 35.9 16.9 35.9 37.7 0 20.8-16.1 37.7-35.9 37.7-19.8 0-35.9-16.9-35.9-37.7 0-20.9 16.1-37.7 35.9-37.7z m-107.6 0c19.8 0 35.9 16.9 35.9 37.7 0 20.8-16.1 37.7-35.9 37.7-19.8 0-35.9-16.9-35.9-37.7 0-20.9 16.1-37.7 35.9-37.7z m-107.6 0c19.8 0 35.9 16.9 35.9 37.7 0 20.8-16.1 37.7-35.9 37.7-19.8 0-35.9-16.9-35.9-37.7 0.1-20.9 16.1-37.7 35.9-37.7z m0 112.9H373v147.2H165.9V311.6h35.8z m-35.8 369H373v145.7H165.9V680.6zM652 826.3V680.6h207.2v145.7H652z m0 0"  /></svg></button>
                <button type="button" @click="CreateList"><svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M170.666667 298.666667m-42.666667 0a42.666667 42.666667 0 1 0 85.333333 0 42.666667 42.666667 0 1 0-85.333333 0Z"  /><path d="M170.666667 512m-42.666667 0a42.666667 42.666667 0 1 0 85.333333 0 42.666667 42.666667 0 1 0-85.333333 0Z"  /><path d="M170.666667 725.333333m-42.666667 0a42.666667 42.666667 0 1 0 85.333333 0 42.666667 42.666667 0 1 0-85.333333 0Z"  /><path d="M298.666667 469.333333m40.106666 0l517.12 0q40.106667 0 40.106667 40.106667l0 5.12q0 40.106667-40.106667 40.106667l-517.12 0q-40.106667 0-40.106666-40.106667l0-5.12q0-40.106667 40.106666-40.106667Z"  /><path d="M298.666667 682.666667m40.106666 0l517.12 0q40.106667 0 40.106667 40.106666l0 5.12q0 40.106667-40.106667 40.106667l-517.12 0q-40.106667 0-40.106666-40.106667l0-5.12q0-40.106667 40.106666-40.106666Z"  /><path d="M298.666667 256m40.106666 0l517.12 0q40.106667 0 40.106667 40.106667l0 5.12q0 40.106667-40.106667 40.106666l-517.12 0q-40.106667 0-40.106666-40.106666l0-5.12q0-40.106667 40.106666-40.106667Z"  /></svg></button>
                <button type="button" @click="DeleteContent">
                    <svg fill="#000000" height="1em" width="1em" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 315 315" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 315 315">
                    <g>
                        <path d="m256.774,23.942h-64.836v-6.465c0-9.636-7.744-17.477-17.263-17.477h-34.348c-9.521,0-17.266,7.841-17.266,17.478v6.465h-64.835c-9.619,0-17.445,7.76-17.445,17.297v11.429c0,7.168 4.42,13.33 10.698,15.951 1.989,39.623 13.5,231.193 14.018,239.801 0.222,3.696 3.284,6.58 6.987,6.58h170.033c3.703,0 6.766-2.884 6.987-6.58 0.518-8.607 12.028-200.178 14.018-239.801 6.278-2.621 10.698-8.783 10.698-15.951v-11.43c5.68434e-14-9.537-7.826-17.297-17.446-17.297zm-119.713-6.464c0-1.918 1.465-3.478 3.266-3.478h34.348c1.8,0 3.264,1.56 3.264,3.478v6.465h-40.877v-6.465zm-82.282,23.761c0-1.818 1.546-3.297 3.445-3.297h198.549c1.899,0 3.445,1.478 3.445,3.297v11.429c0,1.819-1.546,3.299-3.445,3.299h-198.548c-1.899,0-3.445-1.479-3.445-3.299v-11.429zm181.143,259.761h-156.848c-2.055-34.247-11.479-191.674-13.51-231.033h183.867c-2.031,39.359-11.454,196.786-13.509,231.033z"/>
                        <path d="m157.5,95.125c-3.866,0-7,3.134-7,7v176.109c0,3.866 3.134,7 7,7 3.866,0 7-3.134 7-7v-176.109c0-3.866-3.134-7-7-7z"/>
                        <path d="m110.2,102.04c-0.202-3.86-3.507-6.837-7.355-6.625-3.86,0.201-6.827,3.494-6.625,7.355l9.182,175.829c0.195,3.736 3.285,6.635 6.984,6.635 0.123,0 0.247-0.003 0.371-0.01 3.86-0.201 6.827-3.494 6.625-7.355l-9.182-175.829z"/>
                        <path d="m212.155,95.415c-3.899-0.223-7.153,2.764-7.355,6.625l-9.184,175.829c-0.202,3.861 2.765,7.154 6.625,7.355 0.125,0.007 0.248,0.01 0.371,0.01 3.698,0 6.789-2.898 6.984-6.635l9.184-175.829c0.202-3.861-2.764-7.154-6.625-7.355z"/>
                    </g>
                    </svg></button>
            </div>   
            <textarea :class="$style.downcontent" placeholder="contents..." v-model="SodanContent" v-on:keypress.enter="EnterDown" v-on:keydown.prevent.tab.exact="TabDown" v-on:keydown.prevent.shift.tab="ShiftTabDown" v-on:keydown.prevent.ctrl.z.exact="controlzDown" v-on:keydown.prevent.ctrl.shift.z="controlshiftzDown" v-on:keydown.prevent.meta.z.exact="controlzDown" v-on:keydown.prevent.meta.shift.z="controlshiftzDown"></textarea>
        </div>
        <div :class="$style.content">
            <div :class="$style.uppercontent"></div>
            <div :class="[$style.viewer, $style.downcontent]" v-html="MarkedTitle + MarkedContent"></div>
        </div>
    </div>
    <!-- <buton type="button" @click="SubmitSodan"></buton> -->
</template>
<style module>
.viewer th{
    border: 1px solid black;

    background-color: rgb(244, 244, 244);
}
.viewer td{
    border: 1px solid black;
    background-color: rgb(255, 255, 255);
}
.viewer tr{
    padding-right: 4px;
    padding-left: 4px;
    width: 30%;
    height: 70px;
}
.viewer table{
    border: 1px solid black;
    border-collapse: collapse;
    width: 90%;
    table-layout: fixed;
    margin: 0 auto; 
}
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
