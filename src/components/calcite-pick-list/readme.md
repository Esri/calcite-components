# calcite-pick-list

`calcite-pick-list` lives in a panel and contains `calcite-pick-list-item`s. Each item is able to be be selected via radio button or checkboxes (which have a multiselect and shift-click capability). There is also an option for a filter at the top of the list for searching.

<!-- Auto Generated Below -->

## Usage

### Basic

Renders a basic pick list with radio buttons on the left and actions on the right side.

```html
<calcite-pick-list>
  <calcite-pick-list-item label="T. Rex" description="Arm strength impaired" value="trex">
    <calcite-action slot="actions-end" icon="circle"></calcite-action>
  </calcite-pick-list-item>
  <calcite-pick-list-item label="Triceratops" description="3 horn" value="triceratops" selected>
    <calcite-action slot="actions-end" icon="circle"></calcite-action>
  </calcite-pick-list-item>
  <calcite-pick-list-item label="Velociraptor" description="Swift seizer" value="velociraptor">
    <calcite-action slot="actions-end" icon="circle"></calcite-action>
  </calcite-pick-list-item>
</calcite-pick-list>
```

#### Multi-select & filter-enabled

Renders a pick list with a sticky filter and checkboxes for multiple selection of items.

```html
<calcite-pick-list multiple filter-enabled>
  <calcite-pick-list-item label="Chocolate" value="chocolate">
    <calcite-action slot="actions-end" icon="ellipsis-circle"></calcite-action>
  </calcite-pick-list-item>
  <calcite-pick-list-item label="Vanilla" description="Oldie but goodie" value="vanilla">
    <calcite-action slot="actions-end" icon="ellipsis-circle"></calcite-action>
  </calcite-pick-list-item>
  <calcite-pick-list-item label="Strawberry" description="no metadata on this one" value="strawberry">
    <calcite-action slot="actions-end" icon="ellipsis-circle"></calcite-action>
  </calcite-pick-list-item>
</calcite-pick-list>
```

#### Sub groups

Renders groups of pick list items that are visually separated.

```html
<calcite-pick-list>
  <calcite-pick-list-group group-title="numbers">
    <calcite-pick-list-item heading="one" description="fish" value="one" icon="grip">
      <calcite-action slot="actions-end" icon="ellipsis"></calcite-action>
    </calcite-pick-list-item>
    <calcite-pick-list-item heading="two" description="fish" value="two" icon="grip">
      <calcite-action slot="actions-end" icon="ellipsis"></calcite-action>
    </calcite-pick-list-item>
  </calcite-pick-list-group>
  <calcite-pick-list-group group-title="colors">
    <calcite-pick-list-item heading="red" description="fish" value="red" icon="grip">
      <calcite-action slot="actions-end" icon="ellipsis"></calcite-action>
    </calcite-pick-list-item>
    <calcite-pick-list-item heading="blue" description="fish" value="blue" icon="grip">
      <calcite-action slot="actions-end" icon="ellipsis"></calcite-action>
    </calcite-pick-list-item>
  </calcite-pick-list-group>
</calcite-pick-list>
```

## Properties

| Property                | Attribute                 | Description                                                                                                                                                                                                                                       | Type                         | Default     |
| ----------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----------- |
| `disabled`              | `disabled`                | When true, disabled prevents interaction. This state shows items with lower opacity/grayed.                                                                                                                                                       | `boolean`                    | `false`     |
| `filterEnabled`         | `filter-enabled`          | When true, an input appears at the top of the list that can be used by end users to filter items in the list.                                                                                                                                     | `boolean`                    | `false`     |
| `filterPlaceholder`     | `filter-placeholder`      | Placeholder text for the filter input field.                                                                                                                                                                                                      | `string`                     | `undefined` |
| `headingLevel`          | `heading-level`           | Number at which section headings should start for this component.                                                                                                                                                                                 | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `undefined` |
| `loading`               | `loading`                 | When true, content is waiting to be loaded. This state shows a busy indicator.                                                                                                                                                                    | `boolean`                    | `false`     |
| `multiple`              | `multiple`                | Multiple works similar to standard radio buttons and checkboxes. When true, a user can select multiple items at a time. When false, only a single item can be selected at a time and selecting a new item will deselect any other selected items. | `boolean`                    | `false`     |
| `selectionFollowsFocus` | `selection-follows-focus` | When true and single-selection is enabled, the selection will change when navigating items via the keyboard.                                                                                                                                      | `boolean`                    | `false`     |

## Events

| Event               | Description                                           | Type               |
| ------------------- | ----------------------------------------------------- | ------------------ |
| `calciteListChange` | Emitted when any of the item selections have changed. | `CustomEvent<any>` |

## Methods

### `getSelectedItems() => Promise<Map<string, HTMLCalcitePickListItemElement>>`

#### Returns

Type: `Promise<Map<string, HTMLCalcitePickListItemElement>>`

### `setFocus(focusId?: ListFocusId) => Promise<void>`

#### Returns

Type: `Promise<void>`

## Slots

| Slot             | Description                                                                                                                        |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
|                  | A slot for adding `calcite-pick-list-item` elements or `calcite-pick-list-group` elements. Items are displayed as a vertical list. |
| `"menu-actions"` | A slot for adding a button + menu combo for performing actions like sorting.                                                       |

## Dependencies

### Depends on

- [calcite-filter](../calcite-filter)
- [calcite-scrim](../calcite-scrim)

### Graph

```mermaid
graph TD;
  calcite-pick-list --> calcite-filter
  calcite-pick-list --> calcite-scrim
  calcite-filter --> calcite-scrim
  calcite-filter --> calcite-icon
  calcite-scrim --> calcite-loader
  style calcite-pick-list fill:#f9f,stroke:#333,stroke-width:4px
```

---

_Built with [StencilJS](https://stenciljs.com/)_
