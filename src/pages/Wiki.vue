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
    <main>
      <router-view />
    </main>
  </div>
</template>

<style module>
* {
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  margin-top: -10px;
  padding-top: 10px;
  gap: 10px;
}

main {
  flex: 1 1 auto;
}

.sidebar_content {
  top: 0;
}
</style>
