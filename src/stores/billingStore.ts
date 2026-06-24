import { create } from "zustand";
import type { LineItem, Customer, GstRate } from "../types";
import { generateId } from "../utils/id";

type BillingState = {
  customerId: string | undefined;
  customerName: string;
  selectedCustomer: Customer | null;
  invoiceDate: string;
  paymentMode: "CASH" | "UPI" | "CARD" | "CREDIT";
  notes: string;
  items: LineItem[];
  clientBillId: string;

  setCustomer: (customer: Customer | null) => void;
  clearCustomer: () => void;
  setInvoiceDate: (date: string) => void;
  setPaymentMode: (mode: "CASH" | "UPI" | "CARD" | "CREDIT") => void;
  setNotes: (notes: string) => void;
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<LineItem>) => void;
  setItemFromProduct: (
    itemId: string,
    product: {
      id: string;
      name: string;
      hsnCode: string | null;
      unit: string;
      sellingPrice: number;
      gstRate: number;
    }
  ) => void;
  resetBilling: () => void;
};

const createEmptyItem = (): LineItem => ({
  id: generateId(),
  name: "",
  hsn: "",
  unit: "PCS",
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  gstRate: 18 as GstRate,
});

const getInitialState = () => ({
  customerId: undefined,
  customerName: "",
  selectedCustomer: null,
  invoiceDate: new Date().toISOString().split("T")[0],
  paymentMode: "CASH" as const,
  notes: "",
  items: [createEmptyItem()],
  clientBillId: generateId(),
});

export const useBillingStore = create<BillingState>((set) => ({
  ...getInitialState(),

  setCustomer: (customer) =>
    set({
      customerId: customer?.id,
      customerName: customer?.name ?? "",
      selectedCustomer: customer,
    }),

  clearCustomer: () =>
    set({
      customerId: undefined,
      customerName: "",
      selectedCustomer: null,
    }),

  setInvoiceDate: (date) => set({ invoiceDate: date }),

  setPaymentMode: (mode) => set({ paymentMode: mode }),

  setNotes: (notes) => set({ notes }),

  addItem: () =>
    set((state) => ({
      items: [...state.items, createEmptyItem()],
    })),

  removeItem: (id) =>
    set((state) => {
      if (state.items.length <= 1) return state;
      return { items: state.items.filter((item) => item.id !== id) };
    }),

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  setItemFromProduct: (itemId, product) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              productId: product.id,
              name: product.name,
              hsn: product.hsnCode ?? "",
              unit: product.unit,
              unitPrice: product.sellingPrice,
              gstRate: product.gstRate as GstRate,
            }
          : item
      ),
    })),

  resetBilling: () => set(getInitialState()),
}));
