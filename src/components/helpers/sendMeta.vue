<script setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['useMeta'])
const metakey = ref('');
const metaval = ref('');
const metadata = ref({});
const now = Date.now()
metadata.value["bulk_batch_id"] = now;

const saveMeta = () => {
  metadata.value[metakey.value] = metaval.value;
  metakey.value = "";
  metaval.value = "";
};
const clearMeta = () => metadata.value = { bulk_batch_id: now };
const saveContinue = () => emit('useMeta', metadata.value);
</script>

<template>
  <h2>Apply metadata to full bulk send:</h2>
  <h6>Note: `bulk_batch_id` will be included by default.</h6>
  <p v-if="Object.keys(metadata).length > 0">{{ metadata }}</p>
  <input type="text" name="metakey" v-model="metakey" placeholder="Metadata Key"><br>
  <input type="text" name="metaval" v-model="metaval" placeholder="Metadata Value"><br>
  <button @click="saveMeta">Save</button>
  <button @click="clearMeta">Clear</button><br>
  <button @click="saveContinue">Continue</button>
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
