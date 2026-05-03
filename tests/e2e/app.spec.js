import { test, expect } from "@playwright/test";
import path from "node:path";

const blueberriesPhoto = path.resolve("tests/fixtures/photo-blueberries.svg");
const unknownPhoto = path.resolve("tests/fixtures/photo-unknown.svg");

test("loads the app shell", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Glycemic Load Calculator | GI and GL Food Search");
  await expect(page.getByRole("heading", { name: "Glycemic Load Calculator", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Calculate glycemic load from GI and serving size" })).toBeVisible();
});

test("searches for a food and calculates carbs and glycemic load from an ounce serving", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("searchbox", { name: "Food" }).fill("blueberries");
  await page.getByRole("button", { name: "Blueberries GI 45 - Low" }).click();
  await page.getByRole("spinbutton", { name: "Serving size" }).fill("2");
  await page.getByRole("combobox", { name: "Unit" }).selectOption("oz");

  await expect(page.getByRole("heading", { name: "Blueberries" })).toBeVisible();
  await expect(page.getByText("Glycemic index", { exact: true })).toBeVisible();
  await expect(page.getByText("Carbohydrates", { exact: true })).toBeVisible();
  await expect(page.getByText("Glycemic load", { exact: true })).toBeVisible();
  await expect(page.getByText("6.2 g")).toBeVisible();
  await expect(page.getByText("2.79")).toBeVisible();
});

test("looks up a barcode, confirms a candidate, and calculates GL", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Barcode" }).fill("1234567890123");
  await page.getByRole("button", { name: "Look up barcode" }).click();

  await expect(page.getByRole("heading", { name: "Confirm the matching food" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Blueberries GI 45 Exact match" })).toBeVisible();

  await page.getByRole("button", { name: "Blueberries GI 45 Exact match" }).click();

  await expect(page.getByRole("heading", { name: "Blueberries" })).toBeVisible();
  await expect(page.getByText("4.95")).toBeVisible();
});

test("uploads a photo, confirms a candidate, and calculates GL", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Food photo").setInputFiles(blueberriesPhoto);
  await page.getByRole("button", { name: "Identify photo" }).click();

  await expect(page.getByRole("heading", { name: "Confirm the matching food" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Blueberries GI 45 Exact match" })).toBeVisible();

  await page.getByRole("button", { name: "Blueberries GI 45 Exact match" }).click();

  await expect(page.getByRole("heading", { name: "Blueberries" })).toBeVisible();
  await expect(page.getByText("Glycemic load", { exact: true })).toBeVisible();
});

test("shows a recoverable error for an invalid barcode", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Barcode" }).fill("abc");
  await page.getByRole("button", { name: "Look up barcode" }).click();

  await expect(page.getByRole("alert")).toContainText("Invalid barcode");
  await expect(page.getByRole("alert")).toContainText("8 to 14 digits");
});

test("shows a recoverable error for an unknown barcode", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Barcode" }).fill("0000000000000");
  await page.getByRole("button", { name: "Look up barcode" }).click();

  await expect(page.getByRole("alert")).toContainText("Barcode not found");
  await expect(page.getByRole("alert")).toContainText("No product was found");
});

test("shows a recoverable error for an unrecognized photo", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Food photo").setInputFiles(unknownPhoto);
  await page.getByRole("button", { name: "Identify photo" }).click();

  await expect(page.getByRole("alert")).toContainText("Could not identify the photo");
  await expect(page.getByRole("alert")).toContainText("could not find a confident food match");
});
