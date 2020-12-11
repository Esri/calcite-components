import {
  Component,
  h,
  Prop,
  Event,
  Element,
  Host,
  State,
  Listen,
  Build,
  EventEmitter,
  Watch,
  VNode
} from "@stencil/core";
import { getLocaleData, DateLocaleData } from "./utils";
import { getElementDir } from "../../utils/dom";
import { dateFromRange, dateFromISO, dateToISO, getDaysDiff } from "../../utils/date";

import { getKey } from "../../utils/key";
import { TEXT } from "./calcite-date-picker-resources";

import { DateRangeChange } from "../../interfaces/DateRangeChange";

@Component({
  assetsDirs: ["calcite-date-picker-nls"],
  tag: "calcite-date-picker",
  styleUrl: "calcite-date-picker.scss",
  shadow: true
})
export class CalciteDatePicker {
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------
  @Element() el: HTMLCalciteDatePickerElement;

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
  @Listen("blur")
  focusOutHandler(): void {
    this.reset();
  }

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

  @Listen("keyup")
  keyDownHandler(e: KeyboardEvent): void {
    if (getKey(e.key) === "Escape") {
      this.reset();
    }
  }

  //--------------------------------------------------------------------------
  //
  //  Events
  //
  //--------------------------------------------------------------------------
  /**
   * Trigger calcite date change when a user changes the date.
   */
  @Event() calciteDatePickerChange: EventEmitter<Date>;

  /**
   * Trigger calcite date change when a user changes the date range.
   */
  @Event() calciteDatePickerRangeChange: EventEmitter<DateRangeChange>;

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

  // todo: figure out a better API prop for this?
  /**
   * In range mode, indicates which input was is focused on
   */
  @State() focusedInput: "start" | "end" = "start";

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
    const minDate = this.focusedInput === "start" ? min : date || min;
    const maxDate = max;
    const dir = getElementDir(this.el);

    return (
      <Host dir={dir} role="application">
        {this.renderCalendar(activeDate, dir, maxDate, minDate, date, endDate)}
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

  private mostRecentRangeValue?: Date;

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

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
   * Render calcite-date-picker-month-header and calcite-date-picker-month
   */
  private renderCalendar(
    activeDate: Date,
    dir: string,
    maxDate: Date,
    minDate: Date,
    date: Date,
    endDate: Date
  ) {
    return (
      this.localeData && [
        <calcite-date-picker-month-header
          activeDate={activeDate}
          dir={dir}
          intlNextMonth={this.intlNextMonth}
          intlPrevMonth={this.intlPrevMonth}
          localeData={this.localeData}
          max={maxDate}
          min={minDate}
          onCalciteDatePickerSelect={(e: CustomEvent<Date>) => {
            const date = new Date(e.detail);
            if (!this.range) {
              this.activeDate = date;
              this.handleDateChange(e);
            } else {
              if (this.focusedInput === "start") {
                this.activeStartDate = date;
              } else if (this.focusedInput === "end") {
                this.activeEndDate = date;
              }
              this.mostRecentRangeValue = date;
            }
          }}
          scale={this.scale}
          selectedDate={this.focusedInput === "start" ? date : endDate || new Date()}
        />,
        <calcite-date-picker-month
          activeDate={activeDate}
          dir={dir}
          endDate={this.range ? endDate : undefined}
          hoverRange={this.hoverRange}
          localeData={this.localeData}
          max={maxDate}
          min={minDate}
          onCalciteActiveDateChange={(e: CustomEvent<Date>) => {
            const date = new Date(e.detail);
            if (!this.range) {
              this.activeDate = date;
            } else {
              if (this.focusedInput === "start") {
                this.activeStartDate = date;
              } else if (this.focusedInput === "end") {
                this.activeEndDate = date;
              }
              this.mostRecentRangeValue = date;
            }
          }}
          onCalciteDatePickerHover={(e: CustomEvent<Date>) => {
            if (!this.startAsDate) {
              this.hoverRange = undefined;
              return this.hoverRange;
            }
            const date = new Date(e.detail);
            this.hoverRange = {
              focused: this.focusedInput,
              start: this.startAsDate,
              end: this.endAsDate
            };
            if (this.proximitySelection) {
              if (this.endAsDate) {
                const startDiff = getDaysDiff(date, this.startAsDate);
                const endDiff = getDaysDiff(date, this.endAsDate);
                if (startDiff < endDiff) {
                  this.hoverRange.start = date;
                  this.hoverRange.focused = "start";
                } else {
                  this.hoverRange.end = date;
                  this.hoverRange.focused = "end";
                }
              } else {
                if (date < this.startAsDate) {
                  this.hoverRange = {
                    focused: "start",
                    start: date,
                    end: this.startAsDate
                  };
                } else {
                  this.hoverRange.end = date;
                  this.hoverRange.focused = "end";
                }
              }
            } else {
              if (!this.endAsDate) {
                if (date < this.startAsDate) {
                  this.hoverRange = {
                    focused: "start",
                    start: date,
                    end: this.startAsDate
                  };
                } else {
                  this.hoverRange.end = date;
                  this.hoverRange.focused = "end";
                }
              } else {
                this.hoverRange = undefined;
              }
            }
          }}
          onCalciteDatePickerMouseOut={() => {
            if (this.hoverRange) {
              this.hoverRange = undefined;
            }
          }}
          onCalciteDatePickerSelect={(e: CustomEvent<Date>) => this.handleDateChange(e, true)}
          scale={this.scale}
          selectedDate={this.focusedInput === "start" ? date : endDate}
          startDate={this.range ? date : undefined}
        />
      ]
    );
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
  }

  /**
   * Event handler for when the selected date changes
   */
  private handleDateChange(e: CustomEvent<Date>, doReset?: boolean) {
    const date = new Date(e.detail);
    if (!this.range) {
      this.value = dateToISO(date);
      this.valueAsDate = e.detail;
      this.activeDate = date;
      this.calciteDatePickerChange.emit(date);
      if (doReset) {
        this.reset();
      }
      return;
    }

    if (this.range) {
      if (!this.startAsDate || (!this.endAsDate && date < this.startAsDate)) {
        if (this.startAsDate) {
          const newEndDate = new Date(this.startAsDate);
          this.end = dateToISO(newEndDate);
          this.setEndAsDate(newEndDate);
          this.activeEndDate = newEndDate;
        }
        this.start = dateToISO(date);
        this.setStartAsDate(date);
        this.activeStartDate = date;
      } else if (!this.endAsDate) {
        this.end = dateToISO(date);
        this.setEndAsDate(date);
        this.activeEndDate = date;
      } else {
        if (this.proximitySelection) {
          const startDiff = getDaysDiff(date, this.startAsDate);
          const endDiff = getDaysDiff(date, this.endAsDate);
          if (startDiff < endDiff) {
            this.start = dateToISO(date);
            this.setStartAsDate(date);
            this.activeStartDate = date;
          } else {
            this.end = dateToISO(date);
            this.setEndAsDate(date);
            this.activeEndDate = date;
          }
        } else {
          this.start = dateToISO(date);
          this.setStartAsDate(date);
          this.activeStartDate = date;
          this.endAsDate = this.activeEndDate = this.end = undefined;
        }
      }
      if (doReset) {
        this.reset();
      }
      this.calciteDatePickerRangeChange.emit({
        startDate: this.startAsDate,
        endDate: this.endAsDate
      });
      return;
    }

    if (this.focusedInput === "start") {
      this.start = dateToISO(date);
      this.setStartAsDate(date);
      this.activeStartDate = date;
    } else {
      this.end = dateToISO(date);
      this.setEndAsDate(date);
      this.activeEndDate = date;
    }

    if (doReset) {
      this.reset();
    }
    this.calciteDatePickerRangeChange.emit({
      startDate: this.startAsDate,
      endDate: this.endAsDate
    });
  }

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
}
