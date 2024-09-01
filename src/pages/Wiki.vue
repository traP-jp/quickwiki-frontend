<script setup lang="ts">
</script>

<template>
  <div :class="$style.container">
    <div class="sidebar">
      <div class="sidebar_content">
        <ul>
          <router-link to="/wiki/mywiki">
            <li>自分のWiki</li>
          </router-link>
          <router-link to="/wiki/favoritewiki">
            <li>お気に入りのWiki</li>
          </router-link>
          <router-link to="/creatememo">
            <li>Wikiを書く</li>
          </router-link>
        </ul>
      </div>
    </div>
    <main :class="$style.mainHeader">
      <router-view />
    </main>
  </div>
</template>

<style module>
* {
  margin: 0;
  padding: 0;
}

body {
  height: 100vh;
}

.container {
  display: flex;
  height: 100vh;
}

main {
  flex: 1 1 auto;
  background: coral;
}

.sidebar_content {
  top: 0;
}
</style>
