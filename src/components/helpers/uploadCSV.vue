<script setup>
import { ref, defineEmits } from 'vue';
import Papa from 'papaparse';

const emit = defineEmits(['pushCSV']);
const theList = ref([]);
const uploadSuccessful = ref(false);
const hasHeads = ref(false);
const processing = ref(false);
const selectConfirm = ref(false);
let file, csvData;

const csvToList = (event) => {
  file = event.target.files[0];
  const allowedTypes = ['text/csv'];
  if (!allowedTypes.includes(file.type)) {
    alert('Invalid file type. Please upload a CSV.');
  }
  Papa.parse(file, { complete: function (results) { handleParsed(results.data) } })
}

const handleParsed = (data) => {
  //check first for multiple columns
  if (data[0].length > 1) {
    if (hasHeads.value) {
      //if there are multiple columns, display dropdown to select appropriate column
      csvData = data;
      displayColumnSelect(data[0]);
    } else {
      alert('Headers were not selected. Please use a one-column file or select the use of headers.')
    }
  } else {
    processing.value = true;
    const ids = data.map(row => row[0]);
    processIds(ids);
  }
}

const columnData = ref([]);
const displayColumns = ref(false);
function displayColumnSelect(columns) {
  displayColumns.value = true;
  columnData.value = columns;
}

const idColumn = ref();
const selectColumn = () => {
  processIds(csvData, idColumn.value)
  processing.value = true;
}

function processIds(list, col = 0) {
  let cleanedList = [];
  for (let row of list) {
    let cleaner = Array.isArray(row) ? row[col].trim() : row.trim();
    if (["psc", "ltr", "sfm", "chk"].includes(cleaner.slice(0, 3)) && cleanedList.indexOf(cleaner) === -1) cleanedList.push(cleaner);
  }

  theList.value.push(...cleanedList)
  continueEmit();
  processing.value = false;
}

const continueEmit = () => {
  emit('pushCSV', theList.value);
  theList.value = [];
}
</script>

<template>
  <div v-if="processing">Processing...</div>
  <div v-if="theList.length === 0">
    <h2>Upload CSV with the following specifications</h2>
    <div v-if="!uploadSuccessful">
      <ul>
        <li>One column of resource IDs (with or without header) ONLY</li>
        <li>Multiple columns, including one with resource IDs, with a required header</li>
      </ul>
      <label for="hasHeads">
        <input type="checkbox" id="hasHeads" v-model="hasHeads" value="Check if using headers" class="custom-checkbox">
        Check if using headers</label><br>
      <input type="file" id="csvUpload" name="csvUpload" @change="csvToList">
    </div>
    <div v-if="displayColumns">
      <p>Select header for IDs:</p>
      <select v-model="idColumn">
        <option disabled value="">Select Column</option>
        <option v-for="(column, index) in columnData" :value="index">{{ column }}</option>
      </select>
      <button @click="selectColumn">Confirm</button>
    </div>
  </div>
</template>

<style scoped>
li {
  text-align: left;
}

input {
  height: initial;
}

.custom-checkbox {
  display: none;
  position: relative;
  margin-right: 10px;
  /* Space for custom checkbox */
  cursor: pointer;
  display: inline-block;
  height: 15px;
  line-height: 15px;
}

/* Unchecked state */
.custom-checkbox::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 15px;
  height: 15px;
  border: 2px solid #777;
  /* Dark border for dark mode */
  background-color: #888;
  /* Dark background for unchecked state in dark mode */
  transition: background-color 0.3s;
}

html.dark .custom-checkbox::before {
  border-color: #555;
  background-color: #444;
}

/* Checked state using the adjacent sibling combinator */
.custom-checkbox:checked::before {
  background-color: #555;
  /* Slightly lighter dark background for checked state */
}

/* For the checkmark */
.custom-checkbox:checked::after {
  content: "✔";
  position: absolute;
  margin-top: 2px;
  margin-left: -2px;
  color: #FFF;
  /* White checkmark for dark mode */
}

.custom-checkbox:hover::before {
  border-color: #888;
  /* Slightly lighter border on hover */
}

/* Adding a focus style using focus-within for better accessibility */
.custom-checkbox:focus-within::before {
  box-shadow: 0 0 0 2px #888;
  /* Focus ring */
}
</style>
