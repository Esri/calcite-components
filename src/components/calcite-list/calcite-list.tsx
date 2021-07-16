import { Component, h, VNode, Host, Prop } from "@stencil/core";
import { CSS } from "./resources";
import { HeadingLevel } from "../functional/CalciteHeading";

/**
 * A general purpose list that enables users to construct list items that conform to Calcite styling.
 * @slot - A slot for adding `calcite-list-item` elements.
 */
@Component({
  tag: "calcite-list",
  styleUrl: "calcite-list.scss",
  shadow: true
})
export class CalciteList {
  // --------------------------------------------------------------------------
  //
  //  Properties
  //
  // --------------------------------------------------------------------------

  /**
   * Number at which section headings should start for this component.
   */
  @Prop() headingLevel: HeadingLevel;

  // --------------------------------------------------------------------------
  //
  //  Render Methods
  //
  // --------------------------------------------------------------------------

  render(): VNode {
    return (
      <Host role="list">
        <div class={CSS.container}>
          <slot />
        </div>
      </Host>
    );
  }
}
