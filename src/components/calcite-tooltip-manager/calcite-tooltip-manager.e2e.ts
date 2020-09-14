import { newE2EPage } from "@stencil/core/testing";
import { TOOLTIP_REFERENCE } from "../calcite-tooltip/resources";
import { defaults, hidden, renders } from "../../tests/commonTests";

describe("calcite-tooltip-manager", () => {
  it("renders", async () => renders(`<calcite-tooltip-manager></calcite-tooltip-manager>`));

  it("honors hidden attribute", async () => hidden("calcite-tooltip-manager"));

  it("has property defaults", async () =>
    defaults("calcite-tooltip-manager", [
      {
        propertyName: "selector",
        defaultValue: `[${TOOLTIP_REFERENCE}]`
      }
    ]));

  it("should honor tooltips on mouseover/mouseout", async () => {
    const page = await newE2EPage();

    const openDelay = 500;
    const closeDelay = 500;

    await page.setContent(
      `
      <button id="test">test</button>
      <calcite-tooltip-manager open-delay="${openDelay}" close-delay="${closeDelay}">
        <calcite-tooltip reference-element="ref">Content</calcite-tooltip>
        <button id="ref">Button</button>
      <calcite-tooltip-manager>
      `
    );

    await page.waitForChanges();

    const tooltip = await page.find("calcite-tooltip");

    expect(await tooltip.getProperty("open")).toBe(false);

    const referenceElement = await page.find("#ref");

    await referenceElement.hover();

    await page.waitForChanges();

    await page.waitFor(openDelay);

    expect(await tooltip.getProperty("open")).toBe(true);

    const testElement = await page.find("#test");

    await testElement.hover();

    await page.waitForChanges();

    await page.waitFor(closeDelay);

    expect(await tooltip.getProperty("open")).toBe(false);
  });

  it("should honor tooltips on focus/blur", async () => {
    const page = await newE2EPage();

    await page.setContent(
      `
      <button id="test">test</button>
      <calcite-tooltip-manager>
        <calcite-tooltip reference-element="ref">Content</calcite-tooltip>
        <button id="ref">Button</button>
      <calcite-tooltip-manager>
      `
    );

    await page.waitForChanges();

    const tooltip = await page.find("calcite-tooltip");

    expect(await tooltip.getProperty("open")).toBe(false);

    const referenceElement = await page.find("#ref");

    await referenceElement.focus();

    await page.waitForChanges();

    expect(await tooltip.getProperty("open")).toBe(true);

    const testElement = await page.find("#test");

    await testElement.focus();

    await page.waitForChanges();

    expect(await tooltip.getProperty("open")).toBe(false);
  });

  it("should honor tooltips closing with ESC key", async () => {
    const page = await newE2EPage();

    await page.setContent(
      `
      <calcite-tooltip-manager>
        <calcite-tooltip reference-element="ref">Content</calcite-tooltip>
        <button id="ref">Button</button>
      <calcite-tooltip-manager>
      `
    );

    await page.waitForChanges();

    const tooltip = await page.find("calcite-tooltip");

    expect(await tooltip.getProperty("open")).toBe(false);

    const referenceElement = await page.find("#ref");

    await referenceElement.focus();

    await page.waitForChanges();

    expect(await tooltip.getProperty("open")).toBe(true);

    await referenceElement.press("Escape");

    expect(await tooltip.getProperty("open")).toBe(false);
  });
});
