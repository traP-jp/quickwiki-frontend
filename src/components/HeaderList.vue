<script setup>
import HeaderListItems from "./HeaderListItems.vue";
</script>

<template>
  <div :class="$style.header_list">
    <ul>
      <header-list-items />
    </ul>
  </div>
</template>

<style module>
.header_list a {
  font-size: 25px;
  color: #1a1a1a;
  user-select: none;
}

.header_list ul {
  padding-left: 10px;
  text-align: left;
  font-size: 20px;
  list-style: none;
  margin: 5px;
  display: block;
  height: 100%;
  line-height: 40px;
  color: #1a1a1a;
}

.header_list li a {
  color: #1a1a1a;
}

.header_list ul li:hover {
  background-color: #f0f0f0;
  border-bottom: 3px solid #fd7a00;
}

.header_list li {
  display: inline-block;
  padding: 0px 10px;
}
</style>