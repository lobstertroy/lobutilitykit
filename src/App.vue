<script setup>
import darkMode from './components/darkMode.vue';
</script>

<template>
  <img alt="Lob logo" width="90" id="loblogo">
  <darkMode />
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/cancel">Bulk Cancel</router-link> |
    <router-link to="/send">Bulk Send</router-link> |
    <router-link to="/export">Export Data</router-link> |
    <router-link to="/settings">Settings</router-link>
  </div>
  <div class="container">
    <router-view></router-view>
  </div>
</template>

<style scoped>
#loblogo {
  position: absolute;
  top: 10px;
  left: 10px;
  content: url('../Key.svg');
}

html.dark #loblogo {
  content: url('../White.svg');
}

#nav {
  position: absolute;
  top: 10px;
  left: 20%;
  right: 20%;
  font-size: 18px;
}

.router-link-active {
  border-bottom: 2px solid #646cff;
}
</style>
