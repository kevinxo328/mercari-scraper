import {test} from "@playwright/test";
import {getMercariUrl} from "../utils/mercari";

test.beforeEach(async ({page}) => {
  // Set the viewport size to 1280 x 7200 to make sure the item cells are fully loaded.
  await page.setViewportSize({width: 1280, height: 7200});
});

test("Crawl items", async ({page}) => {
  const keyword = "ancellm";
  await page.goto(getMercariUrl(keyword));

  // If the page has a dialog, close it
  const dialog = await page.getByRole("dialog");
  if (dialog) {
    await dialog.waitFor();
    const closeButton = await dialog.getByLabel(/Close/);
    await closeButton.click();

    // Wait for the dialog to close
    await page.waitForTimeout(2000);
  }

  const itemCells = await page.getByTestId("item-cell");
  const itemCount = await itemCells.count();

  if (itemCount > 0) {
    for (let i = 0; i < itemCount; i++) {
      const itemCell = itemCells.nth(i);
      const priceElement = await itemCell.locator(".merPrice");
      const priceText = (await priceElement.innerText()).split("\n");
      const mercariHost = "https://jp.mercari.com";

      const title = await itemCell
        .getByTestId("thumbnail-item-name")
        .innerText();
      const link =
        mercariHost +
        (await itemCell.getByTestId("thumbnail-link").getAttribute("href"));
      const imageUrl = await itemCell.locator("img").getAttribute("src");
      const currency = priceText[0].replace("$", "");
      const price = priceText[1];
      const itemId = link.split("/").pop();

      console.log(`Item ${i + 1}: ${title}`);
      console.log(`Link: ${link}`);
      console.log(`Image URL: ${imageUrl}`);
      console.log(`Price: ${currency} ${price}`);
      console.log(`Item ID: ${itemId}`);
    }
  } else {
    console.log(`No items found for keyword: ${keyword}`);
  }
});
