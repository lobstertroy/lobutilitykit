<script setup>
import { defineEmits, defineProps, ref } from 'vue'
const props = defineProps(['usekey']);
const apiKey = props.usekey;
const hasSfm = ref(false);
function checkSfm() {
  fetch('https://api.lob.com/v1/self_mailers', {
    method: 'get',
    headers: {
      'Authorization': `Basic ${btoa(apiKey + ':')}`,
      'Lob-Version': "2020-02-11"
    }

  }).then((res) => {
    if (res.status !== 404 && res.status !== 401) {
      hasSfm.value = true;
    } else {
      hasSfm.value = false;
    }
  })
}
checkSfm();

const emit = defineEmits(['selectFormat'])
const chk = () => emit('selectFormat', "checks");
const ltr = () => emit('selectFormat', "letters");
const psc = () => emit('selectFormat', "postcards");
const sfm = () => emit('selectFormat', "self_mailers");
</script>

<template>
  <div id="wrapper">
    <h2>What mailpiece type is being used?</h2>
    <div id="buttons" v-if="hasSfm">
      <button @click="chk">Checks</button>
      <button @click="ltr">Letters</button>
      <button @click="psc">Postcards</button>
      <button @click="sfm">Self-Mailers</button>
    </div>
    <div id="fewerButtons" v-else>
      <button @click="chk">Checks</button>
      <button @click="ltr">Letters</button>
      <button @click="psc">Postcards</button>
    </div>
  </div>
</template>

<style scoped>
#wrapper {
  padding: initial !important;
}

#buttons {
  width: 350px;
  margin: 0;
  padding: 0;
  left: 20%;
  right: 20%;
}

button {
  width: 125px;
}

h2 {
  margin: initial !important;
}
</style>
