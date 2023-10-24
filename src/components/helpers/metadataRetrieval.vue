<script setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['updateMetadata'])
const metakey = ref('');
const metaval = ref('');
const metadata = ref({});
const saveMeta = () => {
  metadata.value[metakey.value] = metaval.value;
  metakey.value = "";
  metaval.value = "";
  emit('updateMetadata', metadata.value);
};
const clearMeta = () => {
  metadata.value = {};
  emit('updateMetadata', metadata.value);
}
</script>

<template>
  <h2>Input Metadata</h2>
  <p v-if="Object.keys(metadata).length === 0">If no metadata exists, click continue.</p>
  <p v-if="Object.keys(metadata).length > 0">{{ metadata }}</p>
  <input type="text" name="metakey" v-model="metakey" placeholder="Metadata Key"><br>
  <input type="text" name="metaval" v-model="metaval" placeholder="Metadata Value"><br>
  <button @click="saveMeta">Save</button>
  <button @click="clearMeta">Clear</button><br>
</template>

<style scoped>
input {
  width: 155px;
  margin-top: 5px;
}

button {
  margin: 10px;
  margin-bottom: 10px;
  margin-left: 2.5px;
  margin-right: 2.5px;
}

h2 {
  margin: initial !important;
}
</style>
