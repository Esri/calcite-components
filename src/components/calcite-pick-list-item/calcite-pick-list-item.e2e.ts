import { CSS } from "./resources";
import { accessible, renders } from "../../tests/commonTests";
import { newE2EPage } from "@stencil/core/testing";
import { html } from "../../tests/utils";

describe("calcite-pick-list-item", () => {
  it("renders", async () => renders("calcite-pick-list-item"));

  it("is accessible", async () => {
    await accessible(html`
      <calcite-pick-list>
        <calcite-pick-list-item label="test" description="a number" value="one"></calcite-pick-list-item>
      </calcite-pick-list>
    `);

    await accessible(html`
      <calcite-pick-list>
        <calcite-pick-list-item label="test" description="a number" value="one" selected></calcite-pick-list-item>
      </calcite-pick-list>
    `);

    await accessible(html`
      <calcite-pick-list>
        <calcite-pick-list-item label="test" description="a number" value="one" removable></calcite-pick-list-item>
      </calcite-pick-list>
    `);
  });

  it("should toggle selected attribute when clicked", async () => {
    const page = await newE2EPage({ html: `<calcite-pick-list-item label="test"></calcite-pick-list-item>` });

    const item = await page.find("calcite-pick-list-item");
    expect(await item.getProperty("selected")).toBe(false);

    await item.click();
    expect(await item.getProperty("selected")).toBe(true);

    await item.click();
    expect(await item.getProperty("selected")).toBe(false);
  });

  it("should toggle selected attribute when icon is clicked", async () => {
    const page = await newE2EPage({
      html: `<calcite-pick-list-item label="test" icon="circle"></calcite-pick-list-item>`
    });

    const item = await page.find("calcite-pick-list-item");
    expect(await item.getProperty("selected")).toBe(false);

    const icon = await page.find(`calcite-pick-list-item >>> .${CSS.icon}`);
    await icon.click();
    expect(await item.getProperty("selected")).toBe(true);

    await icon.click();
    expect(await item.getProperty("selected")).toBe(false);
  });

  it("should fire event calciteListItemChange when item is clicked", async () => {
    const page = await newE2EPage({
      html: `<calcite-pick-list-item label="test" value="example"></calcite-pick-list-item>`
    });
    const item = await page.find("calcite-pick-list-item");
    await page.evaluate(() => {
      document.addEventListener("calciteListItemChange", (event: CustomEvent): void => {
        (window as any).eventDetail = event.detail;
      });
    });

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
      html: `<calcite-pick-list-item label="test" value="example" disable-deselect selected></calcite-pick-list-item>`
    });
    const item = await page.find("calcite-pick-list-item");

    await item.click();

    expect(await item.getProperty("selected")).toBe(true);
  });

  it("prevents selection when disableSelect is true", async () => {
    const page = await newE2EPage({
      html: `<calcite-pick-list-item label="test" value="example" disable-select></calcite-pick-list-item>`
    });
    const item = await page.find("calcite-pick-list-item");

    await item.click();

    expect(await item.getProperty("selected")).toBe(false);
  });

  it("allows for easy removal", async () => {
    const page = await newE2EPage({
      html: `<calcite-pick-list-item label="test" value="example" removable></calcite-pick-list-item>`
    });

    const removeButton = await page.find(`calcite-pick-list-item >>> .${CSS.remove}`);

    expect(removeButton).toBeTruthy();

    const item = await page.find("calcite-pick-list-item");
    const removeEventSpy = await item.spyOnEvent("calciteListItemRemove");
    await removeButton.click();

    expect(removeEventSpy).toHaveReceivedEventTimes(1);
  });

  it("should not render actions--end if there are no end actions", async () => {
    const page = await newE2EPage({
      html: `<calcite-pick-list-item label="test" description="example"></calcite-pick-list-item>`
    });

    const actionsNodeEnd = await page.find(`calcite-pick-list-item >>> .${CSS.actionsEnd}`);

    expect(actionsNodeEnd).toBeNull();
  });

  it("should not render actions--start if there are no start actions", async () => {
    const page = await newE2EPage({
      html: `<calcite-pick-list-item label="test" description="example"></calcite-pick-list-item>`
    });

    const actionsNodeStart = await page.find(`calcite-pick-list-item >>> .${CSS.actionsStart}`);

    expect(actionsNodeStart).toBeNull();
  });

  it("should render actions--end if there are end actions", async () => {
    const page = await newE2EPage({
      html: `
      <calcite-pick-list-item label="test" description="example">
        <calcite-action text="test" slot="actions-end"></calcite-action>
      </calcite-pick-list-item>`
    });

    const actionsNodeEnd = await page.find(`calcite-pick-list-item >>> .${CSS.actionsEnd}`);

    expect(actionsNodeEnd).not.toBeNull();
  });

  it("should render actions--start if there are start actions", async () => {
    const page = await newE2EPage({
      html: `
      <calcite-pick-list-item label="test" description="example">
        <calcite-action text="test" slot="actions-start"></calcite-action>
      </calcite-pick-list-item>`
    });

    const actionsNodeStart = await page.find(`calcite-pick-list-item >>> .${CSS.actionsStart}`);

    expect(actionsNodeStart).not.toBeNull();
  });
});
