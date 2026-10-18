const test = require("node:test");
const assert = require("node:assert/strict");
const { validateRow, validateRows } = require("../src/services/validation.service");

function validRow(overrides = {}) {
  return {
    transaction_id: "TXN001",
    customer_name: "Aarav",
    account_number: "001234567890",
    amount: "100.50",
    ...overrides,
  };
}

test("accepts a valid row", () => {
  assert.deepEqual(validateRow(validRow()), []);
});

test("rejects missing required fields", () => {
  assert.deepEqual(validateRow(validRow({ customer_name: "" })), [
    "customer_name is required",
  ]);
});

test("rejects amount zero", () => {
  assert.deepEqual(validateRow(validRow({ amount: "0" })), [
    "amount must be greater than 0",
  ]);
});

test("rejects a negative amount", () => {
  assert.deepEqual(validateRow(validRow({ amount: "-10" })), [
    "amount must be greater than 0",
  ]);
});

test("rejects a non-numeric amount", () => {
  assert.deepEqual(validateRow(validRow({ amount: "abc" })), [
    "amount must be a number",
  ]);
});

test("rejects amounts with more than two decimal places", () => {
  assert.deepEqual(validateRow(validRow({ amount: "10.123" })), [
    "amount can have max 13 digits and 2 decimal places",
  ]);
});

test("rejects a duplicate transaction id inside the file", () => {
  const result = validateRows([validRow(), validRow({ customer_name: "Meera" })]);
  assert.equal(result.validRows.length, 1);
  assert.deepEqual(result.errors[0].reason, ["Duplicate transaction_id in file"]);
});

test("an invalid row id does not block a later valid row with the same id", () => {
  const result = validateRows([
    validRow({ amount: "0" }),
    validRow({ customer_name: "Meera", amount: "200" }),
  ]);

  assert.equal(result.errors.length, 1);
  assert.equal(result.validRows.length, 1);
  assert.equal(result.validRows[0].transaction_id, "TXN001");
});
