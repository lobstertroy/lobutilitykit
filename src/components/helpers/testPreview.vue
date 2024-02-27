<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import tempTemp from './tempTemp.js'
import backoffFetch from './backoffFetch';

const props = defineProps(['useForm', 'audienceFile', 'usekey', 'testKey', 'sendSettings', 'creativeFiles']);
const emit = defineEmits(['confirmContinue']);
const testkey = props.testKey;
const livekey = props.usekey;
const format = props.useForm;
const audience = props.audienceFile;
const settings = props.sendSettings;
const creatives = props.creativeFiles;
const pagePreview = ref();
const pieceId = ref();
const testSent = ref(false);
const error = ref('');
const msg = ref('');
const testTemps = [];
let thumbnail;

const singleSend = async (row) => {
  testSent.value = true;
  let formData = await parseRow(row);
  const testIdempotent = uuidv4();
  backoffFetch(`https://api.lob.com/v1/${format}?idempotency_key=${testIdempotent}`, {
    method: 'post',
    headers: {
      'Authorization': `Basic ${btoa(testkey + ":")}`
    },
    body: formData,
    redirect: "follow"
  }).then(res => {
    if (res.id) {
      pieceId.value = res.id;
      deleteTest(res.id);
      thumbnail = res.url;
      retryFetch(thumbnail).then(resp => {
        pagePreview.value = resp.url;
      })
        .catch(err => console.error(err))
    } else if (res.error) {
      error.value = res.error.status_code;
      msg.value = res.error.message;
    }
  }).catch(err => console.error("Error sending test:", err))
}
const retryFetch = async (url, maxRetries = 10, retryInterval = 1500) => {
  let response;
  let retries = 0;
  while (retries < maxRetries) {
    response = await fetch(url);
    if (response.status !== 404) {
      return response;
    }
    retries++;
    await new Promise(res => setTimeout(res, retryInterval));
  }
  throw new Error('Max retries reached :(');
}

const retryPull = () => {
  retryFetch(thumbnail)
    .then(res => {
      pagePreview.value = res.url;
    })
}

const deleteTest = (id) => {
  fetch(`https://api.lob.com/v1/${format}/${id}`, {
    method: 'delete',
    headers: {
      'Authorization': `Basic ${btoa(testkey + ':')}`,
      'Lob-Version': "2020-02-11"
    }
  });
  for (let i = 0; i < testTemps.length; i++) {
    fetch(`https://api.lob.com/v1/templates/${testTemps[i]}`, {
      method: 'delete',
      headers: {
        'Authorization': `Basic ${btoa(testkey + ':')}`,
        'Lob-Version': "2020-02-11"
      }
    })
  }
}

async function parseRow(row) {
  const formData = new FormData();
  for (const [key] of Object.entries(row)) {
    if (!['idempotency', "metadata", "to", "from", "merge_variables", "bank_account"].includes(key)) {
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
    if (["metadata", "merge variables", "custom_envelope", "cards"].includes(key)) {
      continue;
    } else if (key === "return_envelope") {
      let value = settings[key];
      if (value === true) {
        formData.append(key, JSON.stringify(true));
      } else {
        formData.append(key, "no_9_single_window");
      }
    } else if (key === "from") {
      formData.append("from[name]", "Test Piece");
      formData.append("from[address_line1]", "210 King St");
      formData.append("from[address_city]", "San Francisco");
      formData.append("from[address_state]", "CA");
      formData.append("from[address_zip]", "94107")
    } else if (key === "test_bank") {
      formData.append("bank_account", settings[key]);
    } else {
      formData.append(key, settings[key])
    }
  }

  if (settings["cards"]) {
    formData.append("cards", JSON.stringify(settings["cards"]));
  }

  const met1 = row.metadata ? JSON.parse(row.metadata) : {};
  const met2 = settings.metadata;
  const met3 = { ...met1, ...met2 };
  for (const [key] of Object.entries(met3)) {
    formData.append(`metadata[${key}]`, met3[key])
  }

  for (const [key, value] of Object.entries(creatives)) {
    if (value instanceof File || value.includes("tmpl_") && livekey === testkey || !value.includes("tmpl_")) {
      formData.append(key, value);
    } else if (value.includes("tmpl_") && livekey !== testkey) {
      const newTempl = await tempTemp(value, livekey, testkey);
      testTemps.push(newTempl);
      formData.append(key, newTempl);
    }
  }

  return formData
}

const sendAll = () => {
  emit('confirmContinue')
}
</script>

<template>
  <button @click="singleSend(audience[0])" v-if="!pagePreview && !testSent">test</button>
  <div v-if="pieceId && !pagePreview">Created {{ pieceId }}</div>
  <embed :src="pagePreview" width="600px" height="785px" type="application/pdf" v-if="pagePreview">
  <p v-if="testSent && !pagePreview && !error">Attempting to retrieve thumbnail preview. If no image generates after 20
    seconds,
    please <button @click="retryPull">retry</button></p><br>
  <h3 v-if="error || msg">Error generating mailpiece ({{ error }}: {{ msg }})</h3>
  <button v-if="pagePreview" @click="sendAll">Send All</button>
</template>

<style scoped>
</style>
