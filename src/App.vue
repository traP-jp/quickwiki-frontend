<template>
  <main>
    <h1 :class="$style.theme">QuickWiki</h1>
    <div :class="$style.container">
      <header :class="$style.header">
        <router-link to="/">QuickWiki</router-link>|
        <router-link to="/createsodan">匿名質問</router-link>|
        <router-link to="/creatememo">Wikiを書く</router-link>|
        <router-link to="/lectures/sougou">講習会資料</router-link>|
      </header>

    </div>
    <div :class="$style.container">
      <header :class="$style.header">
        <router-link to="/">QuickWiki</router-link>|
        <router-link to="/createsodan">CreateSodan</router-link>|
        <router-link to="/wiki/like">LikeWiki</router-link>|
        <router-link to="/wiki/mywiki">MyWiki</router-link>|
        <router-link to="/mysodan">MySodan</router-link>|
        <router-link to="/creatememo">CreateMemo</router-link>|
        <router-link to="/sodan/1">Sodan1</router-link>|
        <router-link to="/tag/a">'a'Tag</router-link>|
        <router-link to="/apitest">apitest</router-link>|
        <router-link to="/tekitounayatu">notfound</router-link>|
      </header>

      <router-view />
    </div>
  </main>
</template>

<style module>
.theme {
  color: rgb(253, 122, 0);
}

.container {
  max-width: fit-content;
  margin: auto;
}

.header {
  display: flex;
  justify-content: center;
}
</style>