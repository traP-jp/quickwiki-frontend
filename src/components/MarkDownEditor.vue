<script setup lang="ts">
import { ref, watch } from 'vue'
import { Marked } from 'marked'
import hljs from 'highlight.js'
import { markedHighlight } from 'marked-highlight'
import 'highlight.js/styles/github-dark.css'
import router from '../router'
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const props = defineProps({
    isSodan: Boolean
})

const title = ref<string>('');
const Content = ref<string>("");
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
const wikiId = ref<number>(-1);
const $toast = useToast();
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
const CheckBeforeRow = (kaigyouIndex: number) =>{
    for(let i=kaigyouIndex-1; i >= 0; i--){
        if(afterContents.value[i] != "") return i + 1;
    }
    return -1;
}
// enterで改行されて増えた行のindexを探す(kaigyouIndex-1は改行する前のカーソルがあった行)
const searchChangedRow = () =>{
    afterContents.value = Content.value.split(/\n/);
    let kaigyouIndex = -1;
    for(let i=0; i <= beforeContents.value.length; i++){
        if(beforeContents.value[i] != afterContents.value[i]){
            if(afterContents.value[i] == ""){
                kaigyouIndex = i;
            }else{
                kaigyouIndex = i+1;
            }
            break;
        }
    }
    if(kaigyouIndex < 0){
        kaigyouIndex = beforeContents.value.length;
    }

    kaigyouIndex = CheckBeforeRow(kaigyouIndex)

    return kaigyouIndex
}
// カーソルの位置から実際にsearchChangedRowで取得したkaigyouIndex-1から改行したか判定。
// 下のように改行後に改行が二度以上連続する場合searchChangedRowでは1,2行目のどちらで改行しても1行目から改行した（kaigyouIndexは2行目を指す）とみなされるため、カーソル位置を参照することで実際に1行目で改行したかを判定（|はカーソル位置）
// abcdefg\n    abcdefg\n
// |         => \n
//              |
const guessCorsorPosisCorsorPos = (kaigyouIndex: number, corsorpos: number) =>{
    const guessCorsorPos = afterContents.value.slice(0,kaigyouIndex).join('\n').length + 1;
    return guessCorsorPos == corsorpos
}
// listを書いているときの補完を行う
const CheckList = (kaigyouIndex: number, corsorpos: number) => {
    let countTab = 0;
    while(countTab + 2 <= afterContents.value[kaigyouIndex-1].length){
        if(afterContents.value[kaigyouIndex-1].startsWith("  ",countTab*2)){
            countTab++;
        }else{
            break;
        }
    }
    
    if(afterContents.value[kaigyouIndex-1].startsWith("- ",countTab*2)){
        if(afterContents.value[kaigyouIndex-1].slice(countTab*2) == "- "){
            afterContents.value = afterContents.value.slice(0,kaigyouIndex-1).concat(afterContents.value.slice(kaigyouIndex));
            return corsorpos-3-countTab*2
            // afterContents.value[kaigyouIndex-1] = "";
            
        }else{
            let tmp= "";
            for(let i=0;i < countTab;i++){
                tmp += "  ";
            }
            afterContents.value[kaigyouIndex] = tmp + "- " + afterContents.value[kaigyouIndex];
            return corsorpos+2+countTab*2
            
        }
    }
    return corsorpos;
}
// tableの一行をcellの内容の配列に変換
const getCellcontents =(row: string) =>{
    let columns = row.split("|")
    columns.shift()
    columns.pop()
    return columns
} 
// 与えられた一行の列数の取得
const getColnum = (example: string) =>{
    return getCellcontents(example).length
} 
// 改行位置から編集している表を取得
const getTable = (kaigyouIndex: number) =>{
    let minRow = kaigyouIndex-1;
    let maxRow = kaigyouIndex-1;
    let maxCol = 0;
    let i = 0;
    for(i=kaigyouIndex-2; i >= 0; i--){
        if(beforeContents.value[i].startsWith("|") && beforeContents.value[i].endsWith("|")){
            minRow = i;
        }else{
            break;
        }
    }
    for(i=kaigyouIndex; i < beforeContents.value.length; i++){
        if(beforeContents.value[i].startsWith("|") && beforeContents.value[i].endsWith("|")){
            maxRow = i;
        }else{
            break;
        }
    }
    for(i = minRow; i <= maxRow; i++){
        maxCol = Math.max(maxCol,getColnum(beforeContents.value[i]));
    }
    
    let table = [[""]];
    let tmp = ""
    for(i = 0; i <= maxRow-minRow; i++){
        tmp = beforeContents.value[i + minRow]
        let seiki = ``
        for(let j=0;j < getColnum(beforeContents.value[i + minRow]); j++){
            seiki += ` *-+ *\\|`
        }
        const isBorder = new RegExp(`^\\|` + seiki + `$`)
        for(let j=getColnum(beforeContents.value[i + minRow]); j < maxCol; j++){
            if(isBorder.test(beforeContents.value[i + minRow].trim())){
                tmp += " -------- |"
            }else{
                tmp += " |"
            }
        }
        table[i] = getCellcontents(tmp)
    }

    return {table, maxRow, minRow};
}
// 次の行を作成
const CreateRow = (colnum: number, maxlength: number[], fillHyphen: boolean) =>{
    let result = "|"
    for(let i=0; i < colnum; i++){
        for(let j=0; j < maxlength[i]; j++){
            if(fillHyphen && !(j == 0 || j == maxlength[i] - 1)){
                result += "-"
            }else{
                result += " ";
            }
        }
        result += "|";
    }
    return result;
}
const aryMax = (x: number,y: number) =>{
    return Math.max(x,y);
}
// 列ごとの長さの最大値を取得
const getMaxCellLength = (table: string[][]) =>{
    let Maxlength: number[] = Array(table.length).fill(0);
    let length: number[] = Array(table[0].length).fill(0);
    for(let col = 0; col < table[0].length; col++){
        for(let row = 0; row < table.length; row++){
            length[row] = table[row][col].trim().length + 2;
        }
        Maxlength[col] = length.reduce(aryMax);
        length = new Array(table[0].length).fill(0);
    }
    return Maxlength;
}
// maxLengthをもとにそれぞれのcellの長さを調整
const setCellLength = (table: string[][], maxLength: number[]) =>{
    let newtable: string[][] = new Array(table.length).fill(new Array(table[0].length).fill(""));
    let tmp: string[] = new Array(table[0].length).fill("")
    for(let row=0; row < table.length; row++){
        tmp = table[row]
        for(let col=0; col < table[0].length; col++){
            tmp[col] = " " + tmp[col].trim();
            while(tmp[col].length < maxLength[col]){
                tmp[col] += " "
            }
        }
        newtable[row] = tmp
    }
    
    return newtable;
}
// カーソル位置の直前の改行の位置を取得（カーソル位置と改行の位置はcontent.valueの文字列のindexで表される）
const getPosBeforeKaigyou = (corsorPos: number)=>{
    let tmpString = "";
    for(let i=corsorPos-1; i >= 0; i--){
        tmpString += Content.value[i]
    }
    let lengthtoKaigyou = -1;
    if(tmpString.indexOf("\n") < 0){
        lengthtoKaigyou = corsorPos;
    }else{
        lengthtoKaigyou = tmpString.indexOf("\n")
    }
    return corsorPos - lengthtoKaigyou
}
// table補完時のカーソル移動先を決定
const ChangeCorsorPos = (kaigyouIndex: number, corsorPos: number,maxRowIndex: number, moveTwoLine: boolean) =>{
    const beforeCorsorPos = corsorPos - 1;
    let corsorColnum = -1;
    if(Content.value.slice(corsorPos,corsorPos+1) == "\n"){
        corsorColnum = getColnum(Content.value.slice(getPosBeforeKaigyou(beforeCorsorPos),beforeCorsorPos) + "|") -2;
    }else{
        corsorColnum = getColnum(Content.value.slice(getPosBeforeKaigyou(beforeCorsorPos),beforeCorsorPos) + "|") -1;
    } 
    console.log(corsorColnum);
    
    let beforekaigyouPos = 0;
    for(let i=0; i < kaigyouIndex -1; i++){
        beforekaigyouPos += afterContents.value[i].length + 1;
    }
    const nextkaigyouPos = beforekaigyouPos + afterContents.value[kaigyouIndex - 1].length + 1;
    let setCorsorPos = 0;
    let i = 0
    let targetRowContents = [""]
    if(moveTwoLine){
        console.log("two");
        targetRowContents = getCellcontents(afterContents.value[kaigyouIndex+1])
        setCorsorPos = nextkaigyouPos + afterContents.value[kaigyouIndex].length + 1;
    }else if(maxRowIndex < kaigyouIndex){
        console.log("max < kaigy");
        targetRowContents = getCellcontents(afterContents.value[kaigyouIndex-1])
        setCorsorPos = beforekaigyouPos;
    }else{
        console.log("other:row");
        targetRowContents = getCellcontents(afterContents.value[kaigyouIndex])
        setCorsorPos = nextkaigyouPos;
    }
    for(i=0; i < corsorColnum; i++){
        setCorsorPos += targetRowContents[i].length + 1;
    }
    setCorsorPos++;
    if(targetRowContents[corsorColnum].trimEnd() == ""){
        setCorsorPos++;
    }else{
        setCorsorPos += targetRowContents[corsorColnum].trimEnd().length;
    }
    return setCorsorPos;
}
// 表上での改行からcell長さの調整 or 行を追加のどちらかを行う
const CheckTable = (kaigyouIndex: number, corsorPos: number) =>{
    const tables = getTable(kaigyouIndex);
    const colnum = getColnum(beforeContents.value[kaigyouIndex-1])
    const maxlength = getMaxCellLength(tables.table)
    const newtable = setCellLength(tables.table,maxlength);
    let addRowFlg = true;
    for(let i=0; i <= tables.maxRow - tables.minRow; i++){
        
        if(beforeContents.value[i + tables.minRow] != "|" + newtable[i].join("|") + "|"){
            addRowFlg = false;
        }
        afterContents.value[i + tables.minRow] = "|" + newtable[i].join("|") + "|"
    }
    afterContents.value.splice(tables.maxRow + 1,1)
    if(addRowFlg && kaigyouIndex - 1 != tables.minRow ){
        console.log("k-1=min");
        afterContents.value.splice(kaigyouIndex, 0, CreateRow(colnum, maxlength, false));
        corsorPos = ChangeCorsorPos(kaigyouIndex, corsorPos, tables.maxRow + 1, false);
    }else if(addRowFlg && tables.maxRow == tables.minRow){
        console.log("max=min");
        afterContents.value.splice(kaigyouIndex, 0, CreateRow(colnum, maxlength, true), CreateRow(colnum, maxlength, false));
        corsorPos = ChangeCorsorPos(kaigyouIndex, corsorPos, tables.maxRow + 2, true);
    }else if(addRowFlg && tables.maxRow - tables.minRow == 1){
        console.log("max-1=min");
        afterContents.value.splice(kaigyouIndex + 1, 0, CreateRow(colnum, maxlength, false));
        corsorPos = ChangeCorsorPos(kaigyouIndex, corsorPos, tables.maxRow + 1, true);
    }else{
        console.log("other");
        corsorPos = ChangeCorsorPos(kaigyouIndex, corsorPos, tables.maxRow, kaigyouIndex - 1 == tables.minRow);
    }
    addRowFlg = true;
    return corsorPos;
}
// enterの入力時にリストか表の補完を行う
const Check = (corsorPos: number) =>{
    const kaigyouIndex = searchChangedRow();
    let result = corsorPos; 
    if(kaigyouIndex >= 0){
        if(guessCorsorPosisCorsorPos(kaigyouIndex,corsorPos)){
            if(beforeContents.value[kaigyouIndex-1].startsWith("|") && beforeContents.value[kaigyouIndex-1].endsWith("|")){
                result = CheckTable(kaigyouIndex, corsorPos);
            }else{
               result =  CheckList(kaigyouIndex, corsorPos);
            }
            return result;
        }
    }
    return corsorPos
}
// MarkDownに変換する。editorに変化を加える or 加えたいときに呼ばれる
const toMarkDown = async() =>{    
    if(!lockFlg.value){
        let corsorPos = document.querySelector('textarea')?.selectionStart
        if(enterFlg.value && corsorPos){
            lockFlg.value = true;
            corsorPos = Check(corsorPos);
            Content.value = afterContents.value.join('\n');
        }
        if(tabFlg.value && corsorPos){
            lockFlg.value = true;
            if(Content.value.slice(corsorPos-2,corsorPos) == '- '){
                Content.value = Content.value.slice(0,corsorPos-2) + "  " + Content.value.slice(corsorPos-2);
            }else{
                Content.value = Content.value.slice(0,corsorPos) + "  " + Content.value.slice(corsorPos);
            }
            corsorPos += 2;
        }
        if(shiftTabFlg.value && corsorPos){
            lockFlg.value = true;
            const KaigyouPos = getPosBeforeKaigyou(corsorPos)
            if(Content.value.slice(KaigyouPos,KaigyouPos + 2) == "  "){
                Content.value = Content.value.slice(0,KaigyouPos)+ Content.value.slice(KaigyouPos + 2);
                if(corsorPos - KaigyouPos > 2){
                    corsorPos -= 2;
                }else{
                    corsorPos = KaigyouPos;
                }
            }else{
                lockFlg.value = false;
            }
        }
        contentHistory.value.unshift(Content.value);
        MarkedContent.value = await marked.parse(Content.value);
        if(corsorPos) document.querySelector('textarea')?.setSelectionRange(corsorPos,corsorPos)
        enterFlg.value = false;
        tabFlg.value = false;
        shiftTabFlg.value = false;
    }else{
        lockFlg.value = false;
    }
}
// Enter検知（補完のイベント検知用）
const EnterDown = () =>{
    beforeContents.value = Content.value.split(/\n/);
    enterFlg.value = true
}
// tab
const TabDown = () =>{
    tabFlg.value = true;
    toMarkDown();
}
// shift + tab
const ShiftTabDown = () =>{
    shiftTabFlg.value = true;
    toMarkDown();
}
watch(Content, toMarkDown);
watch(title, async () =>{
    MarkedTitle.value = await marked.parse("## " + title.value + "\n---\n");
});

// tableボタン
const CreateTable = () =>{
    const corsorPos = document.querySelector('textarea')?.selectionStart;
    if(corsorPos){
        Content.value = Content.value.slice(0,corsorPos) + "\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n" + Content.value.slice(corsorPos);
        document.querySelector('textarea')?.focus();
        document.querySelector('textarea')?.setSelectionRange(corsorPos+12,corsorPos+12);
    }else{
        Content.value += "| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n\n"
        document.querySelector('textarea')?.focus();
        document.querySelector('textarea')?.setSelectionRange(3,3);
    }
}
// listボタン
const CreateList = () =>{
    let corsorPos = document.querySelector('textarea')?.selectionStart;
    if(corsorPos){
        Content.value = Content.value.slice(0,corsorPos) + "\n- \n" + Content.value.slice(corsorPos);
        document.querySelector('textarea')?.focus();
        document.querySelector('textarea')?.setSelectionRange(corsorPos+3,corsorPos+3);
    }else{
        Content.value += "- ";
        document.querySelector('textarea')?.focus();
        document.querySelector('textarea')?.setSelectionRange(3,3);
    }
}
// deleteボタン
const DeleteContent = () =>{
    Content.value = "";
}
// ctrl + z, command + z
const controlzDown = async() =>{
    lockFlg.value = true;
    HistoryNum.value++;
    if(HistoryNum.value < contentHistory.value.length){
        Content.value = contentHistory.value[HistoryNum.value]
    }else{
        HistoryNum.value = contentHistory.value.length-1;
    }
    MarkedContent.value = await marked.parse(Content.value);  
}
// ctrl + shift + z, command + shift + z
const controlshiftzDown = async() =>{
    lockFlg.value = true;
    HistoryNum.value--;
    if(HistoryNum.value >= 0){
        Content.value = contentHistory.value[HistoryNum.value]
    }else{
        HistoryNum.value = 0;
    }
    MarkedContent.value = await marked.parse(Content.value);
}
watch(contentHistory,() =>{
    if(HistoryNum.value != 0){
        contentHistory.value.splice(1,HistoryNum.value);
        HistoryNum.value = 0;
    }
    if(contentHistory.value.length > 100){
        contentHistory.value.slice(0,100);
    }
    },{ deep: true }
);

const Update = async() =>{
    if(props.isSodan){
        console.log("sodan");
        // const responce = await fetch('/api/sodan', {
        //     method: 'PATCH',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         title: title.value, 
        //         content: Content.value,
        //         ownerTraqId: "test"})
        // }).catch((e) => console.log(e))
        // if(responce && responce.ok){
        //     const wikiAbstract = await responce.json();
        //     router.push("/memo/" + wikiAbstract.id)
        // }
    }else{
        const responce = await fetch('/api/memo', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: wikiId.value,
                title: title.value, 
                content: Content.value,
                ownerTraqId: "test"})
        }).catch((e) =>{
            $toast.error("something wrong", {
                duration: 1200,
                position:  'top-right'
            })
            return e})
        if(responce.ok){
            $toast.success("saved!!", {
                duration: 1200,
                position:  'top-right'
            })
        }
    }
    console.log(props.isSodan);
}
const Create = async(CreateButtonDown: boolean) =>{ 
    if(props.isSodan){
        console.log("sodan");
        // const responce = await fetch('/api/sodan', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({
        //         title: title.value, 
        //         content: Content.value,
        //         ownerTraqId: "test"})
        // }).catch((e) => console.log(e))
        // if(responce && responce.ok){
        //     const wikiAbstract = await responce.json();
        //     wikiId.value = wikiAbstract.id;
        //     if(CreateButtonDown)router.push("/sodan/" + wikiAbstract.id);
        // }
    }else{
        const responce = await fetch('/api/memo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title.value, 
                content: Content.value,
                ownerTraqId: "test"})
        }).catch((e) => {
            $toast.error("something wrong", {
                duration: 1200,
                position:  'top-right'
            });
            return e;
        })
        if(responce && responce.ok){
            const wikiAbstract = await responce.json();
            wikiId.value = wikiAbstract.id;
            if(CreateButtonDown){
                router.push("/memo/" + wikiAbstract.id);
            }else{
                $toast.success("saved!!", {
                duration: 1200,
                position:  'top-right'
            })
            }
        }
    }
    console.log(props.isSodan);
}
const Save = () =>{
    if(wikiId.value >= 0){
        Update();
    }else{
        Create(false);
    }
}

</script>
<template>
    <div :class="$style.buttons">
        <button type="button" @click="Save">save</button>
        <button type="button" @click="Create(true)">create</button>
    </div>
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
            <textarea :class="$style.downcontent" placeholder="contents..." v-model="Content" v-on:keypress.enter="EnterDown" v-on:keydown.prevent.tab.exact="TabDown" v-on:keydown.prevent.shift.tab="ShiftTabDown" v-on:keydown.prevent.ctrl.z.exact="controlzDown" v-on:keydown.prevent.ctrl.shift.z="controlshiftzDown" v-on:keydown.prevent.meta.z.exact="controlzDown" v-on:keydown.prevent.meta.shift.z="controlshiftzDown"></textarea>
        </div>
        <div :class="$style.content">
            <div :class="$style.uppercontent"></div>
            <div :class="[$style.viewer, $style.downcontent]" v-html="MarkedTitle + MarkedContent"></div>
        </div>
    </div>
    <!-- <buton type="button" @click="SubmitSodan"></buton> -->
</template>
<style module>
.buttons{
    text-align: right;
    padding-right: 10%;
}
.buttons button{
    margin-left: 5px;
}
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
    height: 200px;
    resize:none;
    border-color: lightgray;
}
textarea:focus{
    border-color: gray;
}
.editors{
    display: flex;
}
.viewer{
    padding-top: 10px;
    padding-left: 20px;
    padding-right: 20px;
    border:1px solid lightgray;
    border-radius: 10px;
    overflow: scroll;
    height: 200px;
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
