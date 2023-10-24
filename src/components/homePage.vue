<script setup>
import router from "../router/index.js";

const goCancel = () => router.replace({ path: '/cancel' });
const goSettings = () => router.replace({ path: '/settings' });
const goSend = () => router.replace({ path: '/send' });
const goExport = () => router.replace({ path: '/export' });
</script>

<template>
  <h1>Welcome to Lob Utility Kit</h1>
  <h2>What would you like to do?</h2>
  <div id="buttons">
    <button @click="goCancel" id="go-cancel">Bulk Cancel</button>
    <button @click="goSend">Bulk Send</button>
    <button @click="goExport">Export Data</button>
    <button @click="goSettings" id="go-setting">Settings</button>
  </div>
</template>

<style scoped>
button {
  width: 150px;
}

#buttons {
  padding-left: 25%;
  padding-right: 25%;
}
</style>
