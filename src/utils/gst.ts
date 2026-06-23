import Decimal from "decimal.js";
import type { GSTInput, GSTOutput, GSTLineOutput, GSTSummary } from "../types";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export function calculateGST(input: GSTInput): GSTOutput {
  const { sellerGSTIN, sellerStateCode, buyerStateCode, items } = input;

  const allZeroRates = items.every((item) => item.gstRate === 0);
  const documentType: GSTOutput["documentType"] =
    sellerGSTIN === null || allZeroRates ? "BILL_OF_SUPPLY" : "TAX_INVOICE";

  const isInterState =
    buyerStateCode !== null && buyerStateCode !== sellerStateCode;
  const transactionType: GSTOutput["transactionType"] = isInterState
    ? "INTER_STATE"
    : "INTRA_STATE";

  const lines: GSTLineOutput[] = items.map((item) => {
    const quantity = new Decimal(item.quantity);
    const unitPrice = new Decimal(item.unitPrice);
    const discount = new Decimal(item.discount);
    const gstRate = new Decimal(item.gstRate);

    const lineSubtotal = quantity.times(unitPrice);
    const taxableValue = lineSubtotal.minus(discount);

    let cgstAmount = new Decimal(0);
    let sgstAmount = new Decimal(0);
    let igstAmount = new Decimal(0);
    let cgstRate = new Decimal(0);
    let sgstRate = new Decimal(0);
    let igstRate = new Decimal(0);

    if (documentType === "TAX_INVOICE") {
      if (transactionType === "INTRA_STATE") {
        cgstRate = gstRate.dividedBy(2);
        sgstRate = gstRate.dividedBy(2);
        cgstAmount = taxableValue.times(cgstRate).dividedBy(100);
        sgstAmount = taxableValue.times(sgstRate).dividedBy(100);
      } else {
        igstRate = gstRate;
        igstAmount = taxableValue.times(igstRate).dividedBy(100);
      }
    }

    const lineTotal = taxableValue
      .plus(cgstAmount)
      .plus(sgstAmount)
      .plus(igstAmount);

    return {
      name: item.name,
      quantity: quantity.toNumber(),
      unitPrice: unitPrice.toNumber(),
      lineSubtotal: lineSubtotal.toDecimalPlaces(2).toNumber(),
      discount: discount.toDecimalPlaces(2).toNumber(),
      taxableValue: taxableValue.toDecimalPlaces(2).toNumber(),
      gstRate: gstRate.toNumber(),
      cgstRate: cgstRate.toNumber(),
      sgstRate: sgstRate.toNumber(),
      igstRate: igstRate.toNumber(),
      cgstAmount: cgstAmount.toDecimalPlaces(2).toNumber(),
      sgstAmount: sgstAmount.toDecimalPlaces(2).toNumber(),
      igstAmount: igstAmount.toDecimalPlaces(2).toNumber(),
      lineTotal: lineTotal.toDecimalPlaces(2).toNumber(),
    };
  });

  const summary: GSTSummary = lines.reduce(
    (acc, line) => ({
      subtotal: new Decimal(acc.subtotal)
        .plus(line.lineSubtotal)
        .toDecimalPlaces(2)
        .toNumber(),
      discountTotal: new Decimal(acc.discountTotal)
        .plus(line.discount)
        .toDecimalPlaces(2)
        .toNumber(),
      taxableAmount: new Decimal(acc.taxableAmount)
        .plus(line.taxableValue)
        .toDecimalPlaces(2)
        .toNumber(),
      cgstTotal: new Decimal(acc.cgstTotal)
        .plus(line.cgstAmount)
        .toDecimalPlaces(2)
        .toNumber(),
      sgstTotal: new Decimal(acc.sgstTotal)
        .plus(line.sgstAmount)
        .toDecimalPlaces(2)
        .toNumber(),
      igstTotal: new Decimal(acc.igstTotal)
        .plus(line.igstAmount)
        .toDecimalPlaces(2)
        .toNumber(),
      grandTotal: new Decimal(acc.grandTotal)
        .plus(line.lineTotal)
        .toDecimalPlaces(2)
        .toNumber(),
    }),
    {
      subtotal: 0,
      discountTotal: 0,
      taxableAmount: 0,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0,
      grandTotal: 0,
    }
  );

  return {
    documentType,
    transactionType,
    lines,
    summary,
  };
}

export const INDIAN_STATES: { code: string; name: string }[] = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "26", name: "Dadra & Nagar Haveli and Daman & Diu" },
  { code: "27", name: "Maharashtra" },
  { code: "28", name: "Andhra Pradesh (Old)" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh (New)" },
  { code: "38", name: "Ladakh" },
];

export const GST_RATES: number[] = [0, 5, 12, 18, 28];
