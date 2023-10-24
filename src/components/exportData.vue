<script setup>
import { ref } from 'vue';
import FormSelect from './helpers/formSelect.vue';
import DateFilter from './helpers/dateSelect.vue';
import MetaFilter from './helpers/metadataRetrieval.vue'
import backoffFetch from './helpers/backoffFetch.js';
import parseToExport from './helpers/parseToExport.js';
import EnvironmentSelect from './helpers/selectEnvironment.vue';

const HCF = ref(false);
const showDates = ref(false);
const showMeta = ref(false);
const useMeta = ref(false);
const queryAll = ref(false);
const complete = ref(false);
const searching = ref(false);
const formFactor = ref('');
const apiKey = ref('');
const dateBegin = ref('');
const dateEnd = ref('');
const metadata = ref({});

const selectFormat = (value) => {
  formFactor.value = value;
  showDates.value = true;
}

const dateRange = (value) => {
  dateBegin.value = value.from ? value.from : '';
  dateEnd.value = value.to ? value.to : '';
  showDates.value = false;
  showMeta.value = true;
}

const updateMetadata = (value) => {
  metadata.value = value;
  useMeta.value = Object.keys(metadata.value).length > 0;
}

const passMeta = () => {
  showMeta.value = false;
  queryAll.value = true;
}

const searchIds = async (metadata) => {
  searching.value = true;
  let now = new Date();
  let formUrl = `https://api.lob.com/v1/${formFactor.value}/?limit=100`
  if (dateBegin.value !== '' || dateEnd.value !== '') {
    let send_data = {};
    if (dateBegin.value !== '') send_data["gte"] = dateBegin.value;
    if (dateEnd.value !== '') send_data["lte"] = dateEnd.value;
    formUrl += `&send_date=${JSON.stringify(send_data)}`;
  }
  if (Object.keys(metadata).length > 0) {
    formUrl += `&metadata=${JSON.stringify(metadata)}`;
  }
  const options = {
    method: "get",
    headers: {
      Authorization: `Basic ${btoa(apiKey.value + ":")}`,
      'Lob-Version': "2020-02-11"
    }
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
  const data = [...res.data];
  var nextUrl = res.next_url;
  while (nextUrl !== null) {
    let resp = await backoffFetch(nextUrl, options);
    let next = resp.data;
    data.push(...next);
    nextUrl = resp.next_url;
  }

  parseToExport(data);
  complete.value = true;
  searching.value = false;
}

const pushKey = (value) => {
  apiKey.value = value;
}

const keyFail = (value) => {
  HCF.value = value
}

const reset = () => {
  HCF.value = false;
  showDates.value = false;
  showMeta.value = false;
  useMeta.value = false;
  queryAll.value = false;
  complete.value = false;
  formFactor.value = '';
  dateBegin.value = '';
  apiKey.value = '';
  dateEnd.value = '';
  metadata.value = {};
}
</script>

<template>
  <div v-if="HCF">
    <h2>Your API key is missing or incorrect.<br>Please update your API key in the Settings tab.</h2>
  </div>
  <div v-else>
    <h2 v-if="searching">Processing...</h2>
    <EnvironmentSelect @pushKey="pushKey" @keyFail="keyFail" v-if="apiKey === ''"></EnvironmentSelect>
    <div v-if="apiKey !== ''">
      <h4 v-if="formFactor !== '' && !complete">Searching for {{ formFactor }} <span v-if="dateBegin !== ''">made on or
          after {{ dateBegin }} </span><span v-if="dateBegin !== '' && dateEnd !== ''">and </span><span
          v-if="dateEnd !== ''">made on or before {{ dateEnd }} </span><span v-if="useMeta">with the metadata {{ metadata
          }}</span></h4>
      <FormSelect @selectFormat="selectFormat" v-if="formFactor === '' && !showDates" :usekey="apiKey"></FormSelect>
      <DateFilter @dateRange="dateRange" v-if="showDates"></DateFilter>
      <MetaFilter @updateMetadata="updateMetadata" v-if="showMeta"></MetaFilter>
      <button @click="passMeta" v-if="showMeta">Continue</button>
      <button @click="searchIds(metadata)" v-if="queryAll && !complete && !searching">Search</button>
      <h4 v-if="complete">Export complete. Click "start over" to search again.</h4>
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
h2 {
  margin: initial !important;
  padding: initial !important;
}
</style>
