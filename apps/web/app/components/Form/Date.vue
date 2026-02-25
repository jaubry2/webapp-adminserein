<template>
  <div class="relative font-poppins">
    <label :for="uniqueId">
      {{ props.placeholder }} {{ props.mandatory ? "*" : "" }}
    </label>
    <input type="date" v-model="date" />
  </div>
</template>

<script lang="ts" setup>
/*******************************************************************************************************************/
/* IMPORTS */
/*******************************************************************************************************************/
import { defineProps, defineEmits, ref, watch, computed } from "vue";
/*******************************************************************************************************************/
/* PARAMETRES */
/*******************************************************************************************************************/
/* VARIABLES SYSTEMES */
const props = defineProps({
  placeholder: {
    type: String,
    default: "",
  },
  mandatory: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["updateValue"]);

const uniqueId = computed(
  () => `input-${props.placeholder.toLowerCase().replace(/\s/g, "-")}`,
);

const date = ref(props.modelValue);

watch(date, (newDate: string) => {
  emit("updateValue", newDate);
});

watch(
  () => props.modelValue,
  (newVal: string) => {
    if (newVal !== date.value) {
      date.value = newVal;
    }
  },
);
</script>

<style></style>
