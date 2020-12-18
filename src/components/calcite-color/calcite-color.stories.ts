import { boolean, select, text } from "@storybook/addon-knobs";
import { Attributes, createComponentHTML as create, darkBackground } from "../../../.storybook/utils";
import colorReadme from "./readme.md";
import swatchReadme from "../calcite-color-swatch/readme.md";
import hexInputReadme from "../calcite-color-hex-input/readme.md";
import { ATTRIBUTES } from "../../../.storybook/resources";

export default {
  title: "Components/Color",
  parameters: {
    backgrounds: darkBackground,
    notes: {
      color: colorReadme,
      swatch: swatchReadme,
      hexInput: hexInputReadme
    }
  }
};

const createColorAttributes: () => Attributes = () => {
  const { dir, scale } = ATTRIBUTES;

  return [
    {
      name: "dir",
      value: select("dir", dir.values, dir.defaultValue)
    },
    {
      name: "hide-channels",
      value: boolean("hide-channels", false)
    },
    {
      name: "hide-hex",
      value: boolean("hide-hex", false)
    },
    {
      name: "hide-saved",
      value: boolean("hide-saved", false)
    },
    {
      name: "scale",
      value: select("scale", scale.values, scale.defaultValue)
    }
  ];
};

export const simple = (): string =>
  create("calcite-color", [
    ...createColorAttributes(),
    {
      name: "value",
      value: text("value", "#b33f33")
    }
  ]);

export const dark = (): string =>
  create("calcite-color", [
    ...createColorAttributes(),
    { name: "theme", value: "dark" },
    {
      name: "value",
      value: text("value", "#b33f33")
    }
  ]);

export const allowingEmpty = (): string =>
  create("calcite-color", [
    ...createColorAttributes(),
    { name: "allow-empty", value: true },
    { name: "value", value: text("value", "") }
  ]);
