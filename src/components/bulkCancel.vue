<script setup>
import { ref } from 'vue';
import Bottleneck from 'bottleneck';
import CSVList from './helpers/uploadCSV.vue';
import PasteList from './helpers/inputList.vue';
import Metadata from "./helpers/metadataRetrieval.vue";
import FormSelect from "./helpers/formSelect.vue";
import backoffFetch from './helpers/backoffFetch';
import EnvironmentSelect from './helpers/selectEnvironment.vue'

const HCF = ref(false);
const apiKeyWrong = ref(false);
const noList = ref(false);
const pastePlease = ref(false);
const csvPlease = ref(false);
const apiKey = ref('');
const idList = ref([]);
const searched = ref(false);

const useMeta = () => noList.value = true;
const usePaste = () => pastePlease.value = true;
const useCSV = () => csvPlease.value = true;

const pushList = (value) => {
  idList.value.push(...value);
  searched.value = true;
  pastePlease.value = false;
}

const pushCSV = (value) => {
  idList.value.push(...value);
  searched.value = true;
  csvPlease.value = false;
  noList.value = true;
  formFactor.value = ('input');
  doneMetadata.value = true;
}

const metadata = ref({});
const doneMetadata = ref(false)
const updateMetadata = (value) => {
  metadata.value = value;
}
const stepOneDone = ref(false);
const stepOneContinue = () => {
  doneMetadata.value = true;
  stepOneDone.value = true;
};

const formFactor = ref('');
const selectFormat = (value) => {
  formFactor.value = value;
}
const stepTwoContinue = () => {
  stepOneDone.value = false;
  searchIds(metadata.value)
}

const processing = ref(false);
const searchIds = async (metadata) => {
  processing.value = true;
  let now = new Date();
  let formUrl = `https://api.lob.com/v1/${formFactor.value}/?limit=100&send_date={"gt":"${now.toISOString()}"}&`;
  if (Object.keys(metadata).length !== 0) {
    formUrl += `&metadata=${JSON.stringify(metadata)}`;
  }
  const options = {
    method: "get",
    headers: {
      Authorization: `Basic ${btoa(apiKey.value + ":")}`,
      'Lob-Version': "2020-02-11"
    },
    keepalive: true,
  };
  let res = await backoffFetch(formUrl, options);
  if (res.error !== undefined) {
    if (res.error.status_code === 401) {
      HCF.value = true;
      apiKeyWrong.value = true;
      return;
    }
    return res;
  }
  idList.value = res.data.map((item => item.id));
  var nextUrl = res.next_url;
  while (nextUrl !== null) {
    let resp = await backoffFetch(nextUrl, options);
    let next = resp.data.map((item) => item.id);
    idList.value.push(...next);
    nextUrl = resp.next_url;
  }
  processing.value = false;
  searched.value = true;
  return;
}

const cancelList = ref([]);
const failList = ref([]);
const failCodes = ref({});
const cancelled = ref(false);
const completed = ref(false);
async function cancelAll() {
  cancelled.value = true;
  completed.value = false;
  const limiter = new Bottleneck({
    reservoir: 140,
    reservoirRefreshAmount: 140,
    reservoirRefreshInterval: 5000,
    maxConcurrent: 50,
    minTime: 34,
  });
  const list = idList.value;
  const deleteEach = (id) => {
    let format;
    if (id[0].toLowerCase() === "p") {
      format = "postcards";
    } else if (id[0].toLowerCase() === "l") {
      format = "letters";
    } else if (id[0].toLowerCase() === "c") {
      format = "checks";
    } else if (id[0].toLowerCase() === "s") {
      format = "self_mailers";
    }
    return backoffFetch(`https://api.lob.com/v1/${format}/${id}`, {
      method: "delete",
      headers: {
        Authorization: `Basic ${btoa(apiKey.value + ":")}`,
        'Lob-Version': "2020-02-11"
      },
      keepalive: true,
    });
  };

  const bottleneckDelete = (id) => {
    return limiter.schedule(() => deleteEach(id));
  };

  list.forEach((id) => {
    bottleneckDelete(id).then((del) => {
      if (del.deleted) {
        cancelList.value.push(del.id);
      } else {
        failList.value.push({
          piece: id,
          error: del.error.status_code,
          message: del.error.message,
        });
        if (del.error.status_code !== 401) {
          failCodes.value[del.error.status_code + " " + del.error.message] =
            failCodes.value[del.error.status_code + " " + del.error.message] > 0
              ? (failCodes.value[del.error.status_code] += 1)
              : 1;
        } else if (del.error.status_code === 401) {
          HCF.value = true;
          apiKeyWrong.value = true;
          return;
        }
      }
    }).catch((err) => {
      failList.value.push({ piece: id, error: err, message: "please retry" });
      failCodes.value[err] = failCodes.value[err] > 0 ? failCodes.value[err] + 1 : 1;
    });
  });

  limiter.on("idle", () => completed.value = true)
}

const exported = ref(false);
const exportFails = () => {
  exportCSV(failList.value);
}

function convertToCSV(fails) {
  const arr = typeof fails !== 'object' ? JSON.parse(fails) : fails;
  let str = 'resource_id,error_code,error_message\r\n';

  for (let i = 0; i < arr.length; i++) {
    let line = '';
    for (let index in arr[i]) {
      if (line !== '') line += ",";
      line += arr[i][index];
    }
    str += line + "\r\n";
  }
  return str;
}

function exportCSV(fails, filename = 'failed_to_cancel.csv') {
  const csvData = convertToCSV(fails);
  const csvBlob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(csvBlob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const pushKey = (value) => {
  apiKey.value = value;
}

const keyFail = (value) => {
  HCF.value = value
}

const reset = () => {
  metadata.value = {};
  apiKey.value = '';
  doneMetadata.value = false;
  formFactor.value = '';
  idList.value = [];
  searched.value = false;
  cancelList.value = [];
  failList.value = [];
  failCodes.value = {};
  cancelled.value = false;
  processing.value = false;
  stepOneDone.value = false;
  noList.value = false;
  pastePlease.value = false;
  completed.value = false;
  csvPlease.value = false;
  getKeys();
}
</script>

<template>
  <div v-if="HCF">
    <h2>Please go to settings to submit your API key!</h2>
    <div v-if="apiKeyWrong">
      <p>Your API key is incorrect or disconnected. If you have confirmed your API key is correct, please reach out to
        support@lob.com for assistance.</p>
    </div>
  </div>
  <div v-else>
    <EnvironmentSelect @pushKey="pushKey" @keyFail="keyFail" v-if="apiKey === ''"></EnvironmentSelect>
    <div v-if="!noList && !pastePlease && !csvPlease && !searched && apiKey !== ''">
      <h2>Do you have an ID list ready?</h2>
      <button @click="useMeta">Search for IDs</button>
      <button @click="useCSV">Upload CSV</button>
      <button @click="usePaste">Paste IDs</button>
    </div>
    <div v-if="!noList && csvPlease">
      <CSVList @pushCSV="pushCSV"></CSVList>
    </div>
    <div v-if="!noList && pastePlease">
      <PasteList @pushList="pushList"></PasteList>
    </div>
    <div v-if="noList">
      <FormSelect @selectFormat="selectFormat" v-if="formFactor === ''" :usekey="apiKey"></FormSelect>
      <Metadata @updateMetadata="updateMetadata" v-if="!doneMetadata && formFactor !== ''"></Metadata>
      <button @click="stepOneContinue" v-if="!doneMetadata && formFactor !== ''">Continue</button>
      <p v-if="stepOneDone">Cancel all {{ formFactor }} <span v-if="Object.keys(metadata).length > 0">with
          the metadata {{ metadata }}</span><span v-else>within the cancellation window</span></p>
      <button @click="stepTwoContinue" v-if="formFactor !== '' && stepOneDone">Continue</button>
      <h2 v-if="processing">Searching...</h2>
    </div>
    <div v-if="searched && !cancelled">
      <p>Found {{ idList.length }} IDs matching parameters.</p>
      <button v-if="idList.length > 0" @click="cancelAll">Cancel All</button>
      <ul>
        <li v-for="id in idList"> {{ id }}</li>
      </ul>
    </div>
    <div v-if="cancelled">
      <h2 v-if="!completed">Processing...</h2>
      <p v-if="cancelList.length > 0">Cancelled {{ cancelList.length }} IDs successfully, including:</p>
      <ul>
        <li v-for="id in cancelList.slice(0, 10)">{{ id }}</li>
      </ul>
      <p v-if="failList.length > 0">Failed to cancel {{ failList.length }} IDs</p>
      <ul>
        <li v-for="(value, key) in failCodes">{{ key }}: {{ value }} ID<span v-if="value > 1">s</span><span
            v-if="key.includes(422)"><br>(Hint: are these within cancellation window?)</span></li>
      </ul>
      <button @click="exportFails" v-if="completed && !exported && failList.length > 0">Export List</button>
    </div>
    <button @click="reset" id="reset">Start Over</button>
  </div>
</template>

<style scoped>
#reset {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

li {
  text-align: left;
}

h2 {
  margin: initial !important;
}
</style>
