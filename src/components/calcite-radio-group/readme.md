# calcite-radio-group

<!-- Auto Generated Below -->

## Properties

| Property       | Attribute       | Description                                                         | Type                                   | Default        |
| -------------- | --------------- | ------------------------------------------------------------------- | -------------------------------------- | -------------- |
| `appearance`   | `appearance`    | specify the appearance style of the radio group, defaults to solid. | `"outline" \| "solid"`                 | `"solid"`      |
| `disabled`     | `disabled`      | is the radio group disabled                                         | `boolean`                              | `undefined`    |
| `layout`       | `layout`        | specify the layout of the radio group, defaults to horizontal       | `"grid" \| "horizontal" \| "vertical"` | `"horizontal"` |
| `name`         | `name`          | The group's name. Gets submitted with the form.                     | `string`                               | `undefined`    |
| `scale`        | `scale`         | The scale of the radio group                                        | `"l" \| "m" \| "s"`                    | `"m"`          |
| `selectedItem` | --           | The group's selected item.                                          | `HTMLCalciteRadioGroupItemElement`     | `undefined`    |
| `width`        | `width`         | specify the width of the group, defaults to auto                    | `"auto" \| "full"`                     | `"auto"`       |

## Events

| Event                     | Description                                                           | Type                  |
| ------------------------- | --------------------------------------------------------------------- | --------------------- |
| `calciteRadioGroupChange` | Fired when the selected option changes, event detail is the new value | `CustomEvent<string>` |

## Methods

### `setFocus() => Promise<void>`

Focuses the selected item. If there is no selection, it focuses the first item.

#### Returns

Type: `Promise<void>`

---

_Built with [StencilJS](https://stenciljs.com/)_
