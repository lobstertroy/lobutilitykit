<script setup>
import { useDark, useToggle } from '@vueuse/core';

const isDark = useDark();//true or false depending on whether dark mode is enabled
const toggleDark = useToggle(isDark);
</script>

<template>
  <button @click="toggleDark()" id='toggle-dark'>Toggle Dark Mode</button>
</template>

<style>
.dark {
  background: #333;
  color: whitesmoke;
}

#toggle-dark {
  font-size: 12px;
  position: fixed;
  top: 10px;
  right: 10px;
}
</style>
