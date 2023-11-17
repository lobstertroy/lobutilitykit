<script setup>
import { reactive, ref } from 'vue';
import EnvironmentSelect from './helpers/selectEnvironment.vue';
import FormSelect from './helpers/formSelect.vue';
import FormConfig from './helpers/formConfig.vue';
import Metadata from './helpers/sendMeta.vue';
import UploadCreative from './helpers/uploadCreative.vue';
import AudienceFile from './helpers/audienceFile.vue';
import TestPreview from './helpers/testPreview.vue';
import sendAll from './helpers/sendAll.vue';

const HCF = ref(false);
const step0 = ref(true);
const step1 = ref(false);
const step2 = ref(false);
const step3 = ref(false);
const step4 = ref(false);
const step5 = ref(false);
const step6 = ref(false);
const step7 = ref(false);
const apiKey = ref('');
const testKey = ref('');
const liveKey = ref('');
const format = ref('');
const hasSfm = ref();

const getKeys = async () => {
  const storedTestKey = await window.api.invoke('retrieve-test-key');
  const storedLiveKey = await window.api.invoke('retrieve-live-key');
  if (storedTestKey) {
    testKey.value = storedTestKey;
  } else {
    console.log("No Test key found.");
    HCF.value = true;
    return;
  }
  if (storedLiveKey) {
    liveKey.value = storedLiveKey;
  } else {
    console.log("No Live key found.")
  }
  if (!storedTestKey && !storedLiveKey) {
    console.error("No API keys found :(")
    emit("keyFail", true)
  }
};
getKeys();

function checkSfm() {
  fetch('https://api.lob.com/v1/self_mailers/', {
    method: 'get',
    headers: {
      'Authorization': `Basic ${btoa(apiKey.value + ':')}`
    }

  }).then((res) => {
    if (res.status !== 404 && res.status !== 401) {
      hasSfm.value = true;
    } else {
      hasSfm.value = false;
    }
  })
}
const pushKey = (value) => {
  apiKey.value = value;
  checkSfm();
  step0.value = false;
  step1.value = true;
}

const keyFail = (value) => {
  HCF.value = value;
}

const selectFormat = (value) => {
  format.value = value;
  step1.value = false;
  step2.value = true;
}

const sendSettings = ref();
const config = (value) => {
  sendSettings.value = value;
  step2.value = false;
  step3.value = true;
}

const useMeta = (value) => {
  sendSettings.value["metadata"] = value;
  step5.value = false;
  step6.value = true;
}

const creativeFiles = ref({});
const useFiles = (value) => {
  step3.value = false;
  creativeFiles.value = value
  step4.value = true;
}

const mergevars = ref([]);
const pullMerge = (payload) => {
  if (payload.length > 0) mergevars.value.push(...payload);
}

let audienceFile = reactive([]);
const audience = (value) => {
  step4.value = false;
  audienceFile = value;
  step5.value = true;
}

const confirmContinue = () => {
  step6.value = false;
  step7.value = true;
}

const reset = () => {
  format.value = '';
  HCF.value = false;
  apiKey.value = '';
  testKey.value = '';
  liveKey.value = '';
  step0.value = true;
  step1.value = false;
  step2.value = false;
  step3.value = false;
  step4.value = false;
  step5.value = false;
  step6.value = false;
  step7.value = false;
  audienceFile.value = '';
  creativeFiles.value = {};
  sendSettings.value = {};
  mergevars.value = [];
  getKeys();
}
</script>

<template>
  <div v-if="!HCF">
    <EnvironmentSelect @pushKey="pushKey" @keyFail="keyFail" v-if="step0"></EnvironmentSelect>
    <FormSelect @selectFormat="selectFormat" v-if="step1" :usekey="apiKey"></FormSelect>
    <FormConfig @config="config" v-if="step2" :useForm="format" :usekey="apiKey"></FormConfig>
    <UploadCreative v-if="step3" :useForm="format" @useFiles="useFiles" @pullMerge="pullMerge" :usekey="apiKey">
    </UploadCreative>
    <AudienceFile v-if="step4" :useForm="format" @audience="audience" :mergevars="mergevars"
      :creativeFiles="creativeFiles"></AudienceFile>
    <Metadata v-if="step5" @useMeta="useMeta" :sendSettings="sendSettings" :audience="audience"></Metadata>
    <TestPreview v-if="step6" :useForm="format" :audienceFile="audienceFile" :testKey="testKey" :usekey="apiKey"
      :sendSettings="sendSettings" :creativeFiles="creativeFiles" @confirmContinue="confirmContinue"></TestPreview>
    <sendAll v-if="step7" :useForm="format" :usekey="apiKey" :audienceFile="audienceFile" :sendSettings="sendSettings"
      :creativeFiles="creativeFiles"></sendAll>
    <button @click="reset" id="reset">Start Over</button>
  </div>
  <div v-else>
    <h2 v-if="testKey === ''">A Test API key is required to use this feature.</h2>
    <h2 v-else>Your API keys are incorrect or disconnected. If you have confirmed your API keys are correct, please
      reach out to
      support@lob.com for assistance.</h2>
  </div>
</template>

<style scoped>
li {
  text-align: left;
}

#reset {
  position: fixed;
  bottom: 20px;
  right: 20px;
}

h2 {
  margin: initial !important;
}
</style>
