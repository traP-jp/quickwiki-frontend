<script setup>

</script>

<template>
  <div class="sidebar">
    <div class="sidebar_content">
      <ul>
        <router-link to="/wiki/mywiki">
          <li class="sidebar_link_content">自分のWiki</li>
        </router-link>
        <router-link to="/wiki/favoritewiki">
          <li class="sidebar_link_content">お気に入りのWiki</li>
        </router-link>
        <router-link to="/creatememo">
          <li class="sidebar_link_content">Wikiを書く</li>
        </router-link>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  z-index: 9;
  font-size: 35px;
  width: 15%;
  min-width: 180px;
  user-select: none;
  border-right: 2px solid #aaaaaa;
  box-shadow: #aaaaaa 2px 2px 2px;
  margin-top: -10px;
}
.sidebar_content {
  position: sticky;
  top: 145px;
}
.sidebar ul {
  font-size: 20px;
  list-style: none;
  margin: 0;
  display: block;
  height: 100%;
  width: 100%;
  line-height: 40px;
  color: #1a1a1a;
}

.sidebar ul a {
  color: #1a1a1a;
}

.sidebar li a:hover {
  color: #1a1a1a;
}

.sidebar_link_content {
  border-right: 5px solid #ffffff;
}

.sidebar_link_content:hover {
  background-color: #f0f0f0;
  border-right: 5px solid #fd7a00;
}

.router-link-active .sidebar_link_content {
  background-color: #f0f0f0;
  border-right: 5px solid #fd7a00;
}
</style>