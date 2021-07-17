import {
  Component,
  Element,
  Event,
  EventEmitter,
  Fragment,
  h,
  Method,
  Prop,
  VNode,
  Watch
} from "@stencil/core";
import { CSS, ICONS, SLOTS, TEXT } from "./resources";
import { ICON_TYPES } from "../calcite-pick-list/resources";
import { getSlotted } from "../../utils/dom";

/**
 * @slot actions-end - a slot for adding actions or content to the end side of the item.
 * @slot actions-start - a slot for adding actions or content to the start side of the item.
 */
@Component({
  tag: "calcite-pick-list-item",
  styleUrl: "./calcite-pick-list-item.scss",
  shadow: true
})
export class CalcitePickListItem {
  // --------------------------------------------------------------------------
  //
  //  Properties
  //
  // --------------------------------------------------------------------------

  /**
   * An optional description for this item.  This will appear below the label text.
   */
  @Prop({ reflect: true }) description?: string;

  @Watch("description")
  descriptionWatchHandler(): void {
    this.calciteListItemPropsChange.emit();
  }

  /**
   * When true, the item cannot be clicked and is visually muted.
   */
  @Prop({ reflect: true }) disabled? = false;

  /**
   * When false, the item cannot be deselected by user interaction.
   */
  @Prop() disableDeselect = false;
  
  /**
   * When true, the item cannot be selected by user interaction.
   */
  @Prop({ reflect: true }) disableSelect = false;

  /**
   * Determines the icon SVG symbol that will be shown. Options are circle, square, grip or null.
   * @see [ICON_TYPES](https://github.com/Esri/calcite-components/blob/master/src/components/calcite-pick-list/resources.ts#L5)
   */
  @Prop({ reflect: true }) icon?: ICON_TYPES | null = null;

  /**
   * The main label for this item. This will appear next to the icon.
   */
  @Prop({ reflect: true }) label: string;

  @Watch("label")
  labelWatchHandler(): void {
    this.calciteListItemPropsChange.emit();
  }

  /**
   * Used to provide additional metadata to an item, primarily used when the parent list has a filter.
   */
  @Prop() metadata?: Record<string, unknown>;

  @Watch("metadata")
  metadataWatchHandler(): void {
    this.calciteListItemPropsChange.emit();
  }

  /**
   * Set this to true to display a remove action that removes the item from the list.
   */
  @Prop({ reflect: true }) removable? = false;

  /**
   * Set this to true to pre-select an item. Toggles when an item is checked/unchecked.
   */
  @Prop({ reflect: true, mutable: true }) selected = false;

  @Watch("selected")
  selectedWatchHandler(): void {
    this.calciteListItemChange.emit({
      item: this.el,
      value: this.value,
      selected: this.selected,
      shiftPressed: this.shiftPressed
    });

    this.shiftPressed = false;
  }

  /**
   * The text for the remove item buttons. Only applicable if removable is true.
   * @default "remove"
   */
  @Prop({ reflect: true }) intlRemove = TEXT.remove;

  /**
   * The item's associated value.
   */
  @Prop() value!: any;

  @Watch("value")
  valueWatchHandler(newValue: any, oldValue: any): void {
    this.calciteListItemValueChange.emit({ oldValue, newValue });
  }

  // --------------------------------------------------------------------------
  //
  //  Private Properties
  //
  // --------------------------------------------------------------------------

  @Element() el: HTMLCalcitePickListItemElement;

  private focusEl: HTMLLabelElement;

  shiftPressed: boolean;

  // --------------------------------------------------------------------------
  //
  //  Events
  //
  // --------------------------------------------------------------------------

  /**
   * Emitted whenever the item is selected or unselected.
   */
  @Event() calciteListItemChange: EventEmitter<{
    item: HTMLCalcitePickListItemElement;
    value: any;
    selected: boolean;
    shiftPressed: boolean;
  }>;

  /**
   * Emitted whenever the remove button is pressed.
   */
  @Event() calciteListItemRemove: EventEmitter<void>;

  /**
   * Emitted whenever the the item's label, description, value or metadata properties are modified.
   * @internal
   */
  @Event() calciteListItemPropsChange: EventEmitter<void>;

  /**
   * Emitted whenever the the item's value property is modified.
   * @internal
   */
  @Event() calciteListItemValueChange: EventEmitter<{
    oldValue: any;
    newValue: any;
  }>;

  // --------------------------------------------------------------------------
  //
  //  Public Methods
  //
  // --------------------------------------------------------------------------

  /**
   * Used to toggle the selection state. By default this won't trigger an event.
   * The first argument allows the value to be coerced, rather than swapping values.
   */
  @Method()
  async toggleSelected(coerce?: boolean): Promise<void> {
    if (this.disabled) {
      return;
    }

    this.selected = typeof coerce === "boolean" ? coerce : !this.selected;
  }

  @Method()
  async setFocus(): Promise<void> {
    this.focusEl?.focus();
  }

  // --------------------------------------------------------------------------
  //
  //  Private Methods
  //
  // --------------------------------------------------------------------------

  pickListClickHandler = (event: MouseEvent): void => {
    if (this.disabled || (this.disableDeselect && this.selected) || this.disableSelect) {
      return;
    }

    this.shiftPressed = event.shiftKey;
    this.selected = !this.selected;
  };

  pickListKeyDownHandler = (event: KeyboardEvent): void => {
    if (event.key === " ") {
      event.preventDefault();
      if (this.disableDeselect && this.selected || this.disableSelect) {
        return;
      }
      this.selected = !this.selected;
    }
  };

  removeClickHandler = (): void => {
    this.calciteListItemRemove.emit();
  };

  // --------------------------------------------------------------------------
  //
  //  Render Methods
  //
  // --------------------------------------------------------------------------

  renderIcon(): VNode {
    const { icon } = this;

    if (!icon) {
      return null;
    }

    return (
      <span
        class={{
          [CSS.icon]: true,
          [CSS.iconDot]: icon === ICON_TYPES.circle
        }}
        onClick={this.pickListClickHandler}
      >
        {icon === ICON_TYPES.square ? <calcite-icon icon={ICONS.checked} scale="s" /> : null}
      </span>
    );
  }

  renderRemoveAction(): VNode {
    return this.removable ? (
      <calcite-action
        class={CSS.remove}
        icon={ICONS.remove}
        onCalciteActionClick={this.removeClickHandler}
        slot={SLOTS.actionsEnd}
        text={this.intlRemove}
      />
    ) : null;
  }

  renderActionsStart(): VNode {
    const { el } = this;
    const hasActionsStart = getSlotted(el, SLOTS.actionsStart);

    return hasActionsStart ? (
      <div class={{ [CSS.actions]: true, [CSS.actionsStart]: true }}>
        <slot name={SLOTS.actionsStart} />
      </div>
    ) : null;
  }

  renderActionsEnd(): VNode {
    const { el, removable } = this;
    const hasActionsEnd = getSlotted(el, SLOTS.actionsEnd);

    return hasActionsEnd || removable ? (
      <div class={{ [CSS.actions]: true, [CSS.actionsEnd]: true }}>
        <slot name={SLOTS.actionsEnd} />
        {this.renderRemoveAction()}
      </div>
    ) : null;
  }

  render(): VNode {
    const { description, label } = this;

    return (
      <Fragment>
        {this.renderIcon()}
        {this.renderActionsStart()}
        <label
          aria-label={label}
          class={CSS.label}
          onClick={this.pickListClickHandler}
          onKeyDown={this.pickListKeyDownHandler}
          ref={(focusEl): HTMLLabelElement => (this.focusEl = focusEl)}
          tabIndex={0}
        >
          <div
            aria-checked={this.selected.toString()}
            class={CSS.textContainer}
            role="menuitemcheckbox"
          >
            <span class={CSS.title}>{label}</span>
            {description ? <span class={CSS.description}>{description}</span> : null}
          </div>
        </label>
        {this.renderActionsEnd()}
      </Fragment>
    );
  }
}
