<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Marked } from 'marked'
import hljs from 'highlight.js'
import markedKatex from "marked-katex-extension";
import customHeadingId from "marked-custom-heading-id";
import { markedHighlight } from 'marked-highlight'
import 'highlight.js/styles/github-dark.css'
import router from '../router'
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import { useUserStore } from '../store/user'
import Wiki from "../types/wiki";
import Memo from "../types/memo";

const props = defineProps({
    editorType: Number,
    defaultId: {
        type: Number,
        default: -1
    },
    editSodanId: {
        type: Number,
        default: -1
    }
})
const type = ref(props.editorType)
const wikiId = ref(props.defaultId);
const editSodanId = ref(props.editSodanId);
// type:  1:memo作成 2:sodan作成 3:sodanに返信
const userStore = useUserStore();
const title = ref<string>('');
const selectTags = ref<string[]>([])
const Content = ref<string>("");
const MarkedTitle = ref<string>("");
const MarkedContent = ref<string>("");
const myWikis = ref<Wiki[]>([]);
const beforeContents = ref<string[]>([]);
const afterContents = ref<string[]>([]);
const beforeTags = ref<string[]>([])
const contentHistory = ref<string[]>([""]);
const HistoryNum = ref<number>(0);
const enterFlg = ref<boolean>(false);
const lockFlg = ref<boolean>(false);
const tabFlg = ref<boolean>(false);
const shiftTabFlg = ref<boolean>(false);
const $toast = useToast();
const checkTargets = ref<string[]>(["- [ ] ", "- ", "1. ", "> "])
const tags = ref<string[]>([])
const sendToRoom = ref<number>();
const isLoading = ref(false)
const marked = new Marked(
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'js'
        return hljs.highlight(code, { language }).value
      }
    })).use(markedKatex({
        throwOnError: false,
        nonStandard: true
    })).use(customHeadingId());
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
    
    let beforekaigyouPos = 0;
    for(let i=0; i < kaigyouIndex -1; i++){
        beforekaigyouPos += afterContents.value[i].length + 1;
    }
    const nextkaigyouPos = beforekaigyouPos + afterContents.value[kaigyouIndex - 1].length + 1;
    let setCorsorPos = 0;
    let i = 0
    let targetRowContents = [""]
    if(moveTwoLine){
        targetRowContents = getCellcontents(afterContents.value[kaigyouIndex+1])
        setCorsorPos = nextkaigyouPos + afterContents.value[kaigyouIndex].length + 1;
    }else if(maxRowIndex < kaigyouIndex){
        targetRowContents = getCellcontents(afterContents.value[kaigyouIndex-1])
        setCorsorPos = beforekaigyouPos;
    }else{
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
        afterContents.value.splice(kaigyouIndex, 0, CreateRow(colnum, maxlength, false));
        corsorPos = ChangeCorsorPos(kaigyouIndex, corsorPos, tables.maxRow + 1, false);
    }else if(addRowFlg && tables.maxRow == tables.minRow){
        afterContents.value.splice(kaigyouIndex, 0, CreateRow(colnum, maxlength, true), CreateRow(colnum, maxlength, false));
        corsorPos = ChangeCorsorPos(kaigyouIndex, corsorPos, tables.maxRow + 2, true);
    }else if(addRowFlg && tables.maxRow - tables.minRow == 1){
        afterContents.value.splice(kaigyouIndex + 1, 0, CreateRow(colnum, maxlength, false));
        corsorPos = ChangeCorsorPos(kaigyouIndex, corsorPos, tables.maxRow + 1, true);
    }else{
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
        const editor = document.querySelector("textarea");
        if(editor != null){
            let corsorPos = editor.selectionStart
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
            // if(corsorPos) editor.setSelectionRange(corsorPos,corsorPos)
            // editor.style.height = "auto";
            // if(editor.scrollHeight + 10 >= 200){
            //     editor.style.height = (editor.scrollHeight + 10).toString() + "px";
            // }else{
            //     editor.style.height = "200px"
            // }
            // const viewer = document.getElementById("viewer");
            // if(viewer){
            //     if(parseInt(viewer.style.height) >= parseInt(editor.style.height) + 80){
            //         editor.style.height = (parseInt(viewer.style.height) - 80).toString() + "px";
            //     }else{
            //         viewer.style.height = (parseInt(editor.style.height) + 80).toString() + "px";
            //     }
            // }
            enterFlg.value = false;
            tabFlg.value = false;
            shiftTabFlg.value = false;
        }
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
const ToBolds = (startContent: string, endContent: string) =>{
    const startPos = document.querySelector('textarea')?.selectionStart;
    const endPos = document.querySelector('textarea')?.selectionEnd;
    if(startPos && endPos && startPos != 0){
        Content.value = Content.value.slice(0,startPos) + startContent + Content.value.slice(startPos, endPos) + endContent + Content.value.slice(endPos);
    }else{
        Content.value = startContent + Content.value.slice(startPos, endPos) + endContent + Content.value.slice(endPos);
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
    if(type.value == 1){
        let thisWikiIndex = -1;
        for(let i=0; i < myWikis.value.length; i++){
            if(myWikis.value[i].id == wikiId.value){
                thisWikiIndex = i
            }
        }
        if(thisWikiIndex >= 0){
            const memoResponse = await fetch('/api/memo', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: wikiId.value,
                    title: title.value, 
                    content: Content.value,
                    })
            }).catch((e) =>{
                $toast.error("something wrong", {
                    duration: 1200,
                    position:  'top-right'
                })
                return e})
            if(memoResponse != null && memoResponse.ok){
                const allTags = Array.from(new Set(beforeTags.value.concat(selectTags.value)))
                const deleteTags = allTags.filter(tag =>{
                    return !selectTags.value.includes(tag);
                })
                const addTags = allTags.filter(tag =>{
                    return !beforeTags.value.includes(tag)
                })
                if(addTags.length != 0 || deleteTags.length != 0){
                    let tagResponse;
                    let errorFlg = false;
                    for(let i=0; i < Math.min(deleteTags.length, addTags.length); i++){
                        tagResponse = await fetch("/api/wiki/tag", {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                wikiId: wikiId.value,
                                tag: deleteTags[i],
                                newTag: addTags[i]
                                })
                        }).catch((e) =>{
                            errorFlg = true;
                            return e
                        })
                    }
                    if(addTags.length > deleteTags.length){
                        for(let i=deleteTags.length; i < addTags.length; i++){
                            tagResponse = await fetch("/api/wiki/tag", {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    wikiId: wikiId.value,
                                    tag: addTags[i],
                                    })
                            }).catch((e) =>{
                                errorFlg = true;
                                return e
                            })
                        }
                    }else if(deleteTags.length > addTags.length){
                        for(let i=addTags.length; i < deleteTags.length; i++){
                            tagResponse = await fetch("/api/wiki/tag", {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    wikiId: wikiId.value,
                                    tag: deleteTags[i],
                                    })
                            }).catch((e) =>{
                                errorFlg = true;
                                return e
                            })
                        }
                    }
                    if(tagResponse != null && tagResponse.ok && !errorFlg){
                        $toast.success("saved!!", {
                            duration: 1200,
                            position:  'top-right'
                        })
                        myWikis.value[thisWikiIndex] = await tagResponse.json();
                    }else{
                        $toast.error("Some tags were not saved", {
                            duration: 1200,
                            position:  'top-right'
                        })
                    }
                    return tagResponse;
                }else{
                    $toast.success("saved!!", {
                        duration: 1200,
                        position:  'top-right'
                    })
                    myWikis.value[thisWikiIndex] = await memoResponse.json();
                }
            }else{
                $toast.error("memo were not saved", {
                    duration: 1200,
                    position:  'top-right'
                })
                return memoResponse
            }       
        }else{
            $toast.error("this memo isn't yours", {
                duration: 1200,
                position:  'top-right'
            })
        }
    }
}
const Create = async(CreateButtonDown: boolean) =>{ 
    if(title.value == "" || Content.value == ""){
        $toast.info("please enter the title and content", {
            duration: 1200,
            position:  'top-right'
        })
    }else{
        if(type.value == 1){
            const response = await fetch('/api/memo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title.value, 
                    content: Content.value,
                    tags: selectTags.value})
            }).catch((e) => {
                $toast.error("something wrong", {
                    duration: 1200,
                    position:  'top-right'
                });
                return e;
            })
            if(response && response.ok){
                const wikiAbstract = await response.json();
                wikiId.value = wikiAbstract.id;
                $toast.success("saved!!", {
                    duration: 1200,
                    position:  'top-right'
                });
                myWikis.value.push(wikiAbstract)
                beforeTags.value = selectTags.value;
                if(CreateButtonDown)router.push("/wiki/memo/" + wikiAbstract.id);
            }
        }
    }
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
const SendReply = async() =>{
    if(sendToRoom.value != null && Content.value != ""){
        const res = await fetch('/api/anon-sodan/replies?wikiId=' + editSodanId.value.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: Content.value})
        }).catch((e) => {
            $toast.error("something wrong", {
                duration: 1200,
                position:  'top-right'
            });
        });
        if(res != null && res.ok){
            $toast.success("send!!", {
                duration: 1200,
                position:  'top-right'
            })
            Content.value = "";
            sendToRoom.value = undefined;
            const cont = await res.json()
        }
    }else{
        $toast.info("please enter the room number and content", {
            duration: 1200,
            position:  'top-right'
        })
    }

}
const SendSodan = async() =>{
    if(Content.value != ""){
        // tagをsodanに送る????????
        const res = await fetch("/api/anon-sodan",{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: Content.value
            })
        }).catch((e) => {
            $toast.error("something wrong", {
                duration: 1200,
                position:  'top-right'
            });
        });
        if(res != null && res.ok){
            $toast.success("send!!", {
                duration: 1200,
                position:  'top-right'
            })
            Content.value = "";
            selectTags.value = []
        }
    }else{
        $toast.info("please enter the content", {
            duration: 1200,
            position:  'top-right'
        })
    }
}
const Send = () =>{
    
    if(type.value == 3){
        SendReply();
    }else if(type.value == 2){
        SendSodan();
    }
}

const Show = async() =>{
    const response = await Update();
    if(response && response.ok){
        router.push("/wiki/memo/" + wikiId.value);
    }
}

const tagSearch = async() =>{
    isLoading.value = true;
    const response = await fetch("/api/tag")
    if(response && response.ok){
        tags.value = await response.json(); 
    }else{
        $toast.error("something wrong", {
            duration: 1200,
            position:  'top-right'
        })
    }
    isLoading.value = false;
}

const rules = [value => !!value || 'Required.'];
onMounted(async() =>{
    if(wikiId.value >= 0){
        const res = await fetch('/api/memo?wikiId=' + wikiId.value)
        const initMemo = ref<Memo>()
        if(res && res.ok){
            initMemo.value = await res.json();
            if(initMemo.value != null){
                title.value = initMemo.value.title
                selectTags.value = initMemo.value.tags
                beforeTags.value = initMemo.value.tags
                Content.value = initMemo.value.content
                MarkedTitle.value = await marked.parse(title.value);
                MarkedContent.value = await marked.parse(Content.value);
            }
        }else{
            $toast.error("can't get Contents", {
            duration: 1200,
            position:  'top-right'
            })
        }
        const response = await fetch("/api/wiki/user")
        if(response != null && response.ok){
            myWikis.value = await response.json();
        }
    }
    
    if(type.value == 2 || type.value == 1)tagSearch();
})
</script>
<template>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn" crossorigin="anonymous">
    <div :class="$style.buttons" v-if="type == 1">
        <button type="button" @click="Save">save</button>
        <button type="button" @click="Create(true)" v-if="wikiId < 0">create</button>
        <button type="button" @click="Show" v-if="wikiId >= 0">show</button>
    </div>
    <div :class="$style.buttons" v-if="type == 2 || type == 3">
        <button type="button" @click="Send">send</button>
    </div>
    <div :class="$style.editors">
        <div :class="$style.content">
            <div :class="$style.uppercontent">
                <div v-if="type == 1">
                    <h3>title</h3>
                    <v-text-field
                    :rules="rules"
                    v-model="title"
                    hide-details="auto"
                    label="title"
                    variant="underlined"
                    v-on:keydown.ctrl.prevent.s="Save"  
                    v-on:keydown.meta.prevent.s="Save"
                    ></v-text-field>
                </div>
                <!-- <div v-else-if="type == 3">
                    <h3>送信先</h3>
                    <v-select
                    clearable
                    chips
                    label="SendTo..."
                    :items="[1, 2, 3, 4, 5, 6]"
                    v-model="sendToRoom"
                    variant="underlined"
                    v-on:keydown.ctrl.prevent.s="Send"  
                    v-on:keydown.meta.prevent.s="Send"
                    ></v-select>
                </div> -->
                <div v-if="type == 2">
                    <h3>tags</h3>
                    <v-combobox
                    chips
                    clearable
                    deletable-chips
                    multiple
                    small-chips
                    :items="tags"
                    v-model="selectTags"
                    label="tags"
                    :loading="isLoading"
                    variant="underlined"
                    v-on:keydown.ctrl.prevent.s="Send"  
                    v-on:keydown.meta.prevent.s="Send"
                    ></v-combobox>
                </div>
                <div v-if="type == 1">
                    <h3>tags</h3>
                    <v-combobox
                    chips
                    clearable
                    deletable-chips
                    multiple
                    small-chips
                    :items="tags"
                    v-model="selectTags"
                    label="tags"
                    :loading="isLoading"
                    variant="underlined"
                    v-on:keydown.ctrl.prevent.s="Save"  
                    v-on:keydown.meta.prevent.s="Save"
                    ></v-combobox>
                </div>
                <h3>contents</h3>
                <button type="button" @click="ToBolds('**','**')"><font-awesome-icon :icon="['fas', 'bold']" transform="shrink-3" /></button>
                <button type="button" @click="ToBolds('*','*')"><font-awesome-icon :icon="['fas', 'italic']" transform="shrink-3" /></button>
                <button type="button" @click="ToBolds('~~','~~')"><font-awesome-icon :icon="['fas', 'strikethrough']" transform="shrink-3" /></button>
                <button type="button" @click="CreateLists('\n# header {#custom-id}\n[headerLink](#custom-id)')"><font-awesome-icon :icon="['fas', 'heading']" transform="shrink-3"  /></button>
                <button type="button" @click="CreateLists('> ')"><font-awesome-icon :icon="['fas', 'quote-right']" transform="shrink-3" /></button>
                <button type="button" @click="ToBolds('\n```c\n', '\n```')"><font-awesome-icon :icon="['fas', 'code']" transform="shrink-3" /></button>
                <button type="button" @click="CreateLists('- ')"><font-awesome-icon :icon="['fas', 'list-ul']" transform="shrink-3" /></button>
                <button type="button" @click="CreateLists('1. ')"><font-awesome-icon :icon="['fas', 'list-ol']" transform="shrink-3" /></button>
                <button type="button" @click="CreateTable"><font-awesome-icon :icon="['fas', 'table']" transform="shrink-1" /></button>
                <button type="button" @click="CreateLists('- [ ] ')"><font-awesome-icon :icon="['fas', 'square-check']" transform="shrink-3" /></button>
                <button type="button" @click="DeleteContent"><font-awesome-icon :icon="['fas', 'trash-can']" transform="shrink-2" /></button>
                <button type="button" @click="ToBolds('[', '](https://)')"><font-awesome-icon :icon="['fas', 'link']" transform="shrink-3" /></button>
                <button type="button" @click="ToBolds('![', '](https://)')"><font-awesome-icon :icon="['fas', 'image']" transform="shrink-2" /></button>
            </div>   
            <v-textarea v-if="type == 1"
            name="input-7-1"
            filled
            label="Contents"
            auto-grow
             v-model="Content" 
             v-on:keypress.enter="EnterDown" 
             v-on:keydown.prevent.tab.exact="TabDown" 
             v-on:keydown.prevent.shift.tab="ShiftTabDown" 
             v-on:keydown.ctrl.prevent.z.exact="controlzDown" 
             v-on:keydown.ctrl.shift.prevent.z="controlshiftzDown" 
             v-on:keydown.meta.prevent.z.exact="controlzDown" 
             v-on:keydown.meta.shift.prevent.z="controlshiftzDown"  
             v-on:keydown.ctrl.prevent.s="Save"  
             v-on:keydown.meta.prevent.s="Save"
            ></v-textarea>
            <v-textarea v-else-if="type == 2 || type == 3"
            name="input-7-1"
            filled
            label="Contents"
            auto-grow
             v-model="Content" 
             v-on:keypress.enter="EnterDown" 
             v-on:keydown.prevent.tab.exact="TabDown" 
             v-on:keydown.prevent.shift.tab="ShiftTabDown" 
             v-on:keydown.ctrl.prevent.z.exact="controlzDown" 
             v-on:keydown.ctrl.shift.prevent.z="controlshiftzDown" 
             v-on:keydown.meta.prevent.z.exact="controlzDown" 
             v-on:keydown.meta.shift.prevent.z="controlshiftzDown"  
             v-on:keydown.ctrl.prevent.s="Send"  
             v-on:keydown.meta.prevent.s="Send"
            ></v-textarea>
        </div>
        <div :class="$style.content">
            <div :class="$style.uppercontent"></div>
            <div :class="$style.viewer" v-html="MarkedTitle + MarkedContent"></div>
        </div>
    </div>
    <!-- <buton type="button" @click="SubmitSodan"></buton> -->
</template>
<style module>
.editors button{
    background-color: rgb(245, 245, 245);
    margin-bottom: 1px;
}
.editors button:hover{
    background-color: rgb(230, 230, 230);
}
.buttons{
    text-align: right;
    padding-right: 10%;
}
.buttons button{
    background-color: rgb(245, 245, 245);
    margin-left: 5px;
}
.buttons button:hover{
    background-color: rgb(230, 230, 230);
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
    height: 40px;
}
.viewer table{
    border: 1px solid black;
    border-collapse: collapse;
    width: 90%;
    table-layout: fixed;
    margin: 0 auto; 
}
.viewer h1,h2{
  border-bottom: 1px solid lightgray;
  margin-bottom: 20px;
  padding-top: 140px;
  margin-top: -140px;
  pointer-events: none;
}
.viewer h3,h4,h5,h6{
  text-align: left;
  padding-top: 140px;
  margin-top: -140px;
  pointer-events: none;
}
.viewer p{
  line-height: 1.9em;
}
.viewer :not(pre) > code{
  background-color: rgb(236, 236, 236);
  border-radius: 5px;
  padding: 2px 5px;
  margin: 0px 2px;
}
.viewer pre > code{
  margin: 10px 0px;
  border-radius: 10px ;
}
.viewer ul{
    padding-left: 30px;
    text-align: left;
}
.viewer li:has(input){
    list-style:none;
    text-align: left;
}
.viewer li > input{
  margin-right: 10px
}
.viewer ol{
  margin-left: 10px;
}
.viewer li{
  padding-left: 10px;
}
.viewer blockquote{
    border-left: 3px solid lightgray;
    color: gray;
}
.viewer img{
    max-width: 100%;
}
.title{
    border:1px solid lightgray;
    width: 90%;
}
.editor{
    font-size: large;
    line-height: 1.5em;
    padding-top: 5px;
    padding-left: 10px;
    padding-right: 10px;
    width: 90%;
    height: 200px;
    resize:none;
    border-color: lightgray;
}
.editor:focus{
    border-color: gray;
}
.editors{
    display: flex;
}
.viewer{
    padding-top: 10px;
    padding-left: 20px;
    padding-right: 20px;
    background-color: white;
    border:1px solid lightgray;
    border-radius: 10px;
    margin-top: 80px;
    height: 100%;
    text-align: left;
    word-break: break-all;
}
.content{
    width:45%;
    max-width: 45%;
    display:flex;
    flex-direction:column;
}
.uppercontent{
    text-align: left;
}
.uppercontent button{
    color: rgb(90, 90, 90);
}
@media screen and (max-width: 960px) {
  .editors{
    display: block;
  }
  .content{
    width: 100%;
    max-width: 100%;
  }
}

</style>