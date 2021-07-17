import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Listen,
  Method,
  Prop,
  VNode
} from "@stencil/core";
import { ICON_TYPES } from "../calcite-pick-list/resources";
import { guid } from "../../utils/guid";
import { CSS } from "../calcite-pick-list-item/resources";
import { ICONS, SLOTS } from "./resources";
import { SLOTS as PICK_LIST_SLOTS } from "../calcite-pick-list-item/resources";
import { getSlotted } from "../../utils/dom";

/**
 * @slot actions-end - A slot for adding actions or content to the end side of the item.
 * @slot actions-start - A slot for adding actions or content to the start side of the item.
 */
@Component({
  tag: "calcite-value-list-item",
  styleUrl: "./calcite-value-list-item.scss",
  shadow: true
})
export class CalciteValueListItem {
  // --------------------------------------------------------------------------
  //
  //  Properties
  //
  // --------------------------------------------------------------------------

  /**
   * An optional description for this item. Will appear below the label text.
   */
  @Prop({ reflect: true }) description?: string;

  /**
   * When true, the item cannot be clicked and is visually muted
   */
  @Prop({ reflect: true }) disabled? = false;

  /**
   * @internal When false, the item cannot be deselected by user interaction.
   */
  @Prop() disableDeselect = false;
  
  /**
   * @internal When true, the item cannot be selected by user interaction.
   */
  @Prop({ reflect: true }) disableSelect = false;

  /**
   * @internal - stores the activated state of the drag handle.
   */
  @Prop({ mutable: true }) handleActivated? = false;

  /**
   * Determines the icon SVG symbol that will be shown. Options are circle, square, grip or null.
   * @see [ICON_TYPES](https://github.com/Esri/calcite-components/blob/master/src/components/calcite-pick-list/resources.ts#L5)
   */
  @Prop({ reflect: true }) icon?: ICON_TYPES | null = null;

  /**
   * The main label for this item. Appears next to the icon.
   */
  @Prop({ reflect: true }) label!: string;

  /**
   * Used to provide additional metadata to an item, primarily used when the parent list has a filter.
   */
  @Prop() metadata?: Record<string, unknown>;

  /**
   * Set this to true to display a remove action that removes the item from the list.
   */
  @Prop({ reflect: true }) removable = false;

  /**
   * Set this to true to pre-select an item. Toggles when an item is checked/unchecked.
   */
  @Prop({ reflect: true, mutable: true }) selected = false;

  /**
   * The item's associated value.
   */
  @Prop() value!: any;

  // --------------------------------------------------------------------------
  //
  //  Private Properties
  //
  // --------------------------------------------------------------------------

  @Element() el: HTMLCalciteValueListItemElement;

  pickListItem: HTMLCalcitePickListItemElement = null;

  guid = `calcite-value-list-item-${guid()}`;

  // --------------------------------------------------------------------------
  //
  //  Public Methods
  //
  // --------------------------------------------------------------------------

  @Method()
  async toggleSelected(coerce?: boolean): Promise<void> {
    this.pickListItem.toggleSelected(coerce);
  }

  @Method()
  async setFocus(): Promise<void> {
    this.pickListItem?.setFocus();
  }

  // --------------------------------------------------------------------------
  //
  //  Events
  //
  // --------------------------------------------------------------------------

  /**
   * Emitted whenever the remove button is pressed.
   */
  @Event() calciteListItemRemove: EventEmitter<void>; // wrapped pick-list-item emits this

  @Listen("calciteListItemChange")
  calciteListItemChangeHandler(event: CustomEvent): void {
    // adjust item payload from wrapped item before bubbling
    event.detail.item = this.el;
  }

  // --------------------------------------------------------------------------
  //
  //  Private Methods
  //
  // --------------------------------------------------------------------------

  getPickListRef = (el: HTMLCalcitePickListItemElement): HTMLCalcitePickListItemElement =>
    (this.pickListItem = el);

  handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === " ") {
      this.handleActivated = !this.handleActivated;
    }
  };

  handleBlur = (): void => {
    this.handleActivated = false;
  };

  handleSelectChange = (event: CustomEvent): void => {
    this.selected = event.detail.selected;
  };

  // --------------------------------------------------------------------------
  //
  //  Render Methods
  //
  // --------------------------------------------------------------------------

  renderActionsEnd(): VNode {
    const { el } = this;
    const hasActionsEnd = getSlotted(el, SLOTS.actionsEnd);

    return hasActionsEnd ? (
      <slot name={SLOTS.actionsEnd} slot={PICK_LIST_SLOTS.actionsEnd} />
    ) : null;
  }

  renderActionsStart(): VNode {
    const { el } = this;
    const hasActionsStart = getSlotted(el, SLOTS.actionsStart);

    return hasActionsStart ? (
      <slot name={SLOTS.actionsStart} slot={PICK_LIST_SLOTS.actionsStart} />
    ) : null;
  }

  renderHandle(): VNode {
    const { icon } = this;
    if (icon === ICON_TYPES.grip) {
      return (
        <span
          aria-pressed={this.handleActivated.toString()}
          class={{
            [CSS.handle]: true,
            [CSS.handleActivated]: this.handleActivated
          }}
          data-js-handle
          onBlur={this.handleBlur}
          onKeyDown={this.handleKeyDown}
          role="button"
          tabindex="0"
        >
          <calcite-icon icon={ICONS.drag} scale="s" />
        </span>
      );
    }
  }

  render(): VNode {
    return (
      <Host id={this.el.id || this.guid}>
        {this.renderHandle()}
        <calcite-pick-list-item
          description={this.description}
          disableDeselect={this.disableDeselect}
          disableSelect={this.disableSelect}
          disabled={this.disabled}
          label={this.label}
          metadata={this.metadata}
          onCalciteListItemChange={this.handleSelectChange}
          ref={this.getPickListRef}
          removable={this.removable}
          selected={this.selected}
          value={this.value}
        >
          {this.renderActionsStart()}
          {this.renderActionsEnd()}
        </calcite-pick-list-item>
      </Host>
    );
  }
}
