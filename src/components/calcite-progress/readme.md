# calcite-progress

The `calcite-progress` component is used to show progress on some async task to the user.

## TODO

<!-- Auto Generated Below -->

## Usage

### Basic

```html
<calcite-progress type="indeterminate"></calcite-progress>
```

## Properties

| Property   | Attribute  | Description                                                      | Type                               | Default         |
| ---------- | ---------- | ---------------------------------------------------------------- | ---------------------------------- | --------------- |
| `label`    | `label`    | Label for the progress indicator                                 | `string`                           | `undefined`     |
| `reversed` | `reversed` | For indeterminate progress bars, reverse the animation direction | `boolean`                          | `false`         |
| `text`     | `text`     | Text to display for the progress indicator                       | `string`                           | `undefined`     |
| `type`     | `type`     | Use indeterminate if finding actual progress value is impossible | `"determinate" \| "indeterminate"` | `"determinate"` |
| `value`    | `value`    | Fraction completed, in the range of 0 - 1.0                      | `number`                           | `0`             |

## Dependencies

### Used by

- [calcite-input](../calcite-input)

### Graph

```mermaid
graph TD;
  calcite-input --> calcite-progress
  style calcite-progress fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
