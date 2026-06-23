export type Role = "OWNER" | "ACCOUNTANT" | "VIEWER";

export type Membership = {
  businessId: string;
  tradeName: string;
  role: Role;
  gstin: string | null;
  stateCode: string;
};

export type User = {
  id: string;
  email: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
  memberships: Membership[];
};

export type GstinType = "REGULAR" | "COMPOSITION" | "UNREGISTERED";

export type Business = {
  id: string;
  tradeName: string;
  legalName: string | null;
  gstin: string | null;
  gstinType: GstinType;
  address: string | null;
  stateCode: string;
  phone: string | null;
  logoUrl: string | null;
  invoicePrefix: string;
  role: Role;
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string | null;
  gstin: string | null;
  stateCode: string | null;
  billingAddress: string | null;
};

export type Product = {
  id: string;
  name: string;
  hsnCode: string | null;
  unit: string;
  sellingPrice: number;
  gstRate: number;
  quantity: number;
  location: string | null;
};

export type GstRate = 0 | 5 | 12 | 18 | 28;

export type PaymentMode = "CASH" | "UPI" | "CARD" | "CREDIT";

export type InvoiceStatus = "ISSUED" | "CANCELLED";

export type InvoiceTemplateId = "CLASSIC" | "MODERN" | "COMPACT";

export type InvoiceListItem = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string | null;
  grandTotal: number;
  status: InvoiceStatus;
  paymentMode: PaymentMode;
  createdAt: string;
};

export type InvoicesResponse = {
  data: InvoiceListItem[];
  total: number;
  page: number;
  limit: number;
};

export type InvoiceItem = {
  id: string;
  nameSnapshot: string;
  hsnSnapshot: string | null;
  unitSnapshot: string | null;
  quantity: number;
  unitPrice: number;
  discount: number;
  gstRate: number;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  lineTotal: number;
};

export type InvoiceBusiness = {
  tradeName: string;
  legalName: string | null;
  gstin: string | null;
  address: string | null;
  stateCode: string;
  phone: string | null;
  logoUrl: string | null;
};

export type InvoiceCustomer = {
  id: string;
  name: string;
  gstin: string | null;
  billingAddress: string | null;
  stateCode: string | null;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  documentType: string;
  transactionType: string;
  business: InvoiceBusiness;
  customer: InvoiceCustomer | null;
  items: InvoiceItem[];
  subtotal: number;
  discountTotal: number;
  taxableAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  notes: string | null;
  status: InvoiceStatus;
  templateId: InvoiceTemplateId;
  pdfUrl: string | null;
  createdAt: string;
};

export type CreateInvoiceItem = {
  productId?: string;
  name: string;
  hsn?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  gstRate: GstRate;
};

export type CreateInvoicePayload = {
  clientBillId: string;
  customerId?: string;
  invoiceDate: string;
  paymentMode: PaymentMode;
  templateId?: InvoiceTemplateId;
  notes?: string;
  items: CreateInvoiceItem[];
};

export type CreateCustomerPayload = {
  name: string;
  phone?: string;
  gstin?: string;
  stateCode?: string;
  billingAddress?: string;
};

export type CreateProductPayload = {
  name: string;
  sellingPrice: number;
  gstRate: GstRate;
  unit: string;
  hsnCode?: string;
  category?: string;
  quantity?: number;
  location?: string;
};

export type CreateBusinessPayload = {
  tradeName: string;
  stateCode: string;
  invoicePrefix: string;
  legalName?: string;
  gstin?: string;
  address?: string;
  phone?: string;
};

export type UpdateBusinessPayload = {
  tradeName?: string;
  legalName?: string | null;
  gstin?: string | null;
  gstinType?: GstinType;
  address?: string | null;
  stateCode?: string;
  phone?: string | null;
  invoicePrefix?: string;
};

export type Member = {
  id: string;
  userId: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
};

export type AddMemberPayload = {
  email: string;
  password: string;
  phone?: string;
  role: "ACCOUNTANT" | "VIEWER";
};

export type InvoiceFilters = {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  from?: string;
  to?: string;
  search?: string;
};

export type LineItem = {
  id: string;
  productId?: string;
  name: string;
  hsn: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  gstRate: GstRate;
};

export type GSTInput = {
  sellerGSTIN: string | null;
  sellerStateCode: string;
  buyerStateCode: string | null;
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    gstRate: number;
  }[];
};

export type GSTLineOutput = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineSubtotal: number;
  discount: number;
  taxableValue: number;
  gstRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  lineTotal: number;
};

export type GSTSummary = {
  subtotal: number;
  discountTotal: number;
  taxableAmount: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  grandTotal: number;
};

export type GSTOutput = {
  documentType: "TAX_INVOICE" | "BILL_OF_SUPPLY";
  transactionType: "INTRA_STATE" | "INTER_STATE";
  lines: GSTLineOutput[];
  summary: GSTSummary;
};

export type OfflineInvoice = {
  id: string;
  payload: CreateInvoicePayload;
  createdAt: string;
  retryCount: number;
};
