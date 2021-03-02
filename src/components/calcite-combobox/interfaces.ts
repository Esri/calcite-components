export interface listItem {
  label: string;
  value: string;
}

export type ComboboxSelectionMode = "single" | "multi";

export type ComboboxAncestorElement = HTMLCalciteComboboxItemElement | HTMLCalciteComboboxItemGroupElement;
