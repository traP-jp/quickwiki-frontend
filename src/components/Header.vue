<template>
  <div :class="$style.header_header">QuickWiki</div>
  <header :class="$style.header">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.15.4/css/all.css">
    <ul>
      <router-link to="/wiki/mywiki">
            <li>QuickWiki</li>
        </router-link>
        <router-link to="/createsodan">
            <li>匿名質問</li>
        </router-link>
        <router-link to="/creatememo">
            <li>Wikiを書く</li>
        </router-link>
        <router-link to="/lectures/sougou">
            <li>講習会資料</li>
        </router-link>
        <!-- 後で消す！！！ -->
        <router-link to="/sodan/1">
            <li>sodan1</li>
        </router-link>
        <router-link to="/memo/1">
            <li>memo1</li>
        </router-link>
        <!-- ここまで -->
    </ul>
  </header>
</template>

<style module>

.header {
  position: sticky;
  top: 93px;
  z-index: 999;
  display: flex;
  width: 100%;
  justify-content: center;
  background-color: #ffffff;
  box-shadow: 0px 2px 1px 0px #5e5e5e;
}

.header a {
  font-size: 25px;
  color: #1a1a1a;
  user-select: none;
}

.header_header {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 999;
  color: rgb(253, 122, 0);
  font-size: 62px;
  background-color: #ffffff;
  text-align: left;
  padding-left: 30px;
  user-select: none;
}

.header ul {
  padding-left: 10px;
  text-align: left;
  font-size: 20px;
  list-style: none;
  margin: 5px;
  display: block;
  height: 100%;
  width: 100%;
  line-height: 40px;
  color: #1a1a1a;
}

.header li a {
  color: #1a1a1a;
}

.header li a:hover {
  font-size: 25px;
  color: #1a1a1a;
}

.header ul li:hover {
  background-color: #dedede;
  border-radius: 10px;;
}

.header li {
  display: inline-block;
  padding: 0px 10px;
}
</style>
