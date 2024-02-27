<script setup>
import Papa from 'papaparse';
import { ref, computed, reactive, defineProps, defineEmits, triggerRef } from 'vue';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps(['useForm', 'mergevars', 'creativeFiles']);
const format = props.useForm;
const merges = props.mergevars;
const checkBottom = props.creativeFiles.check_bottom !== undefined;
const emit = defineEmits(['audience']);
let file;
const headers = ref([]);
const mappings = reactive({});
const required = reactive(['name', 'address_line1', 'address_city', 'address_state', 'address_zip'])
const optional = reactive(['company', 'address_line2', 'address_country', 'merge_variables', 'metadata', 'unique identifier (for idempotency)'])
const mergevars = reactive([])

if (format === 'checks') {
  if (!checkBottom) required.push('message');
  required.push('bank_account', 'amount');
  optional.push('memo', 'check_number');
}

if (merges.length > 0) mergevars.push(...merges);

const allFields = computed(() => [...required, ...optional, ...mergevars]);
const parseCsv = () => {
  file = event.target.files[0];
  const allowedTypes = ['text/csv'];
  if (!allowedTypes.includes(file.type)) {
    alert('Invalid file type. Please upload a CSV.');
    return;
  }
  Papa.parse(file, {
    complete: function (results) {
      headers.value = results.data[0];
      autoMap(headers.value);
    }
  });

}

function autoMap(headers) {
  headers.forEach(header => {
    if (required.includes(header) || optional.includes(header) || mergevars.includes(header)) {
      //exact name matches
      mappings[header] = header;
    }
  });
}
const isIndexSelected = (index) => {
  return Object.values(mappings).includes(index);
}
const isFirstOfType = field => {
  if (required.includes(field) && required[0] === field) return true;
  if (optional.includes(field) && optional[0] === field) return true;
  if (mergevars.includes(field) && mergevars[0] === field) return true;
  return false;
}

const allFieldsSelected = computed(() => {
  return required.every(field => {
    return (mappings[field] !== undefined && mappings[field] !== null);
  });
});

async function processCsv() {
  let proms = new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: function (results) {
        //transform parsed CSV rows using mapping
        const payloads = results.data.map(row => transformRow(row, mappings, mergevars));
        resolve(payloads);
      },
      header: true,
      skipEmptyLines: triggerRef,
      error: reject
    });
  });
  await proms;
  return proms;
}

function transformRow(row, maps, mvs) {
  let data = { to: {}, merge_variables: {} };
  for (let [key, header] of Object.entries(maps)) {
    if (['name', 'address_line1', 'address_line2', 'company', 'address_city', 'address_state', 'address_zip', 'address_country'].includes(key)) {
      if (key === "address_zip") {
        let zip = row[header];
        while (zip.length < 5) {
          zip = "0" + zip;
        }
        data.to[key] = zip;
      } else {
        data.to[key] = row[header];
      }
    } else if (key.includes("idempotency")) {
      data.idempotency = uuidv4();
    } else if (mvs.includes(key)) {
      data.merge_variables[key] = row[header];
    } else {
      data[key] = row[header];
    }
  }

  if (data.idempotency === undefined) data.idempotency = uuidv4();
  return data;
}

const processEmit = async () => {
  const newFile = await processCsv();
  emit('audience', newFile)
}
</script>

<template>
  <label for="csvUpload">Upload audience file</label><br>
  <input type="file" id="csvUpload" name="csvUpload" @change="parseCsv()" accept=".csv"><br>
  <div v-if="headers.length" id="fieldMap">
    <div v-for="field in allFields" :key="field">
      <h4 v-if="isFirstOfType(field)"> Map {{ required.includes(field) ? 'required' : optional.includes(field) ? 'optional' : 'merge variable' }} fields:</h4>
      <select v-model="mappings[field]" :required="required.includes(field)">
        <option>
          Select option...
        </option>
        <option v-for="(header, index) in headers" :key="header" :value="header" :disabled="isIndexSelected(header)">
          {{ header }}</option>
      </select>
      <label :for="field">{{ field }}</label>
      <span v-if="field === 'metadata' || field === 'merge_variables'"> (nested object version)</span>
    </div>
  </div>
    <button v-if="headers.length" @click="processEmit" :disabled="!allFieldsSelected">Submit</button>
</template>

<style scoped>
label {
  margin-left: 15px;
  height: 1em;
  text-align: left;
}

input {
  height: 1.5em;
  width: 250px;
}

#fieldMap {
  text-align: start;
}
</style>
