<script setup>
import { ref } from 'vue';

const testKey = ref('');
const showTestKey = ref('');
const hasTestKey = ref(false);

const liveKey = ref('');
const showLiveKey = ref('');
const hasLiveKey = ref(false);

const getTest = async () => {
  const storedKey = await window.api.invoke('retrieve-test-key');
  if (storedKey) {
    showTestKey.value = storedKey;
    hasTestKey.value = true;
    console.log("Test key retrieved.")
  } else {
    testKey.value = '';
    hasTestKey.value = false;
    showTestKey.value = '';
    console.error("No Test API key found :(")
  }
};
const getLive = async () => {
  const storedKey = await window.api.invoke('retrieve-live-key');
  if (storedKey) {
    showLiveKey.value = storedKey;
    hasLiveKey.value = true;
    console.log("Live key retrieved.")
  } else {
    liveKey.value = '';
    showLiveKey.value = '';
    hasLiveKey.value = false;
    console.error("No Live API key found :(")
  }
}
getTest();
getLive();

const saveTest = async () => {
  if (await !ensureKeyWorks(testKey.value)) return;

  const success = await window.api.invoke('store-test-key', testKey.value);
  if (success) {
    console.log("API Key saved successfully.");
    await getTest();
    hasTestKey.value = showTestKey.value !== '' ? true : false;
    testKey.value = '';
  } else {
    console.error("Failed to save Test API key :(")
  }
}
const saveLive = async () => {
  if (await ensureKeyWorks(liveKey.value)) {
    const success = await window.api.invoke('store-live-key', liveKey.value);
    if (success) {
      console.log("Live key saved successfully.");
      await getLive();
      hasLiveKey.value = showLiveKey.value !== '' ? true : false;
      liveKey.value = '';
    }
  } else {
    console.error("Failed to save Live API key :(")
  }
}

function ensureKeyWorks(key) {
  if (key === '') return true;
  try {
    const success = fetch('https://api.lob.com/v1/letters/', {
      method: 'get',
      headers: {
        'Authorization': `Basic ${btoa(key + ':')}`
      }
    }).then(res => {
      if (res.status !== 401) {
        return true;
      } else {
        alert("This API key appears to be incorrect or nonfunctional. Please recheck and attempt again.")
        return false;
      }
    })
    return success;
  } catch (err) {
    console.error(err);
    alert("This API key appears to be incorrect or nonfunctional. Please recheck and attempt again.")
    return false;
  }
}
</script>

<template>
  <h2>Navigate to your Lob Dashboard to retrieve your API key under the Settings > API Keys tab.</h2>
  <div v-if="!hasTestKey">
    <input v-model="testKey" placeholder="Enter Test API Key">
    <button @click="saveTest" id="savebutton">Save</button>
  </div>
  <div v-else>
    <input v-model="testKey" placeholder="Update Test Key">
    <button @click="saveTest" id="updatebutton">Update</button>
  </div>
  <div v-if="!hasLiveKey">
    <input v-model="liveKey" placeholder="Enter Live API Key">
    <button @click="saveLive" id="savebutton">Save</button>
  </div>
  <div v-else>
    <input v-model="liveKey" placeholder="Update Live Key">
    <button @click="saveLive" id="updatebutton">Update</button>
  </div>
  <div>
    <p v-if="showTestKey !== ''">Current Test API key: {{ showTestKey.slice(0, 8) }}.....</p>
    <p v-if="showLiveKey !== ''">Current Live API key: {{ showLiveKey.slice(0, 8) }}.....</p>
  </div>
</template>

<style>
html.dark input {
  background: rgba(255, 255, 255, 0.1);
}

html.dark input::placeholder {
  color: whitesmoke;
  opacity: 0.5;
}

input {
  background: rgba(0, 0, 0, 0.1);
  height: 2.9em;
  border-radius: 8px;
  text-align: center;
}

input::placeholder {
  color: black;
  opacity: 0.5;
}

h2 {
  margin-left: 20%;
  margin-right: 20%;
}
</style>
