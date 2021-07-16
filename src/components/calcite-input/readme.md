# calcite-input

<!-- Auto Generated Below -->

## Usage

### Basic

```html
<calcite-input value="Entered value" placeholder="My placeholder"></calcite-input>
```

### Clearable

```html
<calcite-label>
  Clearable item
  <calcite-input clearable value="My great name" placeholder="John Doe"></calcite-input>
</calcite-label>
```

### Native-events

You can also listen for native events emitted from `<calcite-input>`.

You must use `focusin`/`focusout` instead of `focus`/`blur` because these events bubble up from the rendered child element rendered inside of `<calcite-input>`

All events return an element and a value:

```js
input.addEventListener("change", logChange);
input.addEventListener("focusin", logFocus);
input.addEventListener("focusout", logBlur);

function logChange() {
  console.log(event.target.element);
  console.log(event.target.value);
}
```

### With-label

Using a wrapping `calcite-label` component lets consumers set the status attribute once and have it propagate to child `calcite-input` and `calcite-input-message` elements

```html
<calcite-label status="invalid">
  Invalid input
  <calcite-input placeholder="Filter your files" value="adfo2h2"></calcite-input>
  <calcite-input-message active icon> Something doesn't look right </calcite-input-message>
</calcite-label>
```

### With-message

```html
<calcite-label>
  My great label
  <calcite-input placeholder="Enter your information"></calcite-input>
  <calcite-input-message icon="3d-glasses" active>
    Here's something you should know about this input
  </calcite-input-message>
</calcite-label>
```

## Properties

| Property           | Attribute            | Description                                                                                                                                                                                                                                  | Type                                                                                                                                                                                   | Default                                   |
| ------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `alignment`        | `alignment`          | specify the alignment of the value of the input                                                                                                                                                                                              | `"end" \| "start"`                                                                                                                                                                     | `"start"`                                 |
| `autofocus`        | `autofocus`          | should the input autofocus                                                                                                                                                                                                                   | `boolean`                                                                                                                                                                              | `false`                                   |
| `clearable`        | `clearable`          | optionally display a clear button that displays when field has a value shows by default for search, time, date will not display for type="textarea"                                                                                          | `boolean`                                                                                                                                                                              | `undefined`                               |
| `disabled`         | `disabled`           | is the input disabled                                                                                                                                                                                                                        | `boolean`                                                                                                                                                                              | `undefined`                               |
| `groupSeparator`   | `group-separator`    | for number values, displays the locale's group separator                                                                                                                                                                                     | `boolean`                                                                                                                                                                              | `false`                                   |
| `icon`             | `icon`               | when used as a boolean set to true, show a default recommended icon for certain input types (tel, password, email, date, time, search). You can also pass a calcite-ui-icon name to this prop to display a requested icon for any input type | `boolean \| string`                                                                                                                                                                    | `undefined`                               |
| `iconFlipRtl`      | `icon-flip-rtl`      | flip the icon in rtl                                                                                                                                                                                                                         | `boolean`                                                                                                                                                                              | `undefined`                               |
| `intlLoading`      | `intl-loading`       | string to override English loading text                                                                                                                                                                                                      | `string`                                                                                                                                                                               | `TEXT.loading`                            |
| `label`            | `label`              | Applies to the aria-label attribute on the button or hyperlink                                                                                                                                                                               | `string`                                                                                                                                                                               | `undefined`                               |
| `loading`          | `loading`            | specify if the input is in loading state                                                                                                                                                                                                     | `boolean`                                                                                                                                                                              | `false`                                   |
| `locale`           | `locale`             | BCP 47 language tag for desired language and country format                                                                                                                                                                                  | `string`                                                                                                                                                                               | `document.documentElement.lang \|\| "en"` |
| `max`              | `max`                | input max                                                                                                                                                                                                                                    | `number`                                                                                                                                                                               | `undefined`                               |
| `maxLength`        | `max-length`         | Maximum length of the input value                                                                                                                                                                                                            | `number`                                                                                                                                                                               | `undefined`                               |
| `maxlength`        | `maxlength`          | <span style="color:red">**[DEPRECATED]**</span> use maxLength instead<br/><br/>Maximum length of text input.                                                                                                                                 | `number`                                                                                                                                                                               | `undefined`                               |
| `min`              | `min`                | input min                                                                                                                                                                                                                                    | `number`                                                                                                                                                                               | `undefined`                               |
| `minLength`        | `min-length`         | Minimum length of the text input                                                                                                                                                                                                             | `number`                                                                                                                                                                               | `undefined`                               |
| `name`             | `name`               | The name of the input                                                                                                                                                                                                                        | `string`                                                                                                                                                                               | `undefined`                               |
| `numberButtonType` | `number-button-type` | specify the placement of the number buttons                                                                                                                                                                                                  | `"horizontal" \| "none" \| "vertical"`                                                                                                                                                 | `"vertical"`                              |
| `placeholder`      | `placeholder`        | explicitly whitelist placeholder attribute                                                                                                                                                                                                   | `string`                                                                                                                                                                               | `undefined`                               |
| `prefixText`       | `prefix-text`        | optionally add prefix                                                                                                                                                                                                                        | `string`                                                                                                                                                                               | `undefined`                               |
| `required`         | `required`           | is the input required                                                                                                                                                                                                                        | `boolean`                                                                                                                                                                              | `false`                                   |
| `scale`            | `scale`              | specify the scale of the input, defaults to m                                                                                                                                                                                                | `"l" \| "m" \| "s"`                                                                                                                                                                    | `"m"`                                     |
| `status`           | `status`             | specify the status of the input field, determines message and icons                                                                                                                                                                          | `"idle" \| "invalid" \| "valid"`                                                                                                                                                       | `"idle"`                                  |
| `step`             | `step`               | input step                                                                                                                                                                                                                                   | `"any" \| number`                                                                                                                                                                      | `undefined`                               |
| `suffixText`       | `suffix-text`        | optionally add suffix \*                                                                                                                                                                                                                     | `string`                                                                                                                                                                               | `undefined`                               |
| `type`             | `type`               | specify the input type Note that the following types add type-specific icons by default: `date`, `email`, `password`, `search`, `tel`, `time`                                                                                                | `"color" \| "date" \| "datetime-local" \| "email" \| "file" \| "image" \| "month" \| "number" \| "password" \| "search" \| "tel" \| "text" \| "textarea" \| "time" \| "url" \| "week"` | `"text"`                                  |
| `value`            | `value`              | input value                                                                                                                                                                                                                                  | `string`                                                                                                                                                                               | `undefined`                               |

## Events

| Event               | Description                                      | Type               |
| ------------------- | ------------------------------------------------ | ------------------ |
| `calciteInputInput` | This event fires each time a new value is typed. | `CustomEvent<any>` |

## Methods

### `setFocus() => Promise<void>`

focus the rendered child element

#### Returns

Type: `Promise<void>`

## Slots

| Slot       | Description                                      |
| ---------- | ------------------------------------------------ |
| `"action"` | A slot for positioning a button next to an input |

## Dependencies

### Used by

- [calcite-color-picker](../calcite-color-picker)
- [calcite-color-picker-hex-input](../calcite-color-picker-hex-input)
- [calcite-input-date-picker](../calcite-input-date-picker)
- [calcite-input-time-picker](../calcite-input-time-picker)

### Depends on

- [calcite-progress](../calcite-progress)
- [calcite-icon](../calcite-icon)

### Graph

```mermaid
graph TD;
  calcite-input --> calcite-progress
  calcite-input --> calcite-icon
  calcite-color-picker --> calcite-input
  calcite-color-picker-hex-input --> calcite-input
  calcite-input-date-picker --> calcite-input
  calcite-input-time-picker --> calcite-input
  style calcite-input fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
