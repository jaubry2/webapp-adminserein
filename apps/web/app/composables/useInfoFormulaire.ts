import type { infoFormulaire } from "~/types";


export function getValue(infoForm: infoFormulaire, key: string): string {
  const primary_value = infoForm?.[key];
  if (!primary_value) {
    return "";
  }
  const secondary_keys = Object.keys(primary_value);
  if (secondary_keys.length === 0) {
    return "";
  }
  return secondary_keys[0];
}

export function getListFieldForm(
  infoForm: infoFormulaire,
  key: string
): string[] {
  const primary_value = infoForm?.[key];
  if (!primary_value) {
    return [];
  }
  const secondary_keys = Object.keys(primary_value);
  if (secondary_keys.length === 0) {
    return [];
  }
  const secondary_value = primary_value[secondary_keys[0]];
  return secondary_value ?? [];
}

export function modifyValue(_key: string, _newValue: string, fields: infoFormulaire) {
  const value = getValue(fields, _key);
  const primary_value = fields[_key];
  const fields_list = primary_value[value];
  delete fields[_key][value];
  fields[_key][_newValue] = fields_list;
}