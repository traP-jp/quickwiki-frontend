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
                <button type="button" @click="ToBolds('**', false)"><svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                    width="0.7em" height="0.7em" viewBox="0 0 25.072 25.072" transform="translate(0, -1)"
                    xml:space="preserve">
                    <g>
                        <path d="M22.028,13.794c-0.962-0.79-2.632-1.461-5.011-2.016c2.207-0.555,3.746-1.305,4.623-2.246
                            c0.875-0.943,1.312-2.02,1.312-3.227c0-1.146-0.346-2.229-1.035-3.244c-0.69-1.018-1.633-1.781-2.827-2.293
                            C17.893,0.256,15.86,0,12.988,0H0.972v0.684c1.146,0,1.928,0.104,2.348,0.314C3.739,1.207,4.032,1.487,4.198,1.84
                            c0.167,0.352,0.25,1.205,0.25,2.561v16.27c0,1.355-0.083,2.207-0.25,2.552c-0.166,0.346-0.456,0.627-0.868,0.842
                            c-0.414,0.215-1.199,0.324-2.357,0.324v0.684H13.71c3.549,0,6.256-0.746,8.117-2.236c1.517-1.232,2.273-2.791,2.273-4.68
                            C24.1,16.37,23.409,14.915,22.028,13.794z M10.29,1.405c1.799-0.012,3.105,0.168,3.92,0.537c0.812,0.369,1.438,0.908,1.875,1.617
                            s0.656,1.617,0.656,2.727s-0.222,2.021-0.666,2.736c-0.443,0.715-1.08,1.27-1.912,1.664c-0.833,0.394-2.124,0.592-3.874,0.592
                            V1.405L10.29,1.405z M16.927,21.141c-0.441,0.832-1.082,1.468-1.914,1.904c-0.832,0.436-1.739,0.654-2.727,0.654
                            c-0.666,0-1.168-0.168-1.507-0.508c-0.339-0.34-0.509-0.842-0.509-1.508l0.02-0.924v-8.043c1.885-0.013,3.303,0.168,4.252,0.537
                            s1.693,1.02,2.236,1.951c0.543,0.93,0.813,1.98,0.813,3.152C17.593,19.383,17.37,20.309,16.927,21.141z"/>
                    </g>
                </svg></button>
                <button type="button" @click="ToBolds('*', false)"><svg fill="#000000" height="1em" width="1em" viewBox="-9 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.25 25.25l-0.25 1.125c0.094 0 0.25 0 0.5-0.031 0.188 0 0.5-0.031 0.844-0.063 1.094-0.125 1.938-0.188 2.469-0.156h2.719c0.594 0.063 1.094 0.125 1.438 0.188 0.313 0.031 0.531 0.031 0.594 0.031 0.094 0.063 0.188 0.063 0.25 0.063h0.344c0.094 0 0.219 0 0.375-0.031h0.156c0.031-0.031 0.094-0.031 0.156-0.031 0.063-0.094 0.094-0.219 0.094-0.313s0.063-0.156 0.094-0.219c0-0.125 0.031-0.219 0.031-0.375 0-0.094 0.031-0.25 0.031-0.406-0.25-0.031-0.469-0.094-0.625-0.125s-0.25-0.031-0.281-0.031c-0.531-0.063-1.031-0.156-1.656-0.281-0.031-0.094-0.031-0.156-0.031-0.219v-0.156l0.188-0.594 0.563-3.188 0.563-2.125 0.844-4.25c0.156-0.969 0.5-2.313 0.906-4.125 0.031-0.281 0.094-0.656 0.188-1.094 0.125-0.5 0.219-0.875 0.344-1.188 0.344-0.125 0.813-0.281 1.406-0.438 0.531-0.125 1.094-0.25 1.531-0.406 0.063-0.281 0.125-0.531 0.188-0.688 0-0.094 0.031-0.188 0.031-0.281 0.031-0.063 0.031-0.156 0.031-0.25-0.094 0-0.281 0-0.531 0.031-0.25 0-0.531 0.031-0.906 0.063-1.406 0.094-2.375 0.125-3 0.125h-0.344c-0.188 0-0.406-0.031-0.688-0.031l-4.406-0.188-0.281 1.406h0.25c0.063 0.031 0.219 0.031 0.313 0.031 0.969 0.063 1.594 0.188 2 0.375v0.563l-0.125 0.625-0.281 1.844-0.219 0.875-0.438 2.125c0 0.031-0.094 0.344-0.25 0.844-0.156 0.531-0.344 1.313-0.531 2.406l-0.156 0.875-0.813 3.625-0.375 1.844c-0.094 0.563-0.313 1.063-0.563 1.406-0.375 0.156-0.875 0.375-1.625 0.531-0.469 0.125-0.875 0.188-1.063 0.281z"></path>
                </svg></button>
                <button type="button" @click="ToBolds('~~', false)"><svg
                    xmlns:dc="http://purl.org/dc/elements/1.1/"
                    xmlns:cc="http://creativecommons.org/ns#"
                    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                    xmlns:svg="http://www.w3.org/2000/svg"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
                    xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
                    viewBox="0 -256 1800 1800"
                    id="svg4363"
                    version="1.1"
                    inkscape:version="0.48.3.1 r9886"
                    height="0.9em"
                    width="0.9em"
                    sodipodi:docname="strikethrough_font_awesome.svg">
                <metadata
                    id="metadata4373">
                    <rdf:RDF>
                    <cc:Work
                        rdf:about="">
                        <dc:format>image/svg+xml</dc:format>
                        <dc:type
                        rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
                    </cc:Work>
                    </rdf:RDF>
                </metadata>
                <defs
                    id="defs4371" />
                <sodipodi:namedview
                    pagecolor="#ffffff"
                    bordercolor="#666666"
                    borderopacity="1"
                    objecttolerance="10"
                    gridtolerance="10"
                    guidetolerance="10"
                    inkscape:pageopacity="0"
                    inkscape:pageshadow="2"
                    inkscape:window-width="640"
                    inkscape:window-height="480"
                    id="namedview4369"
                    showgrid="false"
                    inkscape:zoom="32"
                    inkscape:cx="1804.7371"
                    inkscape:cy="820.18569"
                    inkscape:window-x="0"
                    inkscape:window-y="25"
                    inkscape:window-maximized="0"
                    inkscape:current-layer="svg4363" />
                <g
                    transform="matrix(1,0,0,-1,7.5932203,1278.2373)"
                    id="g4365">
                    <path
                    d="m 1760,640 q 14,0 23,-9 9,-9 9,-23 v -64 q 0,-14 -9,-23 -9,-9 -23,-9 H 32 q -14,0 -23,9 -9,9 -9,23 v 64 q 0,14 9,23 9,9 23,9 H 1760 z M 483,704 q -28,35 -51,80 -48,97 -48,188 0,181 134,309 133,127 393,127 50,0 167,-19 66,-12 177,-48 10,-38 21,-118 14,-123 14,-183 0,-18 -5,-45 l -12,-3 -84,6 -14,2 q -50,149 -103,205 -88,91 -210,91 -114,0 -182,-59 -67,-58 -67,-146 0,-73 66,-140 66,-67 279,-129 69,-20 173,-66 58,-28 95,-52 H 483 z M 990,448 h 411 q 7,-39 7,-92 0,-111 -41,-212 -23,-55 -71,-104 -37,-35 -109,-81 -80,-48 -153,-66 -80,-21 -203,-21 -114,0 -195,23 l -140,40 q -57,16 -72,28 -8,8 -8,22 v 13 q 0,108 -2,156 -1,30 0,68 l 2,37 v 44 l 102,2 q 15,-34 30,-71 15,-37 22.5,-56 7.5,-19 12.5,-27 35,-57 80,-94 43,-36 105,-57 59,-22 132,-22 64,0 139,27 77,26 122,86 47,61 47,129 0,84 -81,157 -34,29 -137,71 z"
                    id="path4367"
                    inkscape:connector-curvature="0"
                    style="fill:currentColor" />
                </g>
                </svg></button>
                <button type="button" @click="CreateLists('> ')"><svg xmlns="http://www.w3.org/2000/svg"  height="0.8em" width="0.8em" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 379.51"><path d="M299.73 345.54c81.25-22.55 134.13-69.68 147.28-151.7 3.58-22.31-1.42-5.46-16.55 5.86-49.4 36.97-146.53 23.88-160.01-60.55C243.33-10.34 430.24-36.22 485.56 46.34c12.87 19.19 21.39 41.59 24.46 66.19 13.33 106.99-41.5 202.28-137.82 247.04-17.82 8.28-36.6 14.76-56.81 19.52-10.12 2.04-17.47-3.46-20.86-12.78-2.87-7.95-3.85-16.72 5.2-20.77zm-267.78 0c81.25-22.55 134.14-69.68 147.28-151.7 3.58-22.31-1.42-5.46-16.55 5.86-49.4 36.97-146.53 23.88-160-60.55-27.14-149.49 159.78-175.37 215.1-92.81 12.87 19.19 21.39 41.59 24.46 66.19 13.33 106.99-41.5 202.28-137.82 247.04-17.82 8.28-36.59 14.76-56.81 19.52-10.12 2.04-17.47-3.46-20.86-12.78-2.87-7.95-3.85-16.72 5.2-20.77z"/></svg></button>
                <button type="button" @click="CreateLists('- ')"><svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" transform="translate(0, -2.8)" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M170.666667 298.666667m-42.666667 0a42.666667 42.666667 0 1 0 85.333333 0 42.666667 42.666667 0 1 0-85.333333 0Z"  /><path d="M170.666667 512m-42.666667 0a42.666667 42.666667 0 1 0 85.333333 0 42.666667 42.666667 0 1 0-85.333333 0Z"  /><path d="M170.666667 725.333333m-42.666667 0a42.666667 42.666667 0 1 0 85.333333 0 42.666667 42.666667 0 1 0-85.333333 0Z"  /><path d="M298.666667 469.333333m40.106666 0l517.12 0q40.106667 0 40.106667 40.106667l0 5.12q0 40.106667-40.106667 40.106667l-517.12 0q-40.106667 0-40.106666-40.106667l0-5.12q0-40.106667 40.106666-40.106667Z"  /><path d="M298.666667 682.666667m40.106666 0l517.12 0q40.106667 0 40.106667 40.106666l0 5.12q0 40.106667-40.106667 40.106667l-517.12 0q-40.106667 0-40.106666-40.106667l0-5.12q0-40.106667 40.106666-40.106666Z"  /><path d="M298.666667 256m40.106666 0l517.12 0q40.106667 0 40.106667 40.106667l0 5.12q0 40.106667-40.106667 40.106666l-517.12 0q-40.106667 0-40.106666-40.106666l0-5.12q0-40.106667 40.106666-40.106667Z"  /></svg></button>
                <button type="button" @click="CreateLists('1. ')"><svg fill="#000000" height="1em" width="1em" viewBox="0 0 36 36" version="1.1"  preserveAspectRatio="xMidYMid meet" transform="translate(0, 1)" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <polygon points="5.46 7.41 5.46 11.56 6.65 11.56 6.65 6.05 5.7 6.05 4.05 7.16 4.52 8 5.46 7.41" class="clr-i-outline clr-i-outline-path-1"></polygon><path d="M5.57,14.82a.76.76,0,0,1,.83.73c0,.38-.21.74-.87,1.27l-2,1.57v1H7.67V18.28H5.33l1-.77c1-.7,1.28-1.27,1.28-2a1.83,1.83,0,0,0-2-1.76,2.63,2.63,0,0,0-2.14,1.08l.76.73A1.75,1.75,0,0,1,5.57,14.82Z" class="clr-i-outline clr-i-outline-path-2"></path><path d="M6.56,24.64a1.32,1.32,0,0,0,1-1.27c0-.87-.78-1.51-2-1.51a2.61,2.61,0,0,0-2.1,1l.69.72a1.78,1.78,0,0,1,1.3-.64c.54,0,.92.26.92.66s-.36.62-1,.62H4.79v1h.64c.74,0,1.07.21,1.07.63s-.35.68-1,.68a2,2,0,0,1-1.46-.65l-.7.78a2.85,2.85,0,0,0,2.21.93c1.29,0,2.13-.69,2.13-1.64A1.33,1.33,0,0,0,6.56,24.64Z" class="clr-i-outline clr-i-outline-path-3"></path><path d="M32.42,9a1,1,0,0,0-1-1H10v2H31.42A1,1,0,0,0,32.42,9Z" class="clr-i-outline clr-i-outline-path-4"></path><path d="M31.42,16H10v2H31.42a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-5"></path><path d="M31.42,24H10v2H31.42a1,1,0,0,0,0-2Z" class="clr-i-outline clr-i-outline-path-6"></path>
                    <rect x="0" y="0" width="36" height="36" fill-opacity="0"/>
                </svg></button>
                <button type="button" @click="CreateTable"><svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" transform="translate(0, -3)" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M859.1 161H165.9c-19.8 0-35.9 16.9-35.9 37.7v627.7c0 20.8 16.1 37.7 35.9 37.7h693.3c19.8 0 35.9-16.9 35.9-37.7V198.7c-0.1-20.8-16.2-37.7-36-37.7z m0 150.6v147.2H652V311.6h207.1zM408.9 642.9V496.5h207.2V643H408.9z m207.2 37.7v145.7H408.9V680.6h207.2zM373 642.9H165.9V496.5H373v146.4z m243.1-331.3v147.2H408.9V311.6h207.2zM652 496.5h207.2V643H652V496.5zM416.9 198.7c19.8 0 35.9 16.9 35.9 37.7 0 20.8-16.1 37.7-35.9 37.7-19.8 0-35.9-16.9-35.9-37.7 0-20.9 16.1-37.7 35.9-37.7z m-107.6 0c19.8 0 35.9 16.9 35.9 37.7 0 20.8-16.1 37.7-35.9 37.7-19.8 0-35.9-16.9-35.9-37.7 0-20.9 16.1-37.7 35.9-37.7z m-107.6 0c19.8 0 35.9 16.9 35.9 37.7 0 20.8-16.1 37.7-35.9 37.7-19.8 0-35.9-16.9-35.9-37.7 0.1-20.9 16.1-37.7 35.9-37.7z m0 112.9H373v147.2H165.9V311.6h35.8z m-35.8 369H373v145.7H165.9V680.6zM652 826.3V680.6h207.2v145.7H652z m0 0"  /></svg></button>
                <button type="button" @click="CreateLists('- [ ] ')"><svg height="1em" width="1em" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <g id="🔍-Product-Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g id="ic_fluent_checkbox_checked_24_filled" fill="#212121" fill-rule="nonzero">
                        <path d="M18,3 C19.6568542,3 21,4.34314575 21,6 L21,18 C21,19.6568542 19.6568542,21 18,21 L6,21 C4.34314575,21 3,19.6568542 3,18 L3,6 C3,4.34314575 4.34314575,3 6,3 L18,3 Z M16.4696699,7.96966991 L10,14.4393398 L7.53033009,11.9696699 C7.23743687,11.6767767 6.76256313,11.6767767 6.46966991,11.9696699 C6.1767767,12.2625631 6.1767767,12.7374369 6.46966991,13.0303301 L9.46966991,16.0303301 C9.76256313,16.3232233 10.2374369,16.3232233 10.5303301,16.0303301 L17.5303301,9.03033009 C17.8232233,8.73743687 17.8232233,8.26256313 17.5303301,7.96966991 C17.2374369,7.6767767 16.7625631,7.6767767 16.4696699,7.96966991 Z" id="🎨-Color">
                        </path>
                        </g>
                    </g>
                </svg></button>
                <button type="button" @click="DeleteContent"><svg fill="#000000" height="1em" width="1em" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 315 315" xmlns:xlink="http://www.w3.org/1999/xlink" enable-background="new 0 0 315 315">
                <g>
                    <path d="m256.774,23.942h-64.836v-6.465c0-9.636-7.744-17.477-17.263-17.477h-34.348c-9.521,0-17.266,7.841-17.266,17.478v6.465h-64.835c-9.619,0-17.445,7.76-17.445,17.297v11.429c0,7.168 4.42,13.33 10.698,15.951 1.989,39.623 13.5,231.193 14.018,239.801 0.222,3.696 3.284,6.58 6.987,6.58h170.033c3.703,0 6.766-2.884 6.987-6.58 0.518-8.607 12.028-200.178 14.018-239.801 6.278-2.621 10.698-8.783 10.698-15.951v-11.43c5.68434e-14-9.537-7.826-17.297-17.446-17.297zm-119.713-6.464c0-1.918 1.465-3.478 3.266-3.478h34.348c1.8,0 3.264,1.56 3.264,3.478v6.465h-40.877v-6.465zm-82.282,23.761c0-1.818 1.546-3.297 3.445-3.297h198.549c1.899,0 3.445,1.478 3.445,3.297v11.429c0,1.819-1.546,3.299-3.445,3.299h-198.548c-1.899,0-3.445-1.479-3.445-3.299v-11.429zm181.143,259.761h-156.848c-2.055-34.247-11.479-191.674-13.51-231.033h183.867c-2.031,39.359-11.454,196.786-13.509,231.033z"/>
                    <path d="m157.5,95.125c-3.866,0-7,3.134-7,7v176.109c0,3.866 3.134,7 7,7 3.866,0 7-3.134 7-7v-176.109c0-3.866-3.134-7-7-7z"/>
                    <path d="m110.2,102.04c-0.202-3.86-3.507-6.837-7.355-6.625-3.86,0.201-6.827,3.494-6.625,7.355l9.182,175.829c0.195,3.736 3.285,6.635 6.984,6.635 0.123,0 0.247-0.003 0.371-0.01 3.86-0.201 6.827-3.494 6.625-7.355l-9.182-175.829z"/>
                    <path d="m212.155,95.415c-3.899-0.223-7.153,2.764-7.355,6.625l-9.184,175.829c-0.202,3.861 2.765,7.154 6.625,7.355 0.125,0.007 0.248,0.01 0.371,0.01 3.698,0 6.789-2.898 6.984-6.635l9.184-175.829c0.202-3.861-2.764-7.154-6.625-7.355z"/>
                </g>
                </svg></button>

                <button type="button" @click="ToBolds('```', false)"><svg height="1em" width="1em" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
                    <title>ic_fluent_code_24_regular</title>
                    <desc>Created with Sketch.</desc>
                    <g id="🔍-Product-Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g id="ic_fluent_code_24_regular" fill="#212121" fill-rule="nonzero">
                            <path d="M8.06561801,18.9432081 L14.565618,4.44320807 C14.7350545,4.06523433 15.1788182,3.8961815 15.5567919,4.06561801 C15.9032679,4.2209348 16.0741922,4.60676263 15.9697642,4.9611247 L15.934382,5.05679193 L9.43438199,19.5567919 C9.26494549,19.9347657 8.82118181,20.1038185 8.44320807,19.934382 C8.09673215,19.7790652 7.92580781,19.3932374 8.03023576,19.0388753 L8.06561801,18.9432081 L14.565618,4.44320807 L8.06561801,18.9432081 Z M2.21966991,11.4696699 L6.46966991,7.21966991 C6.76256313,6.9267767 7.23743687,6.9267767 7.53033009,7.21966991 C7.79659665,7.48593648 7.8208027,7.90260016 7.60294824,8.19621165 L7.53033009,8.28033009 L3.81066017,12 L7.53033009,15.7196699 C7.8232233,16.0125631 7.8232233,16.4874369 7.53033009,16.7803301 C7.26406352,17.0465966 6.84739984,17.0708027 6.55378835,16.8529482 L6.46966991,16.7803301 L2.21966991,12.5303301 C1.95340335,12.2640635 1.9291973,11.8473998 2.14705176,11.5537883 L2.21966991,11.4696699 L6.46966991,7.21966991 L2.21966991,11.4696699 Z M16.4696699,7.21966991 C16.7359365,6.95340335 17.1526002,6.9291973 17.4462117,7.14705176 L17.5303301,7.21966991 L21.7803301,11.4696699 C22.0465966,11.7359365 22.0708027,12.1526002 21.8529482,12.4462117 L21.7803301,12.5303301 L17.5303301,16.7803301 C17.2374369,17.0732233 16.7625631,17.0732233 16.4696699,16.7803301 C16.2034034,16.5140635 16.1791973,16.0973998 16.3970518,15.8037883 L16.4696699,15.7196699 L20.1893398,12 L16.4696699,8.28033009 C16.1767767,7.98743687 16.1767767,7.51256313 16.4696699,7.21966991 Z" id="🎨-Color">

                </path>
                        </g>
                    </g>
                </svg></button>
                <button type="button" @click="ToBolds('[', true)"><svg height="1em" width="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.975 14.51a1.05 1.05 0 0 0 0-1.485 2.95 2.95 0 0 1 0-4.172l3.536-3.535a2.95 2.95 0 1 1 4.172 4.172l-1.093 1.092a1.05 1.05 0 0 0 1.485 1.485l1.093-1.092a5.05 5.05 0 0 0-7.142-7.142L9.49 7.368a5.05 5.05 0 0 0 0 7.142c.41.41 1.075.41 1.485 0zm2.05-5.02a1.05 1.05 0 0 0 0 1.485 2.95 2.95 0 0 1 0 4.172l-3.5 3.5a2.95 2.95 0 1 1-4.171-4.172l1.025-1.025a1.05 1.05 0 0 0-1.485-1.485L3.87 12.99a5.05 5.05 0 0 0 7.142 7.142l3.5-3.5a5.05 5.05 0 0 0 0-7.142 1.05 1.05 0 0 0-1.485 0z" fill="#000000"/></svg>
                </button>
                <button type="button" @click="ToBolds('![', true)"><svg fill="#000000" height="1em" width="1em" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                        viewBox="0 0 58 58" xml:space="preserve">
                    <g>
                        <path d="M57,6H1C0.448,6,0,6.447,0,7v44c0,0.553,0.448,1,1,1h56c0.552,0,1-0.447,1-1V7C58,6.447,57.552,6,57,6z M56,50H2V8h54V50z"
                            />
                        <path d="M16,28.138c3.071,0,5.569-2.498,5.569-5.568C21.569,19.498,19.071,17,16,17s-5.569,2.498-5.569,5.569
                            C10.431,25.64,12.929,28.138,16,28.138z M16,19c1.968,0,3.569,1.602,3.569,3.569S17.968,26.138,16,26.138s-3.569-1.601-3.569-3.568
                            S14.032,19,16,19z"/>
                        <path d="M7,46c0.234,0,0.47-0.082,0.66-0.249l16.313-14.362l10.302,10.301c0.391,0.391,1.023,0.391,1.414,0s0.391-1.023,0-1.414
                            l-4.807-4.807l9.181-10.054l11.261,10.323c0.407,0.373,1.04,0.345,1.413-0.062c0.373-0.407,0.346-1.04-0.062-1.413l-12-11
                            c-0.196-0.179-0.457-0.268-0.72-0.262c-0.265,0.012-0.515,0.129-0.694,0.325l-9.794,10.727l-4.743-4.743
                            c-0.374-0.373-0.972-0.392-1.368-0.044L6.339,44.249c-0.415,0.365-0.455,0.997-0.09,1.412C6.447,45.886,6.723,46,7,46z"/>
                    </g>
                </svg></button>
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
.downcontent{
    flex-grow: 10;
}
</style>
