<template>
  <div class="relative font-poppins">
    <input
      type="text"
      :id="unique_id"
      placeholder=""
      class="peer block w-full border secondary--border--color px-3 pt-5 pb-2 focus:ring-2 focus:ring-[var(--secondary-color)] hover:shadow-lg focus:outline-none"
      :value="valeur"
      @input="emit('updateValue', $event.target?.value)"
    />
    <label
      :for="unique_id"
      class="absolute left-3 top-2 text-sm transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:secondary--text--color peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-gray-500 peer-focus:text-xs"
    >
      {{ props.placeholder }} {{ props.mandatory ? "*" : "" }}
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
  value: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["updateValue"]);
/* CONSTANTES */
const uniqueIdSuffix = useId(); // Génère un ID stable SSR
/* VARIABLES CALCULEES */
const unique_id = computed(() => {
  const base = props.placeholder.toLowerCase().replace(/\s/g, "-");
  return `input-${base}-${uniqueIdSuffix}`;
});
const valeur = ref(props.value);
watch(
  () => props.value,
  (newValue: any) => {
    valeur.value = newValue;
  },
  { immediate: true },
);
/*******************************************************************************************************************/
/* METHODES */
/*******************************************************************************************************************/
</script>

<style></style>
