<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import FromAddress from './fromAddress.vue';

const props = defineProps(['useForm', 'usekey', 'hasSfm']);
const emit = defineEmits(['config']);

const format = props.useForm;
const apiKey = props.usekey;
const entLevel = ref(props.hasSfm);
const fromId = ref('');
checkSfm();

async function checkSfm() {
  await fetch('https://api.lob.com/v1/self_mailers', {
    method: 'get',
    headers: {
      'Authorization': `Basic ${btoa(apiKey + ':')}`,
      'Lob-Version': "2020-02-11"
    }
  }).then((res) => {
    if (res.status !== 404) {
      entLevel.value = true;
    }
  }).catch(err => {
    console.error(err);
    entLevel.value = false;
  })
}


const adrPlace = ref('top_first_page');
const doubleSided = ref(true);
const colorSelect = ref(false);
const useType = ref('');
const useRenv = ref(false);
const renvId = entLevel.value ? ref('no_9_single_window') : ref(true);
const perfPage = ref(1);
const useCenv = ref(false);
const cenvId = ref('');
const billingGroup = ref('');
const useCards = ref(false);
const cards = ref('');
const pscSize = ref('4x6');
const sfmSize = ref('6x18_bifold');
const mailClass = ref('usps_first_class')
const pushFrom = (value) => {
  fromId.value = value === '' ? null : value;
}

const continueEmit = () => {
  //TODO: verify emit pushes correct data
  if (useType.value === '') {
    alert("Please confirm use type to continue.");
    return;
  }

  const config = {};
  config["mail_type"] = mailClass.value;
  config["use_type"] = useType.value;
  if (fromId.value !== null) {
    config["from"] = fromId.value;
  }
  if (billingGroup.value !== '') {
    config["billing_group_id"] = billingGroup.value;
  }

  if (format === 'postcards') {
    if (pscSize.value === '4x6') {
      config["size"] = '4x6'
      config["mail_type"] = 'usps_first_class'
    } else {
      config["size"] = pscSize.value;
    }
  } else if (format === 'letters') {
    config["color"] = colorSelect.value;
    config["address_placement"] = adrPlace.value;
    if (useRenv.value) {
      config["return_envelope"] = renvId.value;
      config["perforated_page"] = perfPage.value;
    }
    if (useCenv.value) {
      config["custom_envelope"] = cenvId.value
    } if (useCards.value) {
      config["cards"] = [cards.value];
    }
  }

  if (format === 'self_mailers') {
    config["size"] = sfmSize.value;
  }

  emit('config', config);
}
</script>

<template>
  <FromAddress @pushFrom="pushFrom" :useForm="format" :usekey="apiKey" v-if="fromId === ''"></FromAddress>
  <div v-else>
    <div id="sizeSelect" v-if="['self_mailers', 'postcards'].includes(format)">
      <h4>Select size:</h4>
      <div id="selfmailers" v-if="format === 'self_mailers'">
        <input type="radio" id="sfm6x18" value="6x18_bifold" v-model="sfmSize"><label for="sfm6x18">6x18</label>
        <input type="radio" id="sfm11x9" value="11x9_bifold" v-model="sfmSize"><label for="sfm11x9">11x9</label>
        <input type="radio" id="sfm12x9" value="12x9_bifold" v-model="sfmSize"><label for="sfm12x9">12x9</label>
      </div>
      <div v-else>
        <input type="radio" id="sizeSmall" value="4x6" v-model="pscSize"><label for="sizeSmall">4x6</label>
        <input type="radio" id="sizeMed" value="6x9" v-model="pscSize"><label for="sizeMed">6x9</label>
        <input type="radio" id="sizeLarge" value="6x11" v-model="pscSize"><label for="sizeLarge">6x11</label>
      </div>
    </div>
    <div id="mailingClass" v-if="(pscSize !== '4x6' || (format !== 'postcards' && format !== 'checks'))">
      <h4>Select mailing class:</h4>
      <input type="radio" id="firstClass" value="usps_first_class" v-model="mailClass"><label for="firstClass">USPS
        First Class</label><br>
      <input type="radio" id="stdClass" value="usps_standard" v-model="mailClass"><label for="stdClass">USPS Standard
        Mail</label>
    </div>
    <div id="letters" v-if="format === 'letters'">
        <div id="adrPlace">
          <h4>Select address placement:</h4>
          <input type="radio" id="top_first" value="top_first_page" v-model="adrPlace"><label for="top_first">Top first
            page</label><br>
          <input type="radio" id="insert_blank" value="insert_blank_page" v-model="adrPlace"><label
            for="insert_blank">Insert
            blank page</label>
        </div>
        <h4>Misc options</h4>
        <div id="doubleSides">
          <input type="checkbox" id="doublesided" v-model="doubleSided">{{ doubleSided ? 'Double-sided' : 'Single-sided'
          }}
        </div>
        <div id="colorSelect">
          <input type="checkbox" id="fullcolor" v-model="colorSelect">{{ colorSelect ? 'Color' : 'Black & White' }}
        </div>
        <div id="renv">
          <input type="checkbox" id="renvSelect" v-model="useRenv"><label for="renvSelect">Use return envelope ({{ useRenv
            ? 'yes' : 'no' }})</label><br v-if="useRenv && entLevel">
          <input type="text" id="renvId" v-if="entLevel && useRenv" placeholder="envelope ID" v-model="renvId"><br>
          <input type="number" id="perf" v-if="useRenv" v-model="perfPage" min=1 max="120"><label for="perf"
            v-if="useRenv"> Select perforated page number <span v-if="adrPlace === 'insert_blank_page'">(does not include
              address page)</span></label>
        </div>
        <div id="cenv" v-if="entLevel">
          <input type="checkbox" id="cenvSelect" v-model="useCenv">Use custom envelope ({{ useCenv ? 'yes' : 'no' }})<br>
          <input type="text" v-if="useCenv" placeholder="custom envelope ID" v-model="cenvId"><br v-if="useCenv">
          <input type="checkbox" id="cardSelect" v-model="useCards">Use card affix ({{ useCards ? "yes" : "no" }})<br>
          <input type="text" v-if="useCards" v-model="cards" placeholder="card ID">
        </div>
      </div>
      <div id="billgroup" v-if="entLevel">
        <h4>Billing group (optional)</h4>
        <input type="text" v-model="billingGroup" placeholder="billing group ID">
      </div>
      <div id="useType">
        <h4>Use type:</h4>
        <input type="radio" id="marketing" value="marketing" v-model="useType"><label
          for="marketing">marketing</label><br>
        <input type="radio" id="operational" value="operational" v-model="useType"><label
          for="operational">operational</label>
      </div>
    <button @click="continueEmit">Continue</button>
  </div>
</template>

<style scoped>
#letters, #useType, #billgroup, #mailingClass, #sizeSelect {
  padding-left: 75px;
  text-align: left;
  width: 300px;
}

label {
  height: 1.1em;
}

input {
  height: 1.1em;
}

h4 {
  margin: 40px 0 2px 0;
}

button {
  margin-top: 32px;
}
</style>
