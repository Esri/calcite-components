import { Component, Host, Prop, h, VNode, Element } from "@stencil/core";
import { CSS } from "./resources";
import { getAncestors } from "../calcite-combobox/utils";
import { guid } from "../../utils/guid";
import { ComboboxAncestorElement } from "../calcite-combobox/interfaces";

@Component({
  tag: "calcite-combobox-item-group",
  styleUrl: "./calcite-combobox-item-group.scss",
  shadow: true
})
export class CalciteComboboxItemGroup {
  // --------------------------------------------------------------------------
  //
  //  Properties
  //
  // --------------------------------------------------------------------------

  /** Parent and grandparent combobox items, this is set internally for use from combobox */
  @Prop({ mutable: true }) anscestors: ComboboxAncestorElement[];

  /** Title of the group */
  @Prop() label!: string;

  // --------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  // --------------------------------------------------------------------------

  componentWillLoad(): void {
    this.anscestors = getAncestors(this.el);
  }

  // --------------------------------------------------------------------------
  //
  //  Private Properties
  //
  // --------------------------------------------------------------------------

  @Element() el: HTMLCalciteComboboxItemGroupElement;

  /** Unique identifier, used for accessibility */
  guid: string = guid();

  // --------------------------------------------------------------------------
  //
  //  Render Methods
  //
  // --------------------------------------------------------------------------

  render(): VNode {
    return (
      <Host>
        <ul aria-labelledby={this.guid} role="group">
          <li id={this.guid} role="presentation">
            <span class={CSS.label}>{this.label}</span>
          </li>
          <slot />
        </ul>
      </Host>
    );
  }
}
