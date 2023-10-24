<script setup>
import { ref, defineEmits } from 'vue';

const apiKey = ref('');
const testKey = ref('');
const liveKey = ref('');
const keySelect = ref(true);
const emit = defineEmits(['pushKey', "keyFail"])

const getKeys = async () => {
  const storedTestKey = await window.api.invoke('retrieve-test-key');
  const storedLiveKey = await window.api.invoke('retrieve-live-key');
  if (storedTestKey) {
    testKey.value = storedTestKey;
  } else {
    console.log("No Test key found.");
  }
  if (storedLiveKey) {
    liveKey.value = storedLiveKey;
  } else {
    console.log("No Live key found.")
  }
  if (!storedTestKey && !storedLiveKey) {
    console.error("No API keys found :(")
    emit("keyFail", true)
  }
};
getKeys().then(() => {
  if (liveKey.value === '') useTest();
  if (testKey.value === '') useLive();
})

const useTest = () => { apiKey.value = testKey.value; keySelect.value = false; emit("pushKey", apiKey.value)}
const useLive = () => { apiKey.value = liveKey.value; keySelect.value = false; emit("pushKey", apiKey.value)}
</script>

<template>
  <div v-if="keySelect">
    <h2>Which environment are we in?</h2>
    <button @click="useTest" v-if="testKey !== ''">Test</button>
    <button @click="useLive" v-if="liveKey !== ''">Live</button>
  </div>
</template>

<style scoped>
h2 {
  margin: initial !important;
}
</style>
