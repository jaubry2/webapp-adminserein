<template>
  <UButton
    v-bind="buttonProps"
    :class="computedClass"
    :style="computedStyle"
    @click="onClick"
  >
    <slot />
  </UButton>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    /**
     * Couleur de fond / bordure en CSS (ex: "#a7c7e7", "rgb(167,199,231)").
     */
    color?: string;
    /**
     * Couleur du texte (facultatif).
     */
    textColor?: string;
    /**
     * Variante Nuxt UI (solid, outline, ghost, soft, link).
     */
    variant?: "solid" | "outline" | "ghost" | "soft" | "link";
    /**
     * Taille Nuxt UI (xs, sm, md, lg, xl).
     */
    size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl";
    loading?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    icon?: string;
    /**
     * Classes supplémentaires à ajouter.
     */
    class?: string | string[] | Record<string, boolean>;
  }>(),
  {
    color: "#a7c7e7",
    textColor: "#2e3a45",
    variant: "solid",
    size: "sm",
    loading: false,
    disabled: false,
    type: "button",
    icon: undefined,
    class: "",
  },
);

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const buttonProps = computed(() => ({
  variant: props.variant,
  size: props.size,
  loading: props.loading,
  disabled: props.disabled,
  type: props.type,
  icon: props.icon,
}));

const computedStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.color) {
    style.backgroundColor = props.color;
    style.borderColor = props.color;
  }
  if (props.textColor) {
    style.color = props.textColor;
  }

  return style;
});

const computedClass = computed(() => [
  // On force notre couleur même si Nuxt UI applique la sienne
  "!shadow-none",
  "!ring-0",
  props.variant === "solid" && "hover:opacity-90 focus-visible:opacity-90",
  props.class,
]);

const onClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return;
  emit("click", event);
};
</script>
