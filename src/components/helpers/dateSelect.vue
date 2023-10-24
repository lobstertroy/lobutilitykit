<script setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['dateRange']);
const beginDate = ref(undefined);
const endDate = ref(undefined);

const pushDates = () => emit('dateRange', {
  from: beginDate.value,
  to: endDate.value
});
const skip = () => emit('dateRange', {
  from: null,
  to: null
})
</script>


<template>
  <h2>Would you like to choose a date range?</h2>
  <label for="fromDate">Begin:</label>
  <input type="date" id="fromDate" v-model="beginDate"><br>
  <label for="toDate">End:</label>
  <input type="date" id="toDate" v-model="endDate"><br>
  <button @click="pushDates">Continue</button>
  <button @click="skip">Skip</button>
</template>

<style scoped>
label[for=fromDate] {
 margin-right: 15px;
}

label[for=toDate] {
  margin-right: 27px;
}

button {
  margin-top: 10px;
}

input {
  color: darkslategrey;
}

html.dark input {
  color: white
}
</style>
