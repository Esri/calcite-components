import { CSS as PICK_LIST_ITEM_CSS } from "../calcite-pick-list-item/resources";
import { accessible, focusable, renders } from "../../tests/commonTests";
import { E2EPage, newE2EPage } from "@stencil/core/testing";
import { html } from "../../tests/utils";

describe("calcite-value-list-item", () => {
  it("renders", async () => renders("calcite-value-list-item"));

  it("is accessible", async () => {
    await accessible(html`
      <calcite-value-list>
        <calcite-value-list-item label="test" description="a number" value="one"></calcite-value-list-item>
      </calcite-value-list>
    `);

    await accessible(html`
      <calcite-value-list>
        <calcite-value-list-item label="test" description="a number" value="one" selected></calcite-value-list-item>
      </calcite-value-list>
    `);

    await accessible(html`
      <calcite-value-list>
        <calcite-value-list-item label="test" description="a number" value="one" removable></calcite-value-list-item>
      </calcite-value-list>
    `);
  });

  it("is focusable", async () => focusable("calcite-value-list-item"));

  it("should toggle selected attribute when clicked", async () => {
    const page = await newE2EPage({ html: `<calcite-value-list-item label="test"></calcite-value-list-item>` });

    const item = await page.find("calcite-value-list-item");
    expect(await item.getProperty("selected")).toBe(false);

    await item.click();
    expect(await item.getProperty("selected")).toBe(true);

    await item.click();
    expect(await item.getProperty("selected")).toBe(false);
  });

  it("should fire event calciteListItemChange when item is clicked", async () => {
    const page = await newE2EPage({
      html: `<calcite-value-list-item label="test" value="example"></calcite-value-list-item>`
    });
    const item = await page.find("calcite-value-list-item");
    await page.evaluate(() =>
      document.addEventListener("calciteListItemChange", (event: CustomEvent): void => {
        (window as any).eventDetail = event.detail;
      })
    );

    await item.click();

    const eventDetail: any = await page.evaluateHandle(() => (window as any).eventDetail);
    const properties = await eventDetail.getProperties();

    expect(properties.get("item")).toBeDefined();
    expect(properties.get("value")._remoteObject.value).toBe("example");
    expect(properties.get("selected")._remoteObject.value).toBe(true);
    expect(properties.get("shiftPressed")._remoteObject.value).toBe(false);
  });

  it("prevents deselection when disableDeselect is true", async () => {
    const page = await newE2EPage({
      html: `<calcite-value-list-item label="test" value="example" disable-deselect selected></calcite-value-list-item>`
    });
    const item = await page.find("calcite-value-list-item");

    await item.click();

    expect(await item.getProperty("selected")).toBe(true);
  });

  it("prevents selection when disableSelect is true", async () => {
    const page = await newE2EPage({
      html: `<calcite-value-list-item label="test" value="example" disable-select></calcite-value-list-item>`
    });
    const item = await page.find("calcite-value-list-item");

    await item.click();

    expect(await item.getProperty("selected")).toBe(false);
  });

  function queryWrappedPickListPart(page: E2EPage, partSelector: string, partMethodToInvoke?: string): Promise<void> {
    return page.$eval(
      "calcite-value-list-item",
      (item: HTMLCalciteValueListItemElement, selector, partMethod?: string) => {
        const part = item.shadowRoot
          .querySelector("calcite-pick-list-item")
          .shadowRoot.querySelector<HTMLElement>(selector);

        if (partMethod) {
          part[partMethod]();
        }
      },
      partSelector,
      partMethodToInvoke
    );
  }

  it("allows for easy removal", async () => {
    const page = await newE2EPage({
      html: `<calcite-value-list-item label="test" value="example" removable></calcite-value-list-item>`
    });

    const item = await page.find("calcite-value-list-item");
    const removeEventSpy = await item.spyOnEvent("calciteListItemRemove");

    await queryWrappedPickListPart(page, `.${PICK_LIST_ITEM_CSS.remove}`, "click");

    expect(removeEventSpy).toHaveReceivedEventTimes(1);
  });

  it("supports adding start-actions", async () => {
    const page = await newE2EPage({
      html: `
      <calcite-value-list-item label="test" description="example">
        <calcite-action text="test" slot="actions-start"></calcite-action>
      </calcite-value-list-item>`
    });

    const actionsNodeStart = await queryWrappedPickListPart(page, `.${PICK_LIST_ITEM_CSS.actionsStart}`);

    expect(actionsNodeStart).not.toBeNull();
  });

  it("supports adding end-actions", async () => {
    const page = await newE2EPage({
      html: `
      <calcite-value-list-item label="test" description="example">
        <calcite-action text="test" slot="actions-end"></calcite-action>
      </calcite-value-list-item>`
    });

    const actionsNodeEnd = await queryWrappedPickListPart(page, `.${PICK_LIST_ITEM_CSS.actionsEnd}`);

    expect(actionsNodeEnd).not.toBeNull();
  });
});
