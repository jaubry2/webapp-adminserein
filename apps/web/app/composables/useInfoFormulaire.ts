import type { infoFormulaire } from "~/types";


export function getValue(infoForm: infoFormulaire, key: string): string {
  const primary_value = infoForm[key];
  const secondary_key = Object.keys(primary_value)[0];
  return secondary_key;
}

export function getListFieldForm(
  infoForm: infoFormulaire,
  key: string
): string[] {
  const primary_value = infoForm[key];
  const secondary_key = Object.keys(primary_value)[0];
  const secondary_value = primary_value[secondary_key];
  return secondary_value;
}

export function modifyValue(_key: string, _newValue: string, fields: infoFormulaire) {
  const value = getValue(fields, _key);
  const primary_value = fields[_key];
  const fields_list = primary_value[value];
  delete fields[_key][value];
  fields[_key][_newValue] = fields_list;
}