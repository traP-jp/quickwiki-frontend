<script setup lang="ts">
import { onMounted, ref } from 'vue'

const pong = ref<string>('no data')
const user = ref<string>('')

onMounted(async () => {
    const res = await fetch('/api/ping')
    if (res.ok) {
        pong.value = await res.text()
    }

    const resUser = await fetch('/api/me')
    if (resUser.ok) {
      const me = await resUser.json()
      user.value = me.traqId
    }
})

const index = async () => {
  if(user.value !== "kavos") {
    return;
  } else {
    const re = await fetch('/setting/index')
    if (re.ok) {
      pong.value = "OK"
    }
  }
}
</script>
<template>
    {{ pong }}
  <button @click="index">Reset</button>
</template>