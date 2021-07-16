import { newE2EPage } from "@stencil/core/testing";
import { accessible, defaults, renders } from "../../tests/commonTests";

describe("calcite-graph", () => {
  it("renders", async () => renders(`<calcite-graph></calcite-graph>`));

  it("is accessible", async () => accessible(`<calcite-graph></calcite-graph>`));

  it("is accessible: with data", async () => {
    const html = "<calcite-graph></calcite-graph>";
    const page = await newE2EPage({
      html
    });

    await page.$eval("calcite-graph", (elm: any) => {
      elm.data = [
        [0, 4],
        [1, 7],
        [4, 6],
        [6, 2]
      ];
    });

    await page.waitForChanges();

    await accessible(html, page);
  });

  it("has property defaults", async () =>
    defaults("calcite-graph", [
      {
        propertyName: "width",
        defaultValue: 300
      },
      {
        propertyName: "height",
        defaultValue: 100
      },
      {
        propertyName: "data",
        defaultValue: []
      }
    ]));

  it("draws an area graph", async () => {
    const page = await newE2EPage();
    await page.setContent(`<calcite-graph></calcite-graph>`);
    await page.$eval("calcite-graph", (elm: any) => {
      elm.data = [
        [0, 4],
        [1, 7],
        [4, 6],
        [6, 2]
      ];
    });
    await page.waitForChanges();
    const path = await page.find("calcite-graph >>> path");
    const d = path.getAttribute("d");
    expect(d).toBe(
      "M 0,60 L 0,20 L 0,20 C 16.666666666666664,-10.000000000000014 33.333333333333336,-40 50,-40 C 100,-40 150,-33.33333333333334 200,-20 C 233.33333333333334,-11.111111111111114 266.66666666666663,24.444444444444443 300,60 L 300,60 Z"
    );
  });

  it("uses color-stops when provided", async () => {
    const page = await newE2EPage();
    await page.setContent(`<calcite-graph></calcite-graph>`);
    await page.$eval("calcite-graph", (elm: any) => {
      elm.data = [
        [0, 4],
        [1, 7],
        [4, 6],
        [6, 2]
      ];
      elm.colorStops = [[0, 'red'], [0.5, 'green'], [1, 'blue']];
    });

    await page.waitForChanges();

    const linearGradient = await page.find('calcite-graph >>> linearGradient');
    const linearGradientId = linearGradient.getAttribute('id');

    const path = await page.find('calcite-graph >>> path');
    const fill = path.getAttribute('fill');

    expect(fill).toBe(`url(#${linearGradientId})`);
  });
});
