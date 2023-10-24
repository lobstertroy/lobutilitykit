<script setup>
import { ref, defineEmits } from 'vue'

const emit = defineEmits(['pushList']);
const theInput = ref('');
const theList = ref([]);
const tryAgain = ref(false);
const processing = ref(false);

const inputToList = () => {
  processing.value = true;
  let splitInput = theInput.value.split(/[ ,]+/);

  let cleanedInput = [];
  for (let id of splitInput) {
    let cleaner = id.trim();
    if (["psc", "ltr", "sfm", "chk"].includes(cleaner.slice(0, 3)) && cleanedInput.indexOf(cleaner) === -1) cleanedInput.push(cleaner);
  }
  theList.value.push(...cleanedInput);
  theInput.value = "";
  if (theList.value.length === 0) { tryAgain.value = true; }
  else {
    tryAgain.value = false;
  }
  processing.value = false;
}

const continueEmit = () => {
  emit('pushList', theList.value);
  theList.value = [];
}
</script>

<template>
  <div v-if="processing">Processing...</div>
  <div v-if="theList.length === 0">
    <h2>Paste IDs separated by commas or spaces</h2>
    <input v-model="theInput" type="text" placeholder="paste IDs">
    <button @click="inputToList">Submit</button>
  </div>
  <div v-else>
    <h3>List contains {{ theList.length }} unique IDs</h3>
    <button @click="continueEmit">Continue</button>
  </div>
  <ul>
    <li v-for="id in theList.slice(0, 100)">{{ id }}</li>
  </ul>
  <p v-if="tryAgain">Hint: do your IDs match Lob syntax (beginning with psc, ltr, chk, or sfm)?</p>
</template>

<style scoped>
h3 {
  margin-bottom: -10px;
}

input {
  width: 98%;
}

button {
  margin-top: 10px;
}

li {
  margin-left: -15px;
  text-align: left;
}
</style>
