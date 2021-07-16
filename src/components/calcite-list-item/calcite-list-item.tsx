import { Component, Element, Prop, h, VNode, Host } from "@stencil/core";
import { SLOTS, CSS } from "./resources";
import { getSlotted } from "../../utils/dom";

/**
 * @slot actions-start - A slot for adding actionable `calcite-action` elements before the content of the list item.
 * @slot content-start - A slot for adding non-actionable elements before the label and description of the list item.
 * @slot content-end - A slot for adding non-actionable elements after the label and description of the list item.
 * @slot actions-end - A slot for adding actionable `calcite-action` elements after the content of the list item.
 */
@Component({
  tag: "calcite-list-item",
  styleUrl: "calcite-list-item.scss",
  shadow: true
})
export class CalciteListItem {
  // --------------------------------------------------------------------------
  //
  //  Properties
  //
  // --------------------------------------------------------------------------

  /**
   * When true, prevents the content of the list item from user interaction.
   */
  @Prop({ reflect: true }) nonInteractive = false;

  /**
   * An optional description for this item.  This will appear below the label text.
   */
  @Prop() description: string;

  /**
   * When true, disabled prevents interaction.
   */
  @Prop({ reflect: true }) disabled = false;

  /**
   * @todo The label of the list item.
   */
  @Prop() label: string;

  // --------------------------------------------------------------------------
  //
  //  Private Properties
  //
  // --------------------------------------------------------------------------

  @Element() el: HTMLCalciteListItemElement;

  // --------------------------------------------------------------------------
  //
  //  Render Methods
  //
  // --------------------------------------------------------------------------

  renderActionsStart(): VNode {
    const { el } = this;
    return getSlotted(el, SLOTS.actionsStart) ? (
      <div class={CSS.actionsStart}>
        <slot name={SLOTS.actionsStart} />
      </div>
    ) : null;
  }

  renderActionsEnd(): VNode {
    const { el } = this;
    return getSlotted(el, SLOTS.actionsEnd) ? (
      <div class={CSS.actionsEnd}>
        <slot name={SLOTS.actionsEnd} />
      </div>
    ) : null;
  }

  renderContentStart(): VNode {
    const { el } = this;
    return getSlotted(el, SLOTS.contentStart) ? (
      <div class={CSS.contentStart}>
        <slot name={SLOTS.contentStart} />
      </div>
    ) : null;
  }

  renderContentEnd(): VNode {
    const { el } = this;
    return getSlotted(el, SLOTS.contentEnd) ? (
      <div class={CSS.contentEnd}>
        <slot name={SLOTS.contentEnd} />
      </div>
    ) : null;
  }

  renderContent(): VNode {
    const { label, description } = this;

    return !!label || !!description ? (
      <div class={CSS.content}>
        {label ? <div class={CSS.label}>{label}</div> : null}
        {description ? <div class={CSS.description}>{description}</div> : null}
      </div>
    ) : null;
  }

  renderContentContainer(): VNode {
    const { disabled, nonInteractive } = this;

    const content = [this.renderContentStart(), this.renderContent(), this.renderContentEnd()];

    return !nonInteractive ? (
      <button
        class={{ [CSS.contentContainer]: true, [CSS.contentContainerButton]: true }}
        disabled={disabled}
      >
        {content}
      </button>
    ) : (
      <div class={CSS.contentContainer}>{content}</div>
    );
  }

  render(): VNode {
    return (
      <Host role="listitem">
        <div class={CSS.container}>
          {this.renderActionsStart()}
          {this.renderContentContainer()}
          {this.renderActionsEnd()}
        </div>
        <div class={CSS.nestedContainer}>
          <slot />
        </div>
      </Host>
    );
  }
}
