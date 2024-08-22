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
const checkTargets = ref<string[]>(["- [ ] ", "- ", "1. ", "> "])
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
const CheckLists = (kaigyouIndex: number, corsorpos: number, target: string, targetLength: number) => {
    let countTab = 0;
    while(countTab + 2 <= afterContents.value[kaigyouIndex-1].length){
        if(afterContents.value[kaigyouIndex-1].startsWith("  ",countTab*2)){
            countTab++;
        }else{
            break;
        }
    }
    if(target == "1. "){
        const splits = afterContents.value[kaigyouIndex-1].slice(countTab*2).split(/^[0-9]+\. /)        
        if(splits[0] == "" && afterContents.value[kaigyouIndex-1].slice(countTab*2) != ""){
            const tmp = afterContents.value[kaigyouIndex-1].slice(countTab*2).match(/^[0-9]+\. /);
            let tmptarget = "";
            if(tmp) tmptarget = tmp[0]
            if(splits[1] == ""){
                afterContents.value = afterContents.value.slice(0,kaigyouIndex-1).concat(afterContents.value.slice(kaigyouIndex));
                return corsorpos-tmptarget.length - 1 - countTab*2
            }else{
            let tmp= "";
            for(let i=0;i < countTab;i++){
                tmp += "  ";
            }
            afterContents.value[kaigyouIndex] = tmp + (parseInt(tmptarget)+1).toString() + ". " + afterContents.value[kaigyouIndex];
            return corsorpos + ((parseInt(tmptarget)+1).toString() + ". ").length + countTab*2      
            }
        }
    }else if(afterContents.value[kaigyouIndex-1].startsWith(target,countTab*2)){
        if(afterContents.value[kaigyouIndex-1].slice(countTab*2) == target){
            afterContents.value = afterContents.value.slice(0,kaigyouIndex-1).concat(afterContents.value.slice(kaigyouIndex));
            return corsorpos-targetLength - 1 - countTab*2
            // afterContents.value[kaigyouIndex-1] = "";
            
        }else{
            let tmp= "";
            for(let i=0;i < countTab;i++){
                tmp += "  ";
            }
            afterContents.value[kaigyouIndex] = tmp + target + afterContents.value[kaigyouIndex];
            return corsorpos + targetLength + countTab*2      
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
                for(let i=0; result == corsorPos && i < checkTargets.value.length; i++){
                    result =  CheckLists(kaigyouIndex, corsorPos, checkTargets.value[i], checkTargets.value[i].length);
                }
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
            let tmpflg = false;
            for(let i=0; i < checkTargets.value.length; i++){
                if(checkTargets.value[i] == "1. "){
                    const splits = Content.value.slice(0, corsorPos).split(/[0-9]+\. $/)
                    if(splits.at(-1) == "" && Content.value.slice(0, corsorPos) != ""){
                        const tmp = Content.value.slice(0, corsorPos).match(/[0-9]+\. $/);
                        let tmptarget = "";
                        
                        if(tmp) tmptarget = tmp[tmp.length -1]
                        Content.value = Content.value.slice(0,corsorPos - tmptarget.length) + "  " + Content.value.slice(corsorPos - tmptarget.length);
                        tmpflg = true;
                    }
                }else if(Content.value.slice(corsorPos - checkTargets.value[i].length, corsorPos) == checkTargets.value[i]){
                    Content.value = Content.value.slice(0,corsorPos - checkTargets.value[i].length) + "  " + Content.value.slice(corsorPos - checkTargets.value[i].length);
                    tmpflg = true;
                }
            }
            if(!tmpflg){
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
// listとかのボタン
const CreateLists = (target: string) =>{
    let corsorPos = document.querySelector('textarea')?.selectionStart;
    if(corsorPos){
        Content.value = Content.value.slice(0,corsorPos) + "\n" + target + "\n" + Content.value.slice(corsorPos);
        document.querySelector('textarea')?.focus();
        document.querySelector('textarea')?.setSelectionRange(corsorPos+target.length+1,corsorPos+target.length+1);
    }else{
        Content.value += target;
        document.querySelector('textarea')?.focus();
        document.querySelector('textarea')?.setSelectionRange(Content.value.length,Content.value.length);
    }
}
// deleteボタン
const DeleteContent = () =>{
    Content.value = "";
}
const ToBolds = (target: string, isLinkorImage: boolean) =>{
    const startPos = document.querySelector('textarea')?.selectionStart;
    const endPos = document.querySelector('textarea')?.selectionEnd;
    console.log(startPos, endPos)
    let endContent;
    if(isLinkorImage){
        endContent = "](https://)";
    }else{
        endContent = target;
    }
    if(startPos && endPos && startPos != 0){
        Content.value = Content.value.slice(0,startPos) + target + Content.value.slice(startPos, endPos) + endContent + Content.value.slice(endPos);
    }else{
        Content.value = target + Content.value.slice(startPos, endPos) + endContent + Content.value.slice(endPos);
    }
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
    if(title.value == "" || Content.value == ""){
        $toast.info("please enter the title and content", {
            duration: 1200,
            position:  'top-right'
        })
    }else{
        if(wikiId.value >= 0){
            Update();
        }else{
            Create(false);
        }
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
                <button type="button" @click="ToBolds('**', false)"><font-awesome-icon :icon="['fas', 'bold']" transform="shrink-3" /></button>
                <button type="button" @click="ToBolds('*', false)"><font-awesome-icon :icon="['fas', 'italic']" transform="shrink-3" /></button>
                <button type="button" @click="ToBolds('~~', false)"><font-awesome-icon :icon="['fas', 'strikethrough']" transform="shrink-3" /></button>
                <button type="button" @click="CreateLists('> ')"><font-awesome-icon :icon="['fas', 'quote-right']" transform="shrink-3" /></button>
                <button type="button" @click="CreateLists('- ')"><font-awesome-icon :icon="['fas', 'list-ul']" transform="shrink-3" /></button>
                <button type="button" @click="CreateLists('1. ')"><font-awesome-icon :icon="['fas', 'list-ol']" transform="shrink-3" /></button>
                <button type="button" @click="CreateTable"><font-awesome-icon :icon="['fas', 'table']" transform="shrink-1" /></button>
                <button type="button" @click="CreateLists('- [ ] ')"><font-awesome-icon :icon="['fas', 'square-check']" transform="shrink-3" /></button>
                <button type="button" @click="DeleteContent"><font-awesome-icon :icon="['fas', 'trash-can']" transform="shrink-2" /></button>
                <button type="button" @click="ToBolds('[', true)"><font-awesome-icon :icon="['fas', 'link']" transform="shrink-3" /></button>
                <button type="button" @click="ToBolds('![', true)"><font-awesome-icon :icon="['fas', 'image']" transform="shrink-2" /></button>
            </div>   
            <textarea :class="$style.downcontent" placeholder="contents..." v-model="Content" v-on:keypress.enter="EnterDown" v-on:keydown.prevent.tab.exact="TabDown" v-on:keydown.prevent.shift.tab="ShiftTabDown" v-on:keydown.prevent.ctrl.z.exact="controlzDown" v-on:keydown.prevent.ctrl.shift.z="controlshiftzDown" v-on:keydown.prevent.meta.z.exact="controlzDown" v-on:keydown.prevent.meta.shift.z="controlshiftzDown"  v-on:keydown.prevent.ctrl.s="Save"  v-on:keydown.prevent.meta.s="Save"></textarea>
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
.viewer li:has(input){
    list-style:none;
}
.viewer blockquote{
    border-left: 3px solid lightgray;
    color: gray;
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
.uppercontent button{
    color: rgb(90, 90, 90);
}
.downcontent{
    flex-grow: 10;
}
</style>
