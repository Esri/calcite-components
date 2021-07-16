# Calcite global styles

When building any component in calcite-components or [calcite-components](https://github.com/esri/calcite-components), please use these set of global variables (CSS variables and Sass mixins or variables)

## From calcite-components

### Color

[`_colors.scss`](https://github.com/Esri/calcite-components/blob/master/src/assets/styles/_colors.scss): you'll find the global CSS variables for both light and dark theme.

## From [calcite-base](https://github.com/esri/calcite-base)

### Typography

[typography mixins from calcite-base](https://github.com/Esri/calcite-base/blob/master/dist/_type.scss)

#### Font family

Avenir Next is the main font family in use.
For text indicating or related to code, use this CSS variable:

```
font-family: --calcite-code-family;
```

#### Font size

Here are the most common use cases font-size (Sass):

```
@include font-size(1)
@include font-size(0)
@include font-size(-1)
@include font-size(-2)
@include font-size(-3)
```

The entire range is from font-size -3 to 8.

Example:

`font-size: @include font-size(-2)`

CSS ouput:

```
.font-size--2 {
  font-size: 0.875rem;
  line-height: 1.5;
}
```

#### Font weight

Two font weights are available using CSS vars.

| Weight                       | Value |
| ---------------------------- | ----- |
| --calcite-font-weight-light  | 300   |
| --calcite-font-weight-normal | 400   |
| --calcite-font-weight-medium | 500   |
| --calcite-font-weight-bold   | 700   |

Example:

```
font-weight: var(--calcite-font-weight-normal);
```

### Shadows

The shadow of an element usually corresponds to the priority or importance of the message or workflow. Consistently using shadow for elements like alerts, modals, page takeovers, and sheets provides users clear and familiar indications of importance.

#### CSS variables for shadows

```
--shadow-1
--shadow-1-hover
--shadow-1-press
--shadow-2
--shadow-2-hover
--shadow-2-press
```

Current usage:

| Shadow 1 | Shadow 2    |
| -------- | ----------- |
| Notice   | Modals      |
|          | Alerts      |
|          | Tooltips    |
|          | Dropdowns   |
|          | Popovers    |
|          | FAB         |
|          | Date-picker |

### Focus states

All focuses-able elements should use the custom focus. Use a combination of two mixins to achieve this.

Include the base focus mixin to the elements style block.

```
.my-element-class {
  @include focus-style-base();
}

```

And also add the focus style mixin to the `:focus` block. There is an inset style and an outset style.

Inset focus style

```
.my-element-class:focus {
  @include focus-style-inset(var(--calcite-ui-brand));
}
```

Outset focus style

```
.my-element-class:focus {
  @include focus-style-outset();
}
```
