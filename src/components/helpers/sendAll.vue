<script setup>
import { ref, reactive, defineProps } from 'vue';
import Bottleneck from "bottleneck";
import backoffFetch from "./backoffFetch.js";

const props = defineProps(['useForm', 'usekey', 'audienceFile', 'sendSettings', 'creativeFiles']);
const awaitConfirm = ref(true);
const incomplete = ref(true);
const apikey = props.usekey;
const format = props.useForm;
const audience = props.audienceFile;
const settings = props.sendSettings
const creatives = props.creativeFiles;

const confirmAll = () => {
  awaitConfirm.value = false;
  sendAll()
}

async function parseRow(row) {
  const formData = new FormData();
  for (const [key] of Object.entries(row)) {
    if (!['idempotency', 'metadata', 'to', 'from', 'merge_variables'].includes(key)) {
      formData.append(key, row[key])
    } else if (key === "to") {
      for (const [key] of Object.entries(row["to"])) {
        formData.append(`to[${key}]`, row["to"][key])
      }
    } else if (key === "merge_variables") {
      for (const [key] of Object.entries(row["merge_variables"])) {
        formData.append(`merge_variables[${key}]`, row["merge_variables"][key])
      }
    }
  }
  for (const [key] of Object.entries(settings)) {
    if (key === "metadata") continue;
    if (key === "merge_variables") continue;
    if (key === "test_bank") continue;
    if (key === "cards") {
      formData.append("cards", JSON.stringify(settings["cards"]));
      continue;
    }
    formData.append(key, settings[key])
  }

  const met1 = row.metadata ? JSON.parse(row.metadata) : {};
  const met2 = settings.metadata;
  const met3 = { ...met1, ...met2 };
  for (const [key] of Object.entries(met3)) {
    formData.append(`metadata[${key}]`, met3[key])
  }

  for (const [key] of Object.entries(creatives)) {
    formData.append(key, creatives[key])
  }

  return formData
}

function sendThis(data, idempotency) {
  const formDataJson = (formdata) => {
    const obj = {};
    formdata.forEach((value, key) => {
      //skip Files
      if (!(value instanceof File)) {
        //if property already exists
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          //if it's an array, push the new value
          if (Array.isArray(obj[key])) {
            obj[key].push(value);
          } else {
            //it's not an array, so turn it into one with the items composed of the previous value and the new value
            obj[key] = [obj[key], value];
          }
        } else {
          //if the property doesn't exist, add it :)
          obj[key] = value;
        }
      }
    });
    return obj;
  }

  return backoffFetch(`https://api.lob.com/v1/${format}?idempotency_key=${idempotency}`, {
    method: "post",
    headers: {
      Authorization: `Basic ${btoa(apikey + ":")}`,
      'Lob-Version': "2020-02-11"
    },
    body: data,
    keepalive: true
  }).then((response) => {
    if (response.id) {
      successList.push(response);
      sentIds.add(response.id);
      sentCount.value = sentIds.size;
    } else {
      failList.push({
        error: response.error ? response.error.status_code : 'unknown error',
        issue: response.error ? response.error.code : 'unknown issue',
        message: response.error ? response.error.message : 'no response ID',
        requestData: formDataJson(data)
      });
      failCount.value++;
    }
  }).catch((err) => {
    console.error(err);
    failList.push({
      error: 'Exception',
      message: err.message || 'unknown exception',
      requestData: formDataJson(data)
    });
    failCount.value++;
  });
}

const failList = [];
const failCount = ref(0);
const sentIds = new Set();
const sentCount = ref(0);
const successList = [];
const sendAll = async () => {
  const limiter = new Bottleneck({
    reservoir: 140,
    reservoirRefreshAmount: 140,
    reservoirRefreshInterval: 5000,
    maxConcurrent: 50,
    minTime: 34
  });

  async function bottleneckSend(data, idempotency) {
    return limiter.schedule(() => sendThis(data, idempotency))
  }

  audience.forEach(async (row) => {
    const formData = await parseRow(row);
    const idempotency = row.idempotency;
    bottleneckSend(formData, idempotency);
  });

  limiter.on("idle", () => {
    incomplete.value = false;
  })
}


function exportFails() {
  const csvData = convertToCSV(failList);
  const csvBlob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(csvBlob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'bulk_fail_export');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportSuccess() {
  const csvData = convertToCSV(successList); //take data array and turn it into CSV string
  const csvBlob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(csvBlob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'bulk_send_export');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


function convertToCSV(data) {
  console.log(data)
  const arr = typeof data !== 'object' ? JSON.parse(data) : data;

  let str = '';
  for (let key in data[0]) {
    str += key + ","
  }
  str += "\r\n";

  for (let i = 0; i < arr.length; i++) {
    let line = '';
    for (let index in arr[i]) {
      if (line !== '') line += ",";
      if (typeof arr[i][index] === 'string') {
        line += `"${arr[i][index].replace(/"/g, '""')}"`;
      } else if (typeof arr[i][index] === 'object' && arr[i][index] !== null) {
        line += `"${JSON.stringify(arr[i][index]).replace(/"/g, '""')}"`
      } else {
        line += arr[i][index];
      }
    }
    str += line + '\r\n';
  }
  return str;
}
</script>

<template>
  <button @click="confirmAll" v-if="awaitConfirm">Attempt {{ audience.length }} sends</button>
  <div v-if="!awaitConfirm">
    <h3 v-if="incomplete">Attempting to send {{ audience.length }} pieces...</h3>
    <h4 v-if="sentCount > 0">Successfully sent {{ sentCount }} pieces.</h4>
    <h4 v-if="failCount > 0">{{ failCount }} pieces failed.</h4>
    <button v-if="!incomplete && sentCount > 0" @click="exportSuccess">Export created pieces</button>
    <button v-if="!incomplete && failCount > 0" @click="exportFails">Export failures</button>
  </div>
</template>

<style scoped>
</style>
