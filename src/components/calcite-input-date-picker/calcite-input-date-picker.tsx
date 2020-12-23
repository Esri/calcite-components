import {
  Component,
  h,
  Prop,
  Element,
  Host,
  State,
  Listen,
  Build,
  Watch,
  VNode,
  Method
} from "@stencil/core";
import { getLocaleData, DateLocaleData } from "../calcite-date-picker/utils";
import { getElementDir } from "../../utils/dom";
import { dateFromRange, inRange, dateFromISO, parseDateString, sameDate } from "../../utils/date";

import { getKey } from "../../utils/key";
import { TEXT } from "../calcite-date-picker/calcite-date-picker-resources";

import { createPopper, updatePopper, CSS as PopperCSS } from "../../utils/popper";
import { StrictModifiers, Instance as Popper } from "@popperjs/core";
import { DateRangeChange } from "../../interfaces/DateRangeChange";

const DEFAULT_PLACEMENT = "bottom-start";

@Component({
  assetsDirs: ["calcite-input-date-picker-nls"],
  tag: "calcite-input-date-picker",
  styleUrl: "calcite-input-date-picker.scss",
  shadow: true
})
export class CalciteDatePicker {
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------
  @Element() el: HTMLCalciteInputDatePickerElement;

  //--------------------------------------------------------------------------
  //
  //  Public Properties
  //
  //--------------------------------------------------------------------------
  /** Selected date */
  @Prop() value?: string;

  /** Selected date as full date object*/
  @Prop({ mutable: true }) valueAsDate?: Date;

  /** Selected start date as full date object*/
  @Prop({ mutable: true }) startAsDate?: Date;

  /** Selected end date as full date object*/
  @Prop({ mutable: true }) endAsDate?: Date;

  /** Earliest allowed date ("yyyy-mm-dd") */
  @Prop() min?: string;

  /** Latest allowed date ("yyyy-mm-dd") */
  @Prop() max?: string;

  /** Expand or collapse when calendar does not have input */
  @Prop({ reflect: true }) active = false;

  @Watch("active")
  activeHandler(): void {
    this.reposition();
  }

  /** Localized string for "previous month" (used for aria label) */
  @Prop() intlPrevMonth?: string = TEXT.prevMonth;

  /** Localized string for "next month" (used for aria label) */
  @Prop() intlNextMonth?: string = TEXT.nextMonth;

  /** BCP 47 language tag for desired language and country format */
  @Prop() locale?: string = document.documentElement.lang || "en-US";

  /** specify the scale of the date picker */
  @Prop({ reflect: true }) scale: "s" | "m" | "l" = "m";

  /** Range mode activation */
  @Prop({ reflect: true }) range?: boolean = false;

  /** Selected start date */
  @Prop() start?: string;

  /** Selected end date */
  @Prop() end?: string;

  @Prop() proximitySelection?: boolean = true;

  /** Layout */
  @Prop({ reflect: true }) layout: "horizontal" | "vertical" = "horizontal";

  //--------------------------------------------------------------------------
  //
  //  Event Listeners
  //
  //--------------------------------------------------------------------------

  /**
   * Blur doesn't fire properly when there is no shadow dom (ege/IE11)
   * Check if the focused element is inside the date picker, if not close
   */
  @Listen("focusin", { target: "window" })
  focusInHandler(e: FocusEvent): void {
    if (!this.hasShadow && !this.el.contains(e.srcElement as HTMLElement)) {
      this.reset();
    }
  }

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  @Method()
  async reposition(): Promise<void> {
    const { popper, menuEl } = this;
    const modifiers = this.getModifiers();

    popper && !this.range
      ? updatePopper({
          el: menuEl,
          modifiers,
          placement: DEFAULT_PLACEMENT,
          popper
        })
      : this.createPopper();
  }

  //--------------------------------------------------------------------------
  //
  //  Events
  //
  //--------------------------------------------------------------------------
  /**
   * Active date.
   */
  @State() activeDate: Date;

  /**
   * Active start date.
   */
  @State() activeStartDate: Date;

  /**
   * Active end date.
   */
  @State() activeEndDate: Date;

  /**
   * In range mode, indicates which input was is focused on
   */
  @State() focusedInput: "start" | "end" = "start";

  @Watch("focusedInput")
  focusedHandler(): void {
    this.reposition();
  }

  private endInput: HTMLCalciteInputElement;

  // --------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  // --------------------------------------------------------------------------
  connectedCallback(): void {
    this.loadLocaleData();

    if (this.value) {
      this.valueAsDate = dateFromISO(this.value);
    }

    if (this.start) {
      this.setStartAsDate(dateFromISO(this.start));
    }
    if (this.end) {
      this.setEndAsDate(dateFromISO(this.end));
    }

    this.createPopper();
  }

  disconnectedCallback(): void {
    this.destroyPopper();
  }

  render(): VNode {
    const min = dateFromISO(this.min);
    const max = dateFromISO(this.max);
    const date = dateFromRange(this.range ? this.startAsDate : this.valueAsDate, min, max);
    const activeStartDate = this.range
      ? this.getActiveStartDate(date, min, max)
      : this.getActiveDate(date, min, max);
    let activeDate = activeStartDate;
    const endDate = this.range ? dateFromRange(this.endAsDate, min, max) : null;
    const activeEndDate = this.getActiveEndDate(endDate, min, max);
    if (
      (this.focusedInput === "end" ||
        (this.hoverRange?.focused === "end" && (this.proximitySelection || endDate))) &&
      activeEndDate
    ) {
      activeDate = activeEndDate;
    }
    if (this.range && this.mostRecentRangeValue) {
      activeDate = this.mostRecentRangeValue;
    }
    const formattedEndDate = endDate ? endDate.toLocaleDateString(this.locale) : "";
    const formattedDate = date ? date.toLocaleDateString(this.locale) : "";
    const minDate = this.focusedInput === "start" ? min : date || min;
    const maxDate = this.focusedInput === "start" ? endDate || max : max;
    const dir = getElementDir(this.el);

    return (
      <Host dir={dir} onBlur={this.reset} onKeyUp={this.keyUpHandler} role="application">
        {this.localeData && (
          <div aria-expanded={this.active.toString()} class="input-container" role="application">
            {
              <div class="input-wrapper" ref={this.setStartWrapper}>
                <calcite-input
                  class={`input ${
                    this.layout === "vertical" && this.range ? `no-bottom-border` : ``
                  }`}
                  icon="calendar"
                  number-button-type="none"
                  onCalciteInputBlur={this.inputBlur}
                  onCalciteInputFocus={this.startInputFocus}
                  onCalciteInputInput={this.inputInput}
                  placeholder={this.localeData?.placeholder}
                  scale={this.scale}
                  type="text"
                  value={formattedDate}
                />
              </div>
            }

            <div
              aria-hidden={(!this.active).toString()}
              class="menu-container"
              ref={this.setMenuEl}
            >
              <div
                class={{
                  ["calendar-picker-wrapper"]: true,
                  ["calendar-picker-wrapper--end"]: this.focusedInput === "end",
                  [PopperCSS.animation]: true,
                  [PopperCSS.animationActive]: this.active
                }}
              >
                <calcite-date-picker
                  activeRange={this.focusedInput}
                  dir={dir}
                  endAsDate={maxDate}
                  intlNextMonth={this.intlNextMonth}
                  intlPrevMonth={this.intlPrevMonth}
                  locale={this.locale}
                  max={this.max}
                  min={this.min}
                  onCalciteDatePickerChange={this.handleDateChange}
                  onCalciteDatePickerRangeChange={this.handleDateRangeChange}
                  range={this.range}
                  scale={this.scale}
                  startAsDate={minDate}
                  valueAsDate={activeDate}
                />
              </div>
            </div>

            {this.range && this.layout === "horizontal" && (
              <div class="horizontal-arrow-container">
                <calcite-icon flipRtl={true} icon="arrow-right" scale="s" />
              </div>
            )}
            {this.range && this.layout === "vertical" && (
              <div class="vertical-arrow-container">
                <calcite-icon icon="arrow-down" scale="s" />
              </div>
            )}
            {this.range && (
              <div class="input-wrapper" ref={this.setEndWrapper}>
                <calcite-input
                  class="input"
                  icon="calendar"
                  number-button-type="none"
                  onCalciteInputBlur={this.inputBlur}
                  onCalciteInputFocus={this.endInputFocus}
                  onCalciteInputInput={this.inputInput}
                  placeholder={this.localeData?.placeholder}
                  ref={(el) => (this.endInput = el)}
                  scale={this.scale}
                  type="text"
                  value={formattedEndDate}
                />
              </div>
            )}
          </div>
        )}
      </Host>
    );
  }

  //--------------------------------------------------------------------------
  //
  //  Private State/Props
  //
  //--------------------------------------------------------------------------
  @State() private localeData: DateLocaleData;

  @State() private hoverRange;

  private hasShadow: boolean = Build.isBrowser && !!document.head.attachShadow;

  private popper: Popper;

  private menuEl: HTMLDivElement;

  private startWrapper: HTMLDivElement;

  private endWrapper: HTMLDivElement;

  private mostRecentRangeValue?: Date;

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  keyUpHandler = (e: KeyboardEvent): void => {
    if (getKey(e.key) === "Escape") {
      this.reset();
    }
  };

  inputBlur = (e: CustomEvent<any>): void => {
    this.blur(e.detail);
  };

  startInputFocus = (): void => {
    this.active = true;
    this.focusedInput = "start";
  };

  endInputFocus = (): void => {
    this.active = true;
    this.focusedInput = "end";
  };

  inputInput = (e: CustomEvent<any>): void => {
    this.input(e.detail.value);
  };

  setMenuEl = (el: HTMLDivElement): void => {
    if (el) {
      this.menuEl = el;
    }
  };

  setStartWrapper = (el: HTMLDivElement): void => {
    this.startWrapper = el;
  };

  setEndWrapper = (el: HTMLDivElement): void => {
    this.endWrapper = el;
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
    const { menuEl, startWrapper, endWrapper } = this;
    const modifiers = this.getModifiers();

    this.popper = createPopper({
      el: menuEl,
      modifiers,
      placement: DEFAULT_PLACEMENT,
      referenceEl:
        this.focusedInput === "end" || this.layout === "vertical" ? endWrapper : startWrapper
    });
  }

  destroyPopper(): void {
    const { popper } = this;

    if (popper) {
      popper.destroy();
    }

    this.popper = null;
  }

  @Watch("value")
  valueWatcher(value: string): void {
    this.valueAsDate = dateFromISO(value);
  }

  @Watch("start")
  startWatcher(start: string): void {
    this.setStartAsDate(dateFromISO(start));
  }

  @Watch("end")
  endWatcher(end: string): void {
    this.setEndAsDate(dateFromISO(end));
  }

  @Watch("locale")
  private async loadLocaleData(): Promise<void> {
    const { locale } = this;
    this.localeData = await getLocaleData(locale);
  }

  /**
   * Update date instance of start if valid
   */
  private setStartAsDate(startDate: Date): void {
    this.startAsDate = startDate;
    this.mostRecentRangeValue = this.startAsDate;
  }

  /**
   * Update date instance of end if valid
   */
  private setEndAsDate(endDate: Date): void {
    this.endAsDate = endDate;
    this.mostRecentRangeValue = this.endAsDate;
  }

  /**
   * Reset active date and close
   */
  private reset(): void {
    if (this.valueAsDate && this.valueAsDate?.getTime() !== this.activeDate?.getTime()) {
      this.activeDate = new Date(this.valueAsDate);
    }
    if (this.startAsDate && this.startAsDate?.getTime() !== this.activeStartDate?.getTime()) {
      this.activeStartDate = new Date(this.startAsDate);
    }
    if (this.endAsDate && this.endAsDate?.getTime() !== this.activeEndDate?.getTime()) {
      this.activeEndDate = new Date(this.endAsDate);
    }
    this.active = false;
  }

  /**
   * If inputted string is a valid date, update value/active
   */
  private input(value: string): void {
    const date = this.getDateFromInput(value);
    if (date) {
      if (!this.range) {
        this.valueAsDate = date;
        this.activeDate = date as Date;
      } else {
        let changed = false;
        if (this.focusedInput === "start") {
          changed = !this.startAsDate || !sameDate(date, this.startAsDate);
          if (changed) {
            this.startAsDate = date;
            this.activeStartDate = date as Date;
          }
        } else if (this.focusedInput === "end") {
          changed = !this.endAsDate || !sameDate(date, this.endAsDate);
          if (changed) {
            this.endAsDate = date;
            this.activeEndDate = date as Date;
          }
        }
      }
    }
  }

  /**
   * Clean up invalid date from input on blur
   */
  private blur(target: HTMLInputElement): void {
    const date = this.getDateFromInput(target.value);
    if (!date) {
      if (!this.range && this.valueAsDate) {
        target.value = this.valueAsDate.toLocaleDateString(this.locale);
      } else if (this.focusedInput === "start" && this.startAsDate) {
        target.value = this.startAsDate.toLocaleDateString(this.locale);
      } else if (this.focusedInput === "end" && this.endAsDate) {
        target.value = this.endAsDate.toLocaleDateString(this.locale);
      }
    }
  }

  /**
   * Event handler for when the selected date changes
   */
  private handleDateChange = (event: CustomEvent<Date>): void => {
    this.valueAsDate = event.detail;

    setTimeout(() => {
      if (this.focusedInput === "start") {
        this.endInput.setFocus();
      }
    }, 150);
  };

  private handleDateRangeChange = (event: CustomEvent<DateRangeChange>): void => {
    this.startAsDate = event.detail.startDate;
    this.endAsDate = event.detail.endDate;
  };

  /**
   * Get an active date using the value, or current date as default
   */
  private getActiveDate(value: Date | null, min: Date | null, max: Date | null): Date {
    return dateFromRange(this.activeDate, min, max) || value || dateFromRange(new Date(), min, max);
  }

  private getActiveStartDate(value: Date | null, min: Date | null, max: Date | null): Date {
    return (
      dateFromRange(this.activeStartDate, min, max) || value || dateFromRange(new Date(), min, max)
    );
  }

  private getActiveEndDate(value: Date | null, min: Date | null, max: Date | null): Date {
    return (
      dateFromRange(this.activeEndDate, min, max) || value || dateFromRange(new Date(), min, max)
    );
  }

  /**
   * Find a date from input string
   * return false if date is invalid, or out of range
   */
  private getDateFromInput(value: string): Date | false {
    if (!this.localeData) {
      return false;
    }
    const { separator } = this.localeData;
    const { day, month, year } = parseDateString(value, this.localeData);
    const validDay = day > 0;
    const validMonth = month > -1;
    const date = new Date(year, month, day);
    date.setFullYear(year);
    const validDate = !isNaN(date.getTime());
    const validLength = value.split(separator).filter((c) => c).length > 2;
    const validYear = year.toString().length > 0;
    if (
      validDay &&
      validMonth &&
      validDate &&
      validLength &&
      validYear &&
      inRange(date, this.min, this.max)
    ) {
      return date;
    }
    return false;
  }
}
