<template>
  <div class="relative font-poppins">
    <textarea
      id="name"
      placeholder=""
      class="h-[200px] peer block w-full border secondary--border--color px-3 pt-5 pb-2 focus:ring-2 focus:ring-[var(--secondary-color)] hover:shadow-lg focus:outline-none"
      @input="emit('updateValue', $event.target?.value)"
    />
    <label
      for="name"
      class="absolute left-3 top-2 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:secondary--text--color peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-500 peer-focus:text-xs"
    >
      {{ props.placeholder }}
    </label>
  </div>
</template>

<script lang="ts" setup>
/*******************************************************************************************************************/
/* IMPORTS */
/*******************************************************************************************************************/
import { defineProps, defineEmits } from "vue";
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
});
const emit = defineEmits(["updateValue"]);
</script>

<style></style>
