import {
  Component,
  h,
  Host,
  Prop,
  State,
  Listen,
  Event,
  EventEmitter,
  Element,
  VNode,
  Build,
  Method,
  Watch
} from "@stencil/core";
import { filter } from "../../utils/filter";
import { getElementDir } from "../../utils/dom";
import { debounce } from "lodash-es";
import { getKey } from "../../utils/key";
import { createPopper, updatePopper, CSS as PopperCSS } from "../../utils/popper";
import { StrictModifiers, Instance as Popper } from "@popperjs/core";
import { guid } from "../../utils/guid";

const COMBO_BOX_ITEM = "calcite-combobox-item";

const DEFAULT_PLACEMENT = "bottom-start";

interface ItemData {
  label: string;
  value: string;
}

export interface SelectedComboboxOption {
  value: string;
  textLabel: string;
  guid: string;
  selected: boolean;
  custom?: boolean;
}

@Component({
  tag: "calcite-combobox",
  styleUrl: "calcite-combobox.scss",
  shadow: true
})
export class CalciteCombobox {
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------
  @Element() el: HTMLCalciteComboboxElement;

  //--------------------------------------------------------------------------
  //
  //  Public Properties
  //
  //--------------------------------------------------------------------------

  /** Open and close combobox */
  @Prop({ reflect: true }) active = false;

  @Watch("active") activeHandler(): void {
    this.reposition();
  }

  /** Disable combobox input */
  @Prop({ reflect: true }) disabled = false;

  /** Aria label for combobox (required) */
  @Prop() label!: string;

  /** Placeholder text for input */
  @Prop() placeholder?: string;

  /** Specify the maximum number of combobox items (including nested children) to display before showing the scroller */
  @Prop() maxItems = 0;

  /** Allow entry of custom values which are not in the original set of items */
  @Prop() customValues: boolean;

  /** Specify the scale of the combobox, defaults to m */
  @Prop({ reflect: true }) scale: "s" | "m" | "l" = "m";

  /** Select theme (light or dark) */
  @Prop({ reflect: true }) theme: "light" | "dark";

  //--------------------------------------------------------------------------
  //
  //  Event Listeners
  //
  //--------------------------------------------------------------------------

  @Listen("click", { target: "document" })
  documentClickHandler(event: Event): void {
    const target = event.target as HTMLElement;
    this.setInactiveIfNotContained(target);
  }

  @Listen("calciteComboboxItemChange")
  calciteComboboxItemChangeHandler(event: CustomEvent<HTMLCalciteComboboxItemElement>): void {
    this.toggleSelection(event.detail);
  }

  @Listen("calciteChipDismiss")
  calciteChipDismissHandler(event: CustomEvent<HTMLCalciteChipElement>): void {
    this.active = false;

    const value = event.detail?.value;
    const comboboxItem = this.items.find((item) => item.value === value);

    if (comboboxItem) {
      this.toggleSelection(comboboxItem, false);
    }

    this.calciteComboboxChipDismiss.emit(event.detail);
  }

  @Listen("keydown") keydownHandler(event: KeyboardEvent): void {
    const key = getKey(event.key, getElementDir(this.el));

    switch (key) {
      case "Tab":
        this.activeChipIndex = -1;
        this.activeItemIndex = -1;
        this.active = false;
        break;
      case "ArrowLeft":
        this.previousChip();
        break;
      case "ArrowRight":
        this.nextChip();
        break;
      case "ArrowUp":
        event.preventDefault();
        this.active = true;
        this.shiftActiveItemIndex(-1);
        break;
      case "ArrowDown":
        event.preventDefault();
        this.active = true;
        this.shiftActiveItemIndex(1);
        break;
      case "Home":
        this.active = true;
        this.updateActiveItemIndex(0);
        break;
      case "End":
        this.active = true;
        this.updateActiveItemIndex(this.visibleItems.length - 1);
        break;
      case "Escape":
        this.active = false;
        break;
      case "Enter":
        if (this.activeItemIndex > -1) {
          this.toggleSelection(this.visibleItems[this.activeItemIndex]);
        } else if (this.activeChipIndex > -1) {
          this.removeActiveChip();
        } else if (this.customValues && this.text) {
          this.addCustomChip(this.text);
        }
        break;
      case "Delete":
      case "Backspace":
        if (this.activeChipIndex > -1) {
          this.removeActiveChip();
        } else if (!this.text) {
          this.removeLastChip();
        }
        break;
      default:
        if (!this.active) {
          this.setFocus();
        }
        break;
    }
  }

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  @Method() async reposition(): Promise<void> {
    const { popper, menuEl } = this;
    const modifiers = this.getModifiers();
    popper
      ? updatePopper({
          el: menuEl,
          modifiers,
          placement: DEFAULT_PLACEMENT,
          popper
        })
      : this.createPopper();
  }

  @Method() async setFocus(): Promise<void> {
    this.active = true;
    this.textInput?.focus();
    this.activeChipIndex = -1;
    this.activeItemIndex = -1;
  }

  // --------------------------------------------------------------------------
  //
  //  Events
  //
  // --------------------------------------------------------------------------

  /** Called when the selected items set changes */
  @Event() calciteLookupChange: EventEmitter<
    (HTMLCalciteComboboxItemElement | SelectedComboboxOption)[]
  >;

  @Event() calciteComboboxChipDismiss: EventEmitter;

  // --------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  // --------------------------------------------------------------------------

  connectedCallback(): void {
    if (Build.isBrowser) {
      this.observer = new MutationObserver(this.updateItems);
    }

    this.createPopper();
  }

  componentWillLoad(): void {
    this.updateItems();
  }

  componentDidLoad(): void {
    this.observer?.observe(this.el, { childList: true, subtree: true });
    this.maxScrollerHeight = this.getMaxScrollerHeight(this.items);
  }

  componentDidRender(): void {
    if (this.el.offsetHeight !== this.inputHeight) {
      this.reposition();
      this.inputHeight = this.el.offsetHeight;
    }
  }

  disconnectedCallback(): void {
    this.observer?.disconnect();
    this.destroyPopper();
  }

  //--------------------------------------------------------------------------
  //
  //  Private State/Props
  //
  //--------------------------------------------------------------------------
  @State() items: HTMLCalciteComboboxItemElement[] = [];

  @State() selectedItems: (HTMLCalciteComboboxItemElement | SelectedComboboxOption)[] = [];

  @State() visibleItems: HTMLCalciteComboboxItemElement[] = [];

  @State() customItems: SelectedComboboxOption[] = [];

  @State() activeItemIndex = -1;

  @State() activeChipIndex = -1;

  @State() activeDescendant = "";

  @State() text = "";

  /** when search text is cleared, reset active to  */
  @Watch("text") textHandler(): void {
    this.updateActiveItemIndex(-1);
  }

  textInput: HTMLInputElement = null;

  data: ItemData[];

  observer: MutationObserver = null;

  private guid: string = guid();

  /** specifies the item wrapper height; it is updated when maxItems is > 0  **/
  private maxScrollerHeight = 0;

  private inputHeight = 0;

  private popper: Popper;

  private menuEl: HTMLDivElement;

  private referenceEl: HTMLDivElement;

  private listContainerEl: HTMLDivElement;

  // --------------------------------------------------------------------------
  //
  //  Private Methods
  //
  // --------------------------------------------------------------------------

  setInactiveIfNotContained = (target: HTMLElement): void => {
    if (!this.active || this.el.contains(target)) {
      return;
    }

    this.active = false;
  };

  setMenuEl = (el: HTMLDivElement): void => {
    this.menuEl = el;
  };

  setListContainerEl = (el: HTMLDivElement): void => {
    this.listContainerEl = el;
  };

  setReferenceEl = (el: HTMLDivElement): void => {
    this.referenceEl = el;
  };

  getModifiers(): Partial<StrictModifiers>[] {
    const flipModifier: Partial<StrictModifiers> = {
      name: "flip",
      enabled: true
    };

    flipModifier.options = {
      fallbackPlacements: ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"]
    };

    return [flipModifier];
  }

  createPopper(): void {
    this.destroyPopper();
    const { menuEl, referenceEl } = this;
    const modifiers = this.getModifiers();

    this.popper = createPopper({
      el: menuEl,
      modifiers,
      placement: DEFAULT_PLACEMENT,
      referenceEl
    });
  }

  destroyPopper(): void {
    const { popper } = this;

    if (popper) {
      popper.destroy();
    }

    this.popper = null;
  }

  private getMaxScrollerHeight(items: HTMLCalciteComboboxItemElement[]): number {
    const { maxItems } = this;
    let itemsToProcess = 0;
    let maxScrollerHeight = 0;
    items.forEach((item) => {
      if (itemsToProcess < maxItems && maxItems > 0) {
        maxScrollerHeight += this.calculateSingleItemHeight(item);
        itemsToProcess++;
      }
    });

    return maxScrollerHeight;
  }

  private calculateSingleItemHeight(item: HTMLCalciteComboboxItemElement): number {
    let height = item.offsetHeight;
    // if item has children items, don't count their height twice
    const children = item.querySelectorAll<HTMLCalciteComboboxItemElement>("calcite-combobox-item");
    children.forEach((child) => {
      height -= child.offsetHeight;
    });
    return height;
  }

  inputHandler = (event: Event): void => {
    const value = (event.target as HTMLInputElement).value;
    this.text = value;
    this.filterItems(value);
    if (value) {
      this.activeChipIndex = -1;
    }
  };

  filterItems = debounce((value: string): void => {
    const filteredData = filter(this.data, value);
    const values = filteredData.map((item) => item.value);
    this.items.forEach((item) => {
      const hidden = values.indexOf(item.value) === -1;
      item.hidden = hidden;
      const [parent, grandparent] = item.anscestors;
      if (
        (parent || grandparent) &&
        (values.indexOf(parent?.value) > -1 || values.indexOf(grandparent?.value) > -1)
      ) {
        item.hidden = false;
      }
      if (!hidden) {
        item.anscestors.forEach((anscestor) => (anscestor.hidden = false));
      }
    });

    this.visibleItems = this.getVisibleItems();
  }, 100);

  toggleSelection(
    item: HTMLCalciteComboboxItemElement | SelectedComboboxOption,
    value = !item.selected
  ): void {
    item.selected = value;
    if ((item as SelectedComboboxOption).custom && !item.selected) {
      this.customItems = this.customItems.filter((el) => el.value !== item.value);
    }

    this.selectedItems = this.getSelectedItems();
    this.calciteLookupChange.emit(this.selectedItems);
    this.resetText();
    this.textInput.focus();
    this.filterItems("");
  }

  getVisibleItems(): HTMLCalciteComboboxItemElement[] {
    return this.items.filter((item) => !item.hidden);
  }

  getSelectedItems(): (HTMLCalciteComboboxItemElement | SelectedComboboxOption)[] {
    const current = [...this.selectedItems];
    return (
      [...this.items, ...this.customItems]
        .filter((item) => item.selected)
        /** Preserve order of entered tags */
        .sort((a, b) => {
          const aIdx = current.indexOf(a);
          const bIdx = current.indexOf(b);
          if (aIdx > -1 && bIdx > -1) {
            return aIdx - bIdx;
          }
          return bIdx - aIdx;
        })
    );
  }

  updateItems(): void {
    this.items = this.getItems();
    this.data = this.getData();
    this.selectedItems = this.getSelectedItems();
    this.visibleItems = this.getVisibleItems();
  }

  getData(): ItemData[] {
    return this.items.map((item) => ({
      value: item.value,
      label: item.textLabel,
      guid: item.guid
    }));
  }

  resetText(): void {
    this.textInput.value = "";
    this.text = "";
  }

  getItems(): HTMLCalciteComboboxItemElement[] {
    const items = Array.from(this.el.querySelectorAll(COMBO_BOX_ITEM));
    return items.filter((item) => !item.disabled);
  }

  addCustomChip(value: string): void {
    const existingItem = this.items.find((el) => el.value === value || el.textLabel === value);
    const existingCustomItem = this.customItems.find((item) => item.value === value);

    if (existingItem) {
      this.toggleSelection(existingItem, true);
    } else if (!existingCustomItem) {
      this.customItems.push({
        value,
        textLabel: value,
        guid: guid(),
        selected: true,
        custom: true
      });
      this.updateItems();
      this.resetText();
      this.setFocus();
    }
  }

  removeActiveChip(): void {
    this.toggleSelection(this.selectedItems[this.activeChipIndex], false);
    this.setFocus();
  }

  removeLastChip(): void {
    this.toggleSelection(this.selectedItems[this.selectedItems.length - 1], false);
    this.setFocus();
  }

  previousChip(): void {
    if (this.text) {
      return;
    }
    const length = this.selectedItems.length - 1;
    const active = this.activeChipIndex;
    this.activeChipIndex = active === -1 ? length : Math.max(active - 1, 0);
    this.updateActiveItemIndex(-1);
    this.focusChip();
  }

  nextChip(): void {
    if (this.text || this.activeChipIndex === -1) {
      return;
    }
    const last = this.selectedItems.length - 1;
    const newIndex = this.activeChipIndex + 1;
    if (newIndex > last) {
      this.activeChipIndex = -1;
      this.setFocus();
    } else {
      this.activeChipIndex = newIndex;
      this.focusChip();
    }
    this.updateActiveItemIndex(-1);
  }

  focusChip(): void {
    const guid = this.selectedItems[this.activeChipIndex]?.guid;
    const chip = this.referenceEl.querySelector<HTMLCalciteChipElement>(`#chip-${guid}`);
    chip?.setFocus();
  }

  shiftActiveItemIndex(delta: number): void {
    const length = this.visibleItems.length;
    const newIndex = (this.activeItemIndex + length + delta) % length;
    this.updateActiveItemIndex(newIndex);
    // ensure active item is in view if we have scrolling
    const activeItem = this.visibleItems[this.activeItemIndex];
    const height = this.calculateSingleItemHeight(activeItem);
    const { offsetHeight, scrollTop } = this.listContainerEl;
    if (offsetHeight + scrollTop < activeItem.offsetTop + height) {
      this.listContainerEl.scrollTop = activeItem.offsetTop - offsetHeight + height;
    } else if (activeItem.offsetTop < scrollTop) {
      this.listContainerEl.scrollTop = activeItem.offsetTop;
    }
  }

  updateActiveItemIndex(index: number): void {
    this.activeItemIndex = index;
    let activeDescendant: string = null;
    this.visibleItems.forEach((el, i) => {
      if (i === index) {
        el.active = true;
        activeDescendant = el.guid;
      } else {
        el.active = false;
      }
    });
    this.activeDescendant = activeDescendant;
    if (this.activeItemIndex > -1) {
      this.activeChipIndex = -1;
      this.textInput.focus();
    }
  }

  comboboxFocusHandler = (): void => {
    this.active = true;
  };

  comboboxBlurHandler = (event: FocusEvent): void => {
    const relatedTarget = event.relatedTarget as HTMLElement;
    this.setInactiveIfNotContained(relatedTarget);
  };

  //--------------------------------------------------------------------------
  //
  //  Render Methods
  //
  //--------------------------------------------------------------------------

  renderChips(): VNode[] {
    const { activeChipIndex, scale } = this;
    return this.selectedItems.map((item, i) => {
      const chipClasses = { chip: true, "chip--active": activeChipIndex === i };
      return (
        <calcite-chip
          class={chipClasses}
          dismissLabel={"remove tag"}
          dismissible
          id={`chip-${item.guid}`}
          key={item.value}
          scale={scale}
          value={item.value}
        >
          {item.textLabel}
        </calcite-chip>
      );
    });
  }

  renderListBoxOptions(): VNode[] {
    return this.visibleItems.map((item) => (
      <li aria-selected={(!!item.selected).toString()} id={item.guid} role="option" tabindex="-1">
        {item.value}
      </li>
    ));
  }

  renderPopperContainer(): VNode {
    const { active, maxScrollerHeight, setMenuEl, setListContainerEl } = this;
    const classes = {
      "list-container": true,
      [PopperCSS.animation]: true,
      [PopperCSS.animationActive]: active
    };
    const style = {
      maxHeight: maxScrollerHeight > 0 ? `${maxScrollerHeight}px` : ""
    };
    return (
      <div aria-hidden="true" class="popper-container" ref={setMenuEl}>
        <div class={classes} ref={setListContainerEl} style={style}>
          <ul class="list">
            <slot />
          </ul>
        </div>
      </div>
    );
  }

  render(): VNode {
    const { guid, active, disabled, el, label, placeholder } = this;
    const dir = getElementDir(el);
    const labelId = `${guid}-label`;
    return (
      <Host active={active} dir={dir}>
        <div
          aria-autocomplete="list"
          aria-expanded={active.toString()}
          aria-haspopup="listbox"
          aria-labelledby={labelId}
          aria-owns={guid}
          class={{ wrapper: true, "wrapper--active": active }}
          onClick={() => this.setFocus()}
          ref={this.setReferenceEl}
          role="combobox"
        >
          {this.renderChips()}
          <label class="screen-readers-only" htmlFor={`${guid}-input`} id={labelId}>
            {label}
          </label>
          <input
            aria-activedescendant={this.activeDescendant}
            aria-autocomplete="list"
            aria-controls={guid}
            class={{ input: true, "input--hidden": this.activeChipIndex > -1 }}
            disabled={disabled}
            id={`${guid}-input`}
            onBlur={this.comboboxBlurHandler}
            onFocus={this.comboboxFocusHandler}
            onInput={this.inputHandler}
            placeholder={placeholder}
            ref={(el) => (this.textInput = el as HTMLInputElement)}
            type="text"
          />
        </div>
        <ul
          aria-labelledby={labelId}
          aria-multiselectable="true"
          class="screen-readers-only"
          id={guid}
          role="listbox"
          tabIndex={-1}
        >
          {this.renderListBoxOptions()}
        </ul>
        {this.renderPopperContainer()}
      </Host>
    );
  }
}
