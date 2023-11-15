<script setup>
import { ref, defineProps, defineEmits } from 'vue'
const props = defineProps(['useForm', 'usekey'])
const emit = defineEmits(['pushFrom'])
const format = props.useForm;
const apiKey = props.usekey;

const useFrom = ref(true);
const adrID = ref('');
const useForm = ref(false);
const newAdr = () => useForm.value = true;
//to build address for from adr ID
const fromObj = ref({
	name: "",
	company: "",
	address_line1: "",
	address_line2: "",
	address_city: "",
	address_state: "",
	address_zip: "",
})

const verifyAdr = () => {
	if (fromObj.value.name === "" && fromObj.value.company === "") {
		alert("Either a name or company value must be used.")
		return null;
	}

	const body = {
		"address_line1": fromObj.value.address_line1,
		"address_city": fromObj.value.address_city,
		"address_state": fromObj.value.address_state,
		"address_zip": fromObj.value.address_zip
	}
	if (fromObj.value.name) body["name"] = fromObj.value.name;
	if (fromObj.value.company) body["company"] = fromObj.value.company;
	if (fromObj.value.address_line2) body["address_line2"] = fromObj.value.address_line2;

	fetch('https://api.lob.com/v1/addresses', {
		method: 'post',
		headers: {
			'Authorization': `Basic ${btoa(apiKey + ':')}`,
			'Lob-Version': "2020-02-11"
		},
		body: JSON.stringify(body),
		redirect: "follow"
	}).then(resp => resp.json())
		.then(result => {
			if (result.id) adrID.value = result.id;
			submit();
		})
		.catch(err => console.error(err))
};

const submit = () => {
	function validateAddress(input) {
		const regex = /^adr_[0-9a-fA-F]{16}$/
		return regex.test(input) || !useFrom.value
	}

	if (validateAddress(adrID.value.trim())) emit('pushFrom', adrID.value.trim());
	else return alert('Please use a valid address ID (hint: does your ID start with "adr_"?)');
}
</script>

<template>
	<div id="fromAddress">
		<div v-if="format === 'postcards' || format === 'self_mailers'">
			<input type="checkbox" id="useReturn" v-model="useFrom" class="custom-checkbox"><label for="useReturn">use return
				address? (required for
				international {{ format }})</label>
		</div>
		<div v-if="useFrom">
			<div v-if="!useForm">
				<input type="text" id="fromId" v-model="adrID" placeholder="from address ID"><label for="fromId">Lob Address
					ID</label><br>
				<button @click="newAdr" v-if="adrID === ''">Use new address</button>
			</div>
			<div v-if="useForm">
				<div id="adrForm">
					<input type="text" maxlength="40" v-model="fromObj.name" placeholder="name">
					<label for="name">Name</label><br>
					<input type="text" maxlength="40" v-model="fromObj.company" placeholder="company">
					<label for="company">Company</label><br>
					<input type="text" maxlength="64" v-model="fromObj.address_line1" placeholder="address_line1" required><label
						for="adr">Address Line 1</label><br>
					<input type="text" maxlength="64" v-model="fromObj.address_line2" placeholder="address_line2"><label
						for="">Address
						Line 2 (optional)</label><br>
					<input type="text" maxlength="200" v-model="fromObj.address_city" placeholder="address_city" required><label
						for="">City</label><br>
					<input type="text" maxlength="2" v-model="fromObj.address_state" placeholder="address_state" required><label
						for="">State</label><br>
					<input type="text" maxlength="5" v-model="fromObj.address_zip" placeholder="address_zip" required><label
						for="">ZIP
						code (5-digit)</label><br>
				</div>
				<button @click="verifyAdr">Save Address</button>
			</div>
		</div>
		<button @click="submit" v-if="adrID !== '' || !useFrom">Continue</button>
	</div>
</template>

<style scoped>
label {
	margin-left: 5px;
	height: 1em;
	text-align: left;
}

input {
	height: 1em;
}

#adrForm {
	text-align: start;
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
