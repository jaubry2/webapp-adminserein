<template>
  <div>
    <div
      :class="[
        'flex justify-start gap-4',
        `${props.col ? 'flex-col' : 'flex-row'}`,
      ]"
    >
      <label class="block secondary--text--color">
        {{ props.question }}
      </label>
      <div :class="['flex gap-6', `${props.col ? 'flex-col pl-6' : 'flex-row'}`]">
        <label
          class="flex items-center gap-2 cursor-pointer"
          v-for="(label, value) in props.options"
          :key="value"
        >
          <input
            type="checkbox"
            :value="value"
            :name="props.question"
            class="form-checkbox text-blue-600 border-gray-300 focus:ring-blue-500"
            :checked="props.modelValue === value"
            @change="onToggle(value, $event)"
          />
          <span class="text-medium text-gray-700">
            {{ label }}
          </span>
        </label>
      </div>
    </div>
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
const props = defineProps({
  question: { type: String, required: true },
  options: { type: Object as () => Record<string, string>, required: true },
  col: { type: Boolean, default: false },
  modelValue: { type: String, default: "" },
});

const emit = defineEmits(["update"]);

function onToggle(value: string, event: Event) {
  const target = event.target as HTMLInputElement;

  if (target.checked) {
    emit("update", value);
  } else {
    emit("update", "");
  }
}
</script>

<style></style>

