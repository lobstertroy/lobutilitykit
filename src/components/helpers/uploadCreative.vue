<script setup>
import { ref, reactive, defineProps, defineEmits } from 'vue';

const props = defineProps(['useForm', 'usekey']);
const emit = defineEmits(['useFiles', 'pullMerge'])
const format = props.useForm;
const apikey = props.usekey;

const useTemp1 = ref(false);
const useTemp2 = ref(false);
const useTemp3 = ref(false);
const front = ref('');
const frontUpload = event => front.value = event.target.files[0];
const back = ref('');
const backUpload = event => back.value = event.target.files[0];
const file = ref('');
const fileUpload = event => file.value = event.target.files[0];
const inside = ref('');
const insideUpload = event => inside.value = event.target.files[0];
const outside = ref('');
const outsideUpload = event => outside.value = event.target.files[0];
const checkBottom = ref('');
const bottomUpload = event => checkBottom.value = event.target.files[0];
const checkAttachment = ref('');
const attachmentUpload = event => checkAttachment.value = event.target.files[0];
const checkLogo = ref('');
const logoUpload = event => checkLogo.value = event.target.files[0];

const submit = async () => {
  const creatives = ref({});

  if (format === 'postcards') {
    if (front.value === '' || back.value === '') {
      alert("Missing creative file.");
      return;
    }
    creatives.value["front"] = front.value;
    creatives.value["back"] = back.value;
  } else if (format === 'self_mailers') {
    if (inside.value === '' || outside.value === '') {
      alert("Missing creative file.");
      return;
    }
    creatives.value["inside"] = inside.value;
    creatives.value["outside"] = outside.value;
  } else if (format === 'letters') {
    creatives.value["file"] = file.value;
  } else {
    if (checkAttachment.value !== '') creatives.value["attachment"] = checkAttachment.value;
    if (checkBottom.value !== '') creatives.value["check_bottom"] = checkBottom.value;
    if (checkLogo.value !== '') creatives.value["logo"] = checkLogo.value;
  }

  //iterate over properties of creatives.value to trim strings
  for (const key in creatives.value) {
    if (typeof creatives.value[key] === 'string') {
      creatives.value[key] = creatives.value[key].trim();
    }
  }

  await templatePull(creatives.value);
  emit('useFiles', creatives.value);
}

async function templatePull(creatives) {
  let mergevars = [];
  const fetchPromises = [];
  for (let each in creatives) {
    if ((typeof creatives[each] === 'string') && (creatives[each].includes("tmpl_"))) {
      const fetchPromise = fetch(`https://api.lob.com/v1/templates/${creatives[each]}`, {
        method: 'get',
        headers: {
          'Authorization': `Basic ${btoa(apikey + ":")}`
        }
      }).then(resp => resp.json()).then(resp => {
        if (resp.published_version.merge_variables) mergevars.push(...resp.published_version.merge_variables.keys);
      }).catch(err => console.error("Error fetching template:", err));

      fetchPromises.push(fetchPromise)
    }
  }

  await Promise.all(fetchPromises);

  //for each key in creatives,
  //if the value is a template,
  //pull the merge variables for that template via API request
  //wait for all promises to resolve, then emit
  if (mergevars.length > 0) emit('pullMerge', mergevars);
}
</script>

<template>
  <div v-if="format === 'postcards'">
    <label for="useTempFront">
      <input type="checkbox" id="useTempFront" v-model="useTemp1" class="custom-checkbox">
      Check if using an HTML template or remote URL for the Front file</label><br>
    <input v-if="useTemp1" type="text" placeholder="tmpl_id" v-model="front">
    <input v-else type="file" id="frontFile" name="frontFile" accept=".pdf" @change="frontUpload"><br>
    <label for="useTempBack">
      <input type="checkbox" id="useTempBack" v-model="useTemp2" class="custom-checkbox">
      Check if using an HTML template or remote URL for the Back file</label><br>
    <input v-if="useTemp2" type="text" placeholder="tmpl_id" v-model="back">
    <input v-else type="file" id="backFile" name="backFile" accept=".pdf" @change="backUpload">
  </div>
  <div v-if="format === 'self_mailers'">
    <label for="useTempInside">
      <input type="checkbox" id="useTempInside" v-model="useTemp1" class="custom-checkbox">
      Check if using an HTML template or remote URL for the Inside file</label><br>
    <input v-if="useTemp1" type="text" placeholder="tmpl_id" v-model="inside">
    <input v-else type="file" id="insideFile" name="insideFile" accept=".pdf" @change="insideUpload"><br>
    <label for="useTempBack">
      <input type="checkbox" id="useTempOutside" v-model="useTemp2" class="custom-checkbox">
      Check if using an HTML template or remote URL for the Outside file</label><br>
    <input v-if="useTemp2" type="text" placeholder="tmpl_id" v-model="outside">
    <input v-else type="file" id="outsideFile" name="outsideFile" accept=".pdf" @change="outsideUpload">
  </div>
  <div v-if="format === 'letters'">
    <label for="useTemp">
      <input type="checkbox" id="useTemp" v-model="useTemp1" class="custom-checkbox">
      Check if using an HTML template or remote URL</label><br>
    <input v-if="useTemp1" type="text" placeholder="tmpl_id" v-model="file">
    <input v-else type="file" id="letterFile" name="letterFile" accept=".pdf" @change="fileUpload">
  </div>
  <div v-if="format === 'checks'">
    <h4>Optional fields:</h4>
    <label for="useTempBottom">
      <input type="checkbox" id="useTempBottom" v-model="useTemp1" class="custom-checkbox">
      Check if using an HTML template or remote URL for the check bottom file</label><br>
    <input v-if="useTemp1" type="text" placeholder="tmpl_id" v-model="checkBottom">
    <input v-else type="file" id="bottomFile" name="bottomFile" accept=".pdf" @change="bottomUpload"><br>
    <label for="useTempAttach">
      <input type="checkbox" id="useTempAttach" v-model="useTemp2" class="custom-checkbox">
      Check if using an HTML template or remote URL for the check attachment file</label><br>
    <input v-if="useTemp2" type="text" placeholder="tmpl_id" v-model="checkAttachment">
    <input v-else type="file" id="attachFile" name="attachFile" accept=".pdf" @change="attachmentUpload"><br>
    <input type="checkbox" id="useLogoUrl" v-model="useTemp3" class="custom-checkbox">
    <label for="useLogoUrl">Check if using a remote URL for the check logo</label><br>
    <input v-if="useTemp3" type="text" placeholder="remote URL" v-model="checkLogo">
    <input v-else type="file" id="logo" name="chkLogo" accept=".png,.jpg" @change="logoUpload">
  </div>
  <button @click="submit">Submit</button>
</template>

<style scoped>
li {
  text-align: left;
}

input {
  height: initial;
  margin-bottom: 15px;
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
