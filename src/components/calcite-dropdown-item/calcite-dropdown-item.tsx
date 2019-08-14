import {
  Component,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Listen,
  Prop,
  State
} from "@stencil/core";
import {
  UP,
  DOWN,
  TAB,
  ENTER,
  ESCAPE,
  HOME,
  END,
  SPACE
} from "../../utils/keys";
import { getElementDir, getElementTheme, getElementProp } from "../../utils/dom";
import { guid } from "../../utils/guid";
import DropdownInterface from "../../interfaces/DropdownInterface";

@Component({
  tag: "calcite-dropdown-item",
  styleUrl: "calcite-dropdown-item.scss",
  shadow: true
})
export class CalciteDropdownItem {
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------

  @Element() el: HTMLElement;

  //--------------------------------------------------------------------------
  //
  //  Public Properties
  //
  //--------------------------------------------------------------------------

  @Prop({ reflect: true, mutable: true }) active: boolean = false;

  /** @internal */
  @Prop() requestedDropdownGroup: string = "";

  /** @internal */
  @Prop() requestedDropdownItem: string = "";

  //--------------------------------------------------------------------------
  //
  //  Events
  //
  //--------------------------------------------------------------------------

  @Event() calciteDropdownItemSelected: EventEmitter;
  @Event() calciteDropdownItemKeyEvent: EventEmitter;
  @Event() closeCalciteDropdown: EventEmitter;
  @Event() registerCalciteDropdownItem: EventEmitter;

  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------

  componentDidLoad() {
    this.currentDropdownGroup = this.el.parentElement.id;
    this.itemPosition = this.getItemPosition();

    this.registerCalciteDropdownItem.emit({
      item: this.el,
      position: this.itemPosition
    });
  }

  componentDidUpdate() {
    this.determineActiveItem();
  }

  render() {
    const dir = getElementDir(this.el);
    const theme = getElementTheme(this.el);
    const scale = getElementProp(this.el, "scale", "m");
    const selected = this.active ? "true" : null;
    return (
      <Host
        theme={theme}
        dir={dir}
        scale={scale}
        id={this.dropdownItemId}
        tabindex="0"
        role="menuitem"
        aria-selected={selected}
      >
        <slot />
      </Host>
    );
  }

  //--------------------------------------------------------------------------
  //
  //  Event Listeners
  //
  //--------------------------------------------------------------------------

  @Listen("click") onClick(e) {
    this.emitRequestedItem(e);
  }

  @Listen("keydown") keyDownHandler(e) {
    switch (e.keyCode) {
      case SPACE:
      case ENTER:
        this.emitRequestedItem(e);
        break;
      case ESCAPE:
        this.closeCalciteDropdown.emit();
        break;
      case TAB:
      case UP:
      case DOWN:
      case HOME:
      case END:
        this.calciteDropdownItemKeyEvent.emit({ item: e });
        break;
    }
  }

  //--------------------------------------------------------------------------
  //
  //  Private State/Props
  //
  //--------------------------------------------------------------------------

  /** unique id for dropdown item */
  /** @internal */
  private dropdownItemId = `calcite-dropdown-item-${guid()}`;

  /** position withing group */
  /** @internal */
  @State() private itemPosition: number;

  /** id of containing group */
  /** @internal */
  @State() private currentDropdownGroup: string = this.el.parentElement.id;

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  private determineActiveItem() {
    if (this.requestedDropdownItem === this.dropdownItemId) {
      this.active = true;
    } else if (this.requestedDropdownGroup === this.currentDropdownGroup) {
      this.active = false;
    }
  }

  private emitRequestedItem(e) {
    this.calciteDropdownItemSelected.emit({
      requestedDropdownItem: e.target.id,
      requestedDropdownGroup: e.target.parentElement.id
    });
    this.closeCalciteDropdown.emit();
  }

  private getItemPosition() {
    return Array.prototype.indexOf.call(
      this.el.parentElement.querySelectorAll("calcite-dropdown-item"),
      this.el
    );
  }
}

//--------------------------------------------------------------------------
//
//  Inject Props
//
//--------------------------------------------------------------------------

DropdownInterface.injectProps(CalciteDropdownItem, [
  "requestedDropdownItem",
  "requestedDropdownGroup"
]);
