<template>
  <main>
    <div :class="$style.container">
      <header :class="$style.header">
        <router-link to="/">Home</router-link>|
        <router-link to="/createsodan">CreateSodan</router-link>|
        <router-link to="/sodan/1">Sodan1</router-link>|
        <router-link to="/wiki/like">LikeWiki</router-link>|
        <router-link to="/wiki/mywiki">MyWiki</router-link>|
        <router-link to="/lectures">Lectures</router-link>|
        <router-link to="/mysodan">MySodan</router-link>|
        <router-link to="/creatememo">CreateMemo</router-link>|
        <router-link to="/tag/a">'a'Tag</router-link>|
        <router-link to="/apitest">apitest</router-link>|
        <router-link to="/tekitounayatu">notfound</router-link>|
      </header>

      <router-view />
    </div>
  </main>
</template>

<style module>
.container {
  max-width: fit-content;
  margin: auto;
}

.header {
  display: flex;
  justify-content: center;
}
</style>