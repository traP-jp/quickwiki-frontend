<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import {useToast} from 'vue-toast-notification';
import router from '../router';

type suggest = {
    name: String,
    title: String
}
const props = defineProps({
    width: Number
})
const width = ref(props.width)

const showtags = ref<suggest[]>([]);
const hankakuHashtags = ref<suggest[]>([]);
const zenkakuHashtags = ref<suggest[]>([]);
const beforeWords = ref<suggest[]>([]);
const isLoading = ref<boolean>(false);
const $toast = useToast();
const selectWords = ref<suggest[]>([]);
const lockFlg = ref<boolean>(false);
var istag = new RegExp('^[#＃].*');
var ishankaku = new RegExp('^#.*')

const tagSearch = async() =>{
    isLoading.value = true;
    const response = await fetch("/api/tag")
    if(response && response.ok){
        const tagnames = await response.json(); 
        hankakuHashtags.value = tagnames.map(tagname =>{
            return {name: "tag:" + tagname, title: "#" + tagname}
        })
        zenkakuHashtags.value = tagnames.map(tagname =>{
            return {name: "tag:" + tagname, title: "＃" + tagname}
        })
    }else{
        $toast.error("something wrong", {
            duration: 1200,
            position:  'top-right'
        })
    }
    isLoading.value = false;
}
onMounted(() =>{
    tagSearch()
})

const tmpfunc = (value)=>{
    if(!istag.test(value)){
        showtags.value = []
    }else{
        if(showtags.value.length === 0){
            if(ishankaku.test(value)){
                showtags.value = hankakuHashtags.value
            }else{
                showtags.value = zenkakuHashtags.value
            }
        }
    }
}

const adjustSuggestType = (target) =>{
    return target.map(content =>{
        if(typeof content === "string"){
            if(istag.test(content)){
                return {name: "tag:" + content.slice(1), title: "#" + content.slice(1)}
            }else{
                return {name: "key:" + content, title: content}
            }
        }else{
            if(content.name.startsWith("key:") || content.name.startsWith("tag:")){
                return content
            }else{
                return {name: content.name, title: content.title}
            }
        }
    })
}
const deleteDuplication = (target: suggest[], type: string) =>{
    const filteredTarget = target.filter(content =>{
        return content.name.startsWith(type)
    })
    const contentTarget = filteredTarget.map(tagObj =>{
        return tagObj.name.slice(4)
    })
    const tmparr = Array.from(new Set(contentTarget))
  return tmparr.map(tmp => {
      if (type === "tag:") {
        return {name: "tag:" + tmp, title: "#" + tmp}
      } else {
        return {name: "key:" + tmp, title: tmp}
      }
    })
}
watch(selectWords, () =>{
    if(!lockFlg.value){
        lockFlg.value = true;
        console.log(selectWords.value);
        const tmpSelectWords = adjustSuggestType(selectWords.value)
        console.log(tmpSelectWords);
        selectWords.value = deleteDuplication(tmpSelectWords, "tag:").concat(deleteDuplication(tmpSelectWords, "key:"))
        console.log(selectWords.value)
    }else{
        lockFlg.value = false;
    }
})

const Search = () => {
    const tagSuggests = selectWords.value.filter(word =>{
        return word.name.startsWith("tag:")
    })
    const tags = tagSuggests.map(tag =>{
        return tag.name.slice(4)
    })
    const keySuggests = selectWords.value.filter(word =>{
        return word.name.startsWith("key:")
    })
    const keywords = keySuggests.map(key =>{
        return key.name.slice(4)
    })
    router.push(
    "/wiki/search?tags=" +
    tags.join(",") +
    "&keywords=" +
    keywords.join(",") +
    "&page=0&sort=none"
    );
};
const isSame = (target1: suggest[], target2: suggest[]) =>{
    return target1.length === Array.from(new Set(target1.concat(target2))).length
}
const Submit = () =>{
    if(isSame(beforeWords.value, selectWords.value)){
        console.log("sub");
        
        Search()
    }
    beforeWords.value = selectWords.value
}
</script>
<template>
  <div :class="$style.wrapper">
    <v-combobox
        id="searchBar"
        clearable
        append-icon="mdi-magnify"
        multiple
        :items="showtags"
        item-title="title"
        item-value="name"
        :return-object="true"
        v-model="selectWords"
        label="すべてのSodanとmemoを検索"
        :loading="isLoading"
        variant="outlined"
        rounded="xl"
        :width="width"
        @click:append="Submit"
        @keyup.enter="Submit"
        @update:search="tmpfunc"
    ></v-combobox>
    <p :class="$style.text">#を入力してタグ検索ができます</p>
  </div>
</template>
<style module>
.wrapper{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.text {
  margin-top: -10px;
  margin-bottom: 20px;
  padding: 0;
  text-align: center;
  width: 100%;
  font-weight: bold;
  color: #666666;
}
</style>