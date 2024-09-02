<script setup>

</script>

<template>
  <div class="sidebar">
    <div class="sidebar_content">
      <h2 class="sidebar_header">講習会</h2>
      <ul>
        <router-link to="/lectures/sougou">
          <li class="sidebar_link_content">総合/融合</li>
        </router-link>
        <router-link to="/lectures/SysAd">
          <li class="sidebar_link_content">SysAd</li>
        </router-link>
        <router-link to="/lectures/algorithm">
          <li class="sidebar_link_content">アルゴリズム</li>
        </router-link>
        <router-link to="/lectures/CTF">
          <li class="sidebar_link_content">CTF</li>
        </router-link>
        <router-link to="/lectures/Kaggle">
          <li class="sidebar_link_content">Kaggle</li>
        </router-link>
        <router-link to="/lectures/Game">
          <li class="sidebar_link_content">ゲーム</li>
        </router-link>
        <router-link to="/lectures/sound">
          <li class="sidebar_link_content">サウンド</li>
        </router-link>
        <router-link to="/lectures/graphics">
          <li class="sidebar_link_content">グラフィック/デザイン</li>
        </router-link>
        <router-link to="/lectures/others">
          <li class="sidebar_link_content">その他講習会</li>
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