# Rakhat Web Frontend — Complete Extraction for React Native Handoff

## 1. Screens Inventory

### 1.1 Public Routes

#### Landing Page
- **Route path**: `/`
- **File path**: `client/app/page.tsx`
- **Purpose**: Marketing landing page with hero section, features, and CTA to sign up
- **Data fetched**: None
- **User actions**:
  - Click "Log in" → navigates to `/login`
  - Click "Get started free" or "Create your first invoice" → navigates to `/signup`
  - Click "See how it works" → no action (placeholder button)
- **Local state**: None
- **Validation rules**: None
- **Navigation**: Login/Signup buttons in header, CTA buttons in hero

#### Login Page
- **Route path**: `/login`
- **File path**: `client/app/(auth)/login/page.tsx`
- **Purpose**: Authenticate existing users
- **Data fetched**: `POST /auth/login` on form submit
- **User actions**:
  - Submit login form
  - Click "Forgot password?" → navigates to `/forgot-password`
  - Click "Create one" → navigates to `/signup`
- **Local state**:
  ```typescript
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  ```
- **Validation rules**:
  - Email: required, type="email"
  - Password: required
- **Navigation**: On success → `/dashboard` (if has memberships) or `/onboarding` (if no memberships)

#### Signup Page
- **Route path**: `/signup`
- **File path**: `client/app/(auth)/signup/page.tsx`
- **Purpose**: Register new users
- **Data fetched**: `POST /auth/signup` on form submit
- **User actions**:
  - Submit signup form
  - Click "Sign in" → navigates to `/login`
- **Local state**:
  ```typescript
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  ```
- **Validation rules**:
  - Email: required, type="email"
  - Phone: optional, type="tel"
  - Password: required, minLength=8
- **Navigation**: On success → `/onboarding`

#### Forgot Password Page
- **Route path**: `/forgot-password`
- **File path**: `client/app/(auth)/forgot-password/page.tsx`
- **Purpose**: Initiate password reset via phone OTP
- **Data fetched**: `POST /auth/forgot-password` on form submit
- **User actions**:
  - Submit phone number
  - Click "Back to sign in" → navigates to `/login`
- **Local state**:
  ```typescript
  const [phone, setPhone] = useState('')
  ```
- **Validation rules**:
  - Phone: required, type="tel"
- **Navigation**: On success → `/verify-otp?phone={phone}`

#### Verify OTP Page
- **Route path**: `/verify-otp?phone={phone}`
- **File path**: `client/app/(auth)/verify-otp/page.tsx`
- **Purpose**: Verify OTP sent to phone for password reset
- **Data fetched**: `POST /auth/verify-otp` on form submit
- **User actions**:
  - Enter 6-digit OTP and submit
- **Local state**:
  ```typescript
  const [otp, setOtp] = useState('')
  ```
- **Validation rules**:
  - OTP: required, maxLength=6, numeric only (strips non-digits)
- **Navigation**: On success → `/reset-password?token={resetToken}`

#### Reset Password Page
- **Route path**: `/reset-password?token={resetToken}`
- **File path**: `client/app/(auth)/reset-password/page.tsx`
- **Purpose**: Set new password after OTP verification
- **Data fetched**: `POST /auth/reset-password` on form submit
- **User actions**:
  - Enter new password and submit
- **Local state**:
  ```typescript
  const [newPassword, setNewPassword] = useState('')
  ```
- **Validation rules**:
  - New Password: required, minLength=8
- **Navigation**: On success → `/login`

#### 403 Forbidden Page
- **Route path**: `/403`
- **File path**: `client/app/403/page.tsx`
- **Purpose**: Display forbidden access error
- **Data fetched**: None
- **User actions**: None
- **Local state**: None
- **Navigation**: None

### 1.2 Protected Routes (Dashboard)

#### Onboarding Page
- **Route path**: `/onboarding`
- **File path**: `client/app/onboarding/page.tsx`
- **Purpose**: Create first business after signup
- **Data fetched**: `POST /businesses` on form submit
- **User actions**:
  - Fill business details form and submit
- **Local state**:
  ```typescript
  const [tradeName, setTradeName] = useState('')
  const [stateCode, setStateCode] = useState('')
  const [invoicePrefix, setInvoicePrefix] = useState('INV')
  ```
- **Validation rules**:
  - Trade Name: required
  - State Code: required (select from predefined list)
  - Invoice Prefix: required, maxLength=10, auto-uppercased
- **Navigation**: On success → `/dashboard`

#### Dashboard Home
- **Route path**: `/dashboard`
- **File path**: `client/app/dashboard/page.tsx`
- **Purpose**: Display business summary, stats, and recent invoices
- **Data fetched**:
  - `GET /businesses` — list user's businesses
  - `GET /invoices?limit=5` — recent invoices
  - `GET /invoices?from={monthStart}&to={monthEnd}&limit=100` — current month invoices for stats
  - `GET /customers` — total customer count
- **User actions**:
  - Click "New Invoice" → navigates to `/dashboard/sales/invoices/new`
  - Click "View all" → navigates to `/dashboard/sales/invoices`
  - Click on invoice row → navigates to `/dashboard/sales/invoices/{id}`
  - Click "Create your first invoice" (if no invoices) → navigates to `/dashboard/sales/invoices/new`
- **Local state**: None (uses derived state from queries)
- **Validation rules**: None
- **Navigation**: Links to invoice list and detail pages

#### Sales Page (Redirect)
- **Route path**: `/dashboard/sales`
- **File path**: `client/app/dashboard/sales/page.tsx`
- **Purpose**: Redirect to invoices list
- **Data fetched**: None
- **User actions**: None
- **Navigation**: Immediate redirect to `/dashboard/sales/invoices`

#### Invoices List Page
- **Route path**: `/dashboard/sales/invoices`
- **File path**: `client/app/dashboard/sales/invoices/page.tsx`
- **Purpose**: List and filter all invoices
- **Data fetched**: `GET /invoices?page={page}&limit={limit}&status={status}&from={from}&to={to}&search={search}`
- **User actions**:
  - Click "New Invoice" → navigates to `/dashboard/sales/invoices/new`
  - Filter by status (ISSUED/CANCELLED)
  - Filter by date range (from/to)
  - Search by invoice number
  - Paginate (previous/next)
  - Click invoice row → navigates to `/dashboard/sales/invoices/{id}`
- **Local state**:
  ```typescript
  const [filters, setFilters] = useState<InvoiceFilters>({
    page: 1,
    limit: 20,
  })
  ```
- **Validation rules**: None
- **Navigation**: Links to invoice detail and new invoice pages

#### New Invoice Page
- **Route path**: `/dashboard/sales/invoices/new`
- **File path**: `client/app/dashboard/sales/invoices/new/page.tsx`
- **Purpose**: Create a new invoice with customer selection, line items, and GST calculation
- **Data fetched**:
  - `GET /customers?search={query}` — search customers
  - `GET /products?search={query}` — search products
  - `POST /customers` — create new customer inline
  - `POST /invoices` — submit invoice
- **User actions**:
  - Search and select customer (or leave empty for walk-in)
  - Create new customer inline
  - Clear selected customer
  - Set invoice date
  - Select payment mode (CASH/UPI/CARD/CREDIT)
  - Add/remove line items
  - Search and select products for line items
  - Edit line item fields (name, HSN, unit, quantity, price, discount, GST rate)
  - Add notes
  - Cancel → goes back
  - Create Invoice → submits form
- **Local state**:
  ```typescript
  const [customerId, setCustomerId] = useState<string | undefined>()
  const [customerName, setCustomerName] = useState('')
  const [customerQuery, setCustomerQuery] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', gstin: '', stateCode: '' })
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CARD' | 'CREDIT'>('CASH')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<LineItem[]>([...])
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null)
  const [productQuery, setProductQuery] = useState('')
  ```
- **Validation rules**:
  - At least one item with name and quantity > 0 required
  - New customer: name required
- **Navigation**: On success → `/dashboard/sales/invoices/{id}`

#### Invoice Detail Page
- **Route path**: `/dashboard/sales/invoices/[id]`
- **File path**: `client/app/dashboard/sales/invoices/[id]/page.tsx`
- **Purpose**: View invoice details, preview PDF, download PDF, cancel invoice
- **Data fetched**:
  - `GET /invoices/{id}` — invoice details
  - `GET /invoices/{id}/pdf` — PDF URL (on demand)
- **User actions**:
  - Click "Back" → goes back
  - Click "Download PDF" → opens PDF in new tab
  - Click "Cancel Invoice" → shows confirmation, then `PATCH /invoices/{id}/cancel`
- **Local state**:
  ```typescript
  const [showConfirmCancel, setShowConfirmCancel] = useState(false)
  const [downloadPdf, setDownloadPdf] = useState(false)
  ```
- **Validation rules**: None
- **Navigation**: Back button, PDF opens in new tab

#### Customers Page
- **Route path**: `/dashboard/customers`
- **File path**: `client/app/dashboard/customers/page.tsx`
- **Purpose**: List customers and add new customers
- **Data fetched**:
  - `GET /customers?search={query}` — search customers
  - `POST /customers` — create customer
- **User actions**:
  - Search customers
  - Clear search
  - Show/hide new customer form
  - Submit new customer form
  - Cancel new customer form
- **Local state**:
  ```typescript
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', gstin: '', billingAddress: '' })
  ```
- **Validation rules**:
  - Name: required
  - Phone: optional
  - GSTIN: optional, auto-uppercased
  - Billing Address: optional
- **Navigation**: None (single page)

#### Inventory Page
- **Route path**: `/dashboard/inventory`
- **File path**: `client/app/dashboard/inventory/page.tsx`
- **Purpose**: List products and add new products
- **Data fetched**:
  - `GET /products?search={query}` — search products
  - `POST /products` — create product
- **User actions**:
  - Search products
  - Clear search
  - Show/hide new product form
  - Submit new product form
  - Cancel new product form
- **Local state**:
  ```typescript
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    sellingPrice: '',
    gstRate: '18',
    unit: '',
    hsnCode: '',
    category: '',
    quantity: '',
    location: '',
  })
  ```
- **Validation rules**:
  - Name: required
  - Selling Price: required, number >= 0
  - GST Rate: required, one of [0, 5, 12, 18, 28]
  - Unit: required
  - HSN Code: optional
  - Category: optional
  - Quantity: optional, number >= 0
  - Location: optional
- **Navigation**: None (single page)

#### Payments Page (Placeholder)
- **Route path**: `/dashboard/payments`
- **File path**: `client/app/dashboard/payments/page.tsx`
- **Purpose**: Placeholder for future payment tracking feature
- **Data fetched**: None
- **User actions**:
  - Click "View invoices" → navigates to `/dashboard/sales/invoices`
- **Local state**: None
- **Navigation**: Link to invoices

#### Insights Page (Placeholder)
- **Route path**: `/dashboard/insights`
- **File path**: `client/app/dashboard/insights/page.tsx`
- **Purpose**: Placeholder for future analytics feature
- **Data fetched**: None
- **User actions**: None
- **Local state**: None
- **Navigation**: None

#### Team Page
- **Route path**: `/dashboard/team`
- **File path**: `client/app/dashboard/team/page.tsx`
- **Purpose**: Manage team members (add accountants/viewers, remove members)
- **Data fetched**:
  - `GET /members` — list team members
  - `POST /members` — add new member
  - `DELETE /members/{id}` — remove member
- **User actions**:
  - Show/hide add member form
  - Submit add member form
  - Remove member (with confirmation)
- **Local state**:
  ```typescript
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [memberRole, setMemberRole] = useState<'ACCOUNTANT' | 'VIEWER'>('ACCOUNTANT')
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)
  ```
- **Validation rules**:
  - Email: required, type="email"
  - Password: required, minLength=8
  - Role: required, one of ['ACCOUNTANT', 'VIEWER']
- **Access control**: Only OWNER role can access this page
- **Navigation**: None (single page)

#### Settings Page
- **Route path**: `/dashboard/settings`
- **File path**: `client/app/dashboard/settings/page.tsx`
- **Purpose**: View and edit business settings
- **Data fetched**:
  - `GET /businesses/{id}` — get business details
  - `PUT /businesses/{id}` — update business
- **User actions**:
  - Edit form fields (if OWNER)
  - Submit form to save changes
- **Local state**:
  ```typescript
  const [formData, setFormData] = useState({
    tradeName: '',
    legalName: '',
    gstin: '',
    gstinType: 'UNREGISTERED' as 'REGULAR' | 'COMPOSITION' | 'UNREGISTERED',
    address: '',
    stateCode: '',
    phone: '',
    invoicePrefix: '',
  })
  ```
- **Validation rules**:
  - Trade Name: required
  - Legal Name: optional
  - Phone: optional
  - State Code: required
  - Address: optional
  - GSTIN: optional, maxLength=15, auto-uppercased
  - GSTIN Type: one of ['REGULAR', 'COMPOSITION', 'UNREGISTERED']
  - Invoice Prefix: required, maxLength=10, auto-uppercased
- **Access control**: Form fields disabled for non-OWNER roles
- **Navigation**: None (single page)

---

## 2. Global State (Zustand)

### Auth Store
- **File path**: `client/store/authStore.ts`

**Full interface / shape**:
```typescript
type AuthState = {
  userId: string | null
  email: string | null
  accessToken: string | null
  memberships: Membership[]
  activeBusinessId: string | null

  setSession: (p: { userId: string; email: string; accessToken: string; memberships: Membership[] }) => void
  setAccessToken: (accessToken: string) => void
  setActiveBusiness: (businessId: string) => void
  addMembership: (m: Membership) => void
  clearAuth: () => void
}
```

**Membership type** (from `client/shared/types.ts`):
```typescript
export type Role = 'OWNER' | 'ACCOUNTANT' | 'VIEWER'

export type Membership = {
  businessId: string
  tradeName: string
  role: Role
  gstin: string | null
  stateCode: string
}
```

**Every action**:
1. `setSession({ userId, email, accessToken, memberships })` — Populate session after login/signup. Auto-selects first business as active if memberships exist.
2. `setAccessToken(accessToken)` — Replace access token after silent refresh.
3. `setActiveBusiness(businessId)` — Switch active business (used for multi-business users).
4. `addMembership(m)` — Append new membership and make it active (after creating business via onboarding).
5. `clearAuth()` — Clear all auth state on logout or auth failure.

**Persistence**:
- Store is in-memory only (Zustand without persist middleware)
- All data is cleared on page refresh
- Session is restored via `SessionProvider` calling `POST /auth/refresh` on mount

**Derived selector** (exported separately):
```typescript
export const useActiveRole = (): Role | null =>
  useAuthStore((s) =>
    s.activeBusinessId
      ? s.memberships.find((m) => m.businessId === s.activeBusinessId)?.role ?? null
      : null
  )
```

---

## 3. API Client Configuration

- **File path**: `client/lib/api.ts`

**Base URL**:
```typescript
const BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3001/api/v1'
```

**ky instance creation**:
```typescript
export const api = ky.create({
  prefix: BASE_URL,
  hooks: {
    beforeRequest: [...],
    afterResponse: [...],
  },
})
```

### beforeRequest Hook

```typescript
beforeRequest: [
  ({ request }: BeforeRequestState) => {
    const { accessToken, activeBusinessId } = useAuthStore.getState()
    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`)
    }
    if (activeBusinessId) {
      request.headers.set('X-Business-Id', activeBusinessId)
    }
  },
],
```

**What it does**:
1. Reads `accessToken` from Zustand store (in-memory)
2. Sets `Authorization: Bearer {accessToken}` header if token exists
3. Reads `activeBusinessId` from Zustand store
4. Sets `X-Business-Id: {activeBusinessId}` header if business is selected

### afterResponse Hook

```typescript
afterResponse: [
  async ({ request, response }: AfterResponseState) => {
    if (response.status === 401) {
      try {
        const data = await ky
          .post(`${BASE_URL}/auth/refresh`, { credentials: 'include' })
          .json<{ accessToken: string }>()

        useAuthStore.getState().setAccessToken(data.accessToken)

        const retryHeaders = new Headers(request.headers)
        retryHeaders.set('Authorization', `Bearer ${data.accessToken}`)
        return fetch(new Request(request.url, {
          method: request.method,
          headers: retryHeaders,
          body: request.bodyUsed ? null : request.body,
          credentials: request.credentials,
        }))
      } catch {
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
      }
    }
  },
],
```

**Refresh flow**:
1. Triggered when any API response returns 401
2. Calls `POST /auth/refresh` with `credentials: 'include'` (sends httpOnly refresh token cookie)
3. On success: stores new access token in Zustand, retries original request with new token
4. On failure: clears auth state and redirects to `/login`

### X-Business-Id Sourcing

The `X-Business-Id` header is:
1. Read from `useAuthStore.getState().activeBusinessId`
2. Set during `setSession()` (auto-selects first business)
3. Updated via `setActiveBusiness()` when user switches businesses
4. Attached to every API request via the `beforeRequest` hook

---

## 4. Auth Flow

### Register

**Fields collected**:
- `email` (required)
- `password` (required, min 8 chars)
- `phone` (optional)

**API call**:
```
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "phone": "9876543210"  // optional
}
```

**Response shape**:
```typescript
{
  accessToken: string
  user: { id: string; email: string }
  memberships: Membership[]
}
```

**On success**:
1. `setSession()` is called with response data
2. Refresh token is stored as httpOnly cookie by server (handled automatically)
3. Redirect to `/onboarding`

**On failure**:
- Error message displayed from `signup.error.message`

### Login

**Fields collected**:
- `email` (required)
- `password` (required)

**API call**:
```
POST /auth/login
Content-Type: application/json
credentials: include

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response shape**: Same as register

**On success**:
1. `setSession()` is called with response data
2. Redirect to `/dashboard` if memberships exist, else `/onboarding`

**On failure**:
- Error message displayed from `login.error.message`

### Token Storage

- **Access token**: Stored in Zustand (memory only) at `authStore.accessToken`
- **Refresh token**: Stored as httpOnly cookie by server (not accessible to JavaScript)
  - Cookie options: `httpOnly: true, secure: true (in prod), sameSite: 'lax', maxAge: 7 days`

### Session Restoration (SessionProvider)

**File path**: `client/components/SessionProvider.tsx`

On app mount:
```typescript
useEffect(() => {
  if (restored.current) return
  restored.current = true

  if (accessToken) return  // Already has token, skip

  ky.post(`${BASE_URL}/auth/refresh`, { credentials: 'include' })
    .json<RefreshResponse>()
    .then((data) => {
      setSession({
        userId: data.user.id,
        email: data.user.email,
        accessToken: data.accessToken,
        memberships: data.memberships,
      })
    })
    .catch(() => {
      if (!useAuthStore.getState().accessToken) {
        clearAuth()
      }
    })
}, [])
```

### Protected Routes

**How protection works**:
- Dashboard layout (`client/app/dashboard/layout.tsx`) renders `Sidebar` component
- `Sidebar` uses `useActiveRole()` hook which returns `null` if no session
- When role is `null`, sidebar shows loading skeleton
- The `afterResponse` hook handles 401 errors by attempting refresh, then redirecting to `/login` on failure

**Route-level role checks**:
- Team page: Checks `if (role !== 'OWNER')` and shows message if not owner
- Settings page: Disables form fields with `disabled={!isOwner}`
- Sidebar items are filtered by role: `visibleItems = sidebarItems.filter((item) => item.roles.includes(role))`

### Logout

**API call**:
```
POST /auth/logout
credentials: include
```

**What is cleared**:
1. Server clears the refresh token cookie
2. `clearAuth()` sets all auth state to null/empty
3. React Query cache is NOT explicitly cleared

**Where user is sent**: `/login`

---

## 5. All API Calls

### Auth Endpoints

#### POST /auth/signup
- **Request body**: `{ email: string; password: string; phone?: string }`
- **Response**: `{ accessToken: string; user: { id: string; email: string }; memberships: Membership[] }`
- **Called from**: `client/hooks/useAuth.ts` → `useSignup()`
- **On success**: Calls `setSession()`, then redirect to `/onboarding`
- **On error**: Error displayed in form

#### POST /auth/login
- **Request body**: `{ email: string; password: string }`
- **Response**: `{ accessToken: string; user: { id: string; email: string }; memberships: Membership[] }`
- **Called from**: `client/hooks/useAuth.ts` → `useLogin()`
- **On success**: Calls `setSession()`, then redirect based on memberships
- **On error**: Error displayed in form

#### POST /auth/logout
- **Request body**: None
- **Response**: `void`
- **Called from**: `client/hooks/useAuth.ts` → `useLogout()`
- **On success/error**: Calls `clearAuth()`

#### POST /auth/refresh
- **Request body**: None (uses httpOnly cookie)
- **Request headers**: `credentials: 'include'`
- **Response**: `{ accessToken: string; user: { id: string; email: string }; memberships: Membership[] }`
- **Called from**: 
  - `client/components/SessionProvider.tsx` (on mount)
  - `client/lib/api.ts` (on 401 response)
- **On success**: Updates access token
- **On error**: Clears auth, redirects to login

#### POST /auth/forgot-password
- **Request body**: `{ phone: string }`
- **Response**: `{ message: string }`
- **Called from**: `client/hooks/useAuth.ts` → `useForgotPassword()`
- **On success**: Navigate to verify-otp page
- **On error**: Error displayed in form

#### POST /auth/verify-otp
- **Request body**: `{ phone: string; otp: string }`
- **Response**: `{ resetToken: string }`
- **Called from**: `client/hooks/useAuth.ts` → `useVerifyOtp()`
- **On success**: Navigate to reset-password page with token
- **On error**: Error displayed in form

#### POST /auth/reset-password
- **Request body**: `{ resetToken: string; newPassword: string }`
- **Response**: `{ message: string }`
- **Called from**: `client/hooks/useAuth.ts` → `useResetPassword()`
- **On success**: Navigate to login page
- **On error**: Error displayed in form

### Business Endpoints

#### GET /businesses
- **Request headers**: `Authorization: Bearer {token}`
- **Response**: `{ memberships: Membership[] }`
- **Called from**: `client/hooks/useBusinesses.ts` → `useBusinesses()`
- **On success**: Data used for sidebar business switcher

#### GET /businesses/{id}
- **Request headers**: `Authorization: Bearer {token}`
- **Response**: 
  ```typescript
  {
    id: string
    tradeName: string
    legalName: string | null
    gstin: string | null
    gstinType: 'REGULAR' | 'COMPOSITION' | 'UNREGISTERED'
    address: string | null
    stateCode: string
    phone: string | null
    logoUrl: string | null
    invoicePrefix: string
    role: Role
    createdAt: string
  }
  ```
- **Called from**: `client/hooks/useBusinesses.ts` → `useBusiness()`
- **On success**: Data used in Settings page form

#### POST /businesses
- **Request body**: 
  ```typescript
  {
    tradeName: string
    stateCode: string
    invoicePrefix: string
    legalName?: string
    gstin?: string
    address?: string
    phone?: string
  }
  ```
- **Response**: `{ business: { id: string; tradeName: string }; membership: Membership }`
- **Called from**: `client/hooks/useBusinesses.ts` → `useCreateBusiness()`
- **On success**: Calls `addMembership()`, navigate to dashboard

#### PUT /businesses/{id}
- **Request body**:
  ```typescript
  {
    tradeName?: string
    legalName?: string | null
    gstin?: string | null
    gstinType?: 'REGULAR' | 'COMPOSITION' | 'UNREGISTERED'
    address?: string | null
    stateCode?: string
    phone?: string | null
    invoicePrefix?: string
  }
  ```
- **Response**: Same as GET /businesses/{id}
- **Called from**: `client/hooks/useBusinesses.ts` → `useUpdateBusiness()`
- **On success**: Invalidates business queries, shows success message
- **On error**: Error displayed in form

### Invoice Endpoints

#### GET /invoices
- **Request headers**: `Authorization`, `X-Business-Id`
- **Query params**: `page`, `limit`, `status`, `from`, `to`, `search`
- **Response**:
  ```typescript
  {
    data: Array<{
      id: string
      invoiceNumber: string
      invoiceDate: string
      customerName: string | null
      grandTotal: number
      status: string
      paymentMode: string
      createdAt: string
    }>
    total: number
    page: number
    limit: number
  }
  ```
- **Called from**: `client/hooks/useInvoices.ts` → `useInvoices()`
- **Used by**: Dashboard, Invoices list page

#### GET /invoices/{id}
- **Request headers**: `Authorization`, `X-Business-Id`
- **Response**:
  ```typescript
  {
    id: string
    invoiceNumber: string
    invoiceDate: string
    documentType: string
    transactionType: string
    business: {
      tradeName: string
      legalName: string | null
      gstin: string | null
      address: string | null
      stateCode: string
      phone: string | null
      logoUrl: string | null
    }
    customer: {
      id: string
      name: string
      gstin: string | null
      billingAddress: string | null
      stateCode: string | null
    } | null
    items: Array<{
      id: string
      nameSnapshot: string
      hsnSnapshot: string | null
      unitSnapshot: string | null
      quantity: number
      unitPrice: number
      discount: number
      gstRate: number
      taxableValue: number
      cgstAmount: number
      sgstAmount: number
      igstAmount: number
      lineTotal: number
    }>
    subtotal: number
    discountTotal: number
    taxableAmount: number
    cgstTotal: number
    sgstTotal: number
    igstTotal: number
    grandTotal: number
    paymentMode: string
    notes: string | null
    status: string
    templateId: 'CLASSIC' | 'MODERN' | 'COMPACT'
    pdfUrl: string | null
    createdAt: string
  }
  ```
- **Called from**: `client/hooks/useInvoices.ts` → `useInvoice()`
- **Used by**: Invoice detail page

#### POST /invoices
- **Request body**:
  ```typescript
  {
    clientBillId: string  // UUID generated client-side
    customerId?: string
    invoiceDate: string   // YYYY-MM-DD
    paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT'
    templateId?: 'CLASSIC' | 'MODERN' | 'COMPACT'
    notes?: string
    items: Array<{
      productId?: string
      name: string
      hsn?: string
      unit?: string
      quantity: number
      unitPrice: number
      discount?: number
      gstRate: 0 | 5 | 12 | 18 | 28
    }>
  }
  ```
- **Response**: Same as GET /invoices/{id}
- **Called from**: `client/hooks/useInvoices.ts` → `useCreateInvoice()`
- **On success**: Invalidates invoices query, navigates to invoice detail

#### GET /invoices/{id}/pdf
- **Request headers**: `Authorization`, `X-Business-Id`
- **Response**: `{ url: string }`
- **Called from**: `client/hooks/useInvoices.ts` → `useInvoicePdf()`
- **Used by**: Invoice detail page (download button)

#### PATCH /invoices/{id}/cancel
- **Request headers**: `Authorization`, `X-Business-Id`
- **Response**: `{ id: string; status: string }`
- **Called from**: `client/hooks/useInvoices.ts` → `useCancelInvoice()`
- **On success**: Invalidates invoice queries

### Customer Endpoints

#### GET /customers
- **Request headers**: `Authorization`, `X-Business-Id`
- **Query params**: `search`
- **Response**: `{ data: Customer[] }`
  ```typescript
  Customer = {
    id: string
    name: string
    phone: string | null
    gstin: string | null
    stateCode: string | null
    billingAddress: string | null
  }
  ```
- **Called from**: `client/hooks/useCustomers.ts` → `useCustomerSearch()`
- **Used by**: Customers page, New invoice page (customer search), Dashboard (customer count)

#### POST /customers
- **Request body**:
  ```typescript
  {
    name: string
    phone?: string
    gstin?: string
    stateCode?: string
    billingAddress?: string
  }
  ```
- **Response**: `Customer`
- **Called from**: `client/hooks/useCustomers.ts` → `useCreateCustomer()`
- **On success**: Invalidates customers query

### Product Endpoints

#### GET /products
- **Request headers**: `Authorization`, `X-Business-Id`
- **Query params**: `search`
- **Response**: `{ data: Product[] }`
  ```typescript
  Product = {
    id: string
    name: string
    hsnCode: string | null
    unit: string
    sellingPrice: number
    gstRate: number
    quantity: number
    location: string | null
  }
  ```
- **Called from**: `client/hooks/useProducts.ts` → `useProductSearch()`
- **Used by**: Inventory page, New invoice page (product search)

#### POST /products
- **Request body**:
  ```typescript
  {
    name: string
    sellingPrice: number
    gstRate: 0 | 5 | 12 | 18 | 28
    unit: string
    hsnCode?: string
    category?: string
    quantity?: number
    location?: string
  }
  ```
- **Response**: `Product`
- **Called from**: `client/hooks/useProducts.ts` → `useCreateProduct()`
- **On success**: Invalidates products query

### Member Endpoints

#### GET /members
- **Request headers**: `Authorization`, `X-Business-Id`
- **Response**: `{ members: Member[] }`
  ```typescript
  Member = {
    id: string
    userId: string
    email: string
    phone: string | null
    role: Role
    createdAt: string
  }
  ```
- **Called from**: `client/hooks/useMembers.ts` → `useMembers()`
- **Used by**: Team page

#### POST /members
- **Request body**:
  ```typescript
  {
    email: string
    password: string
    phone?: string
    role: 'ACCOUNTANT' | 'VIEWER'
  }
  ```
- **Response**: `{ member: { userId: string; email: string; role: Role } }`
- **Called from**: `client/hooks/useMembers.ts` → `useAddMember()`
- **On success**: Invalidates members query

#### DELETE /members/{id}
- **Response**: `{ id: string }`
- **Called from**: `client/hooks/useMembers.ts` → `useRemoveMember()`
- **On success**: Invalidates members query

---

## 6. Invoice Create Flow

### File Path
`client/app/dashboard/sales/invoices/new/page.tsx`

### Form Sections

#### 1. Customer Selection
- **Search input**: Debounced search against `GET /customers?search={query}`
- **Dropdown**: Shows matching customers with name and phone
- **"Add new customer" option**: Opens inline form
- **Clear button**: Resets to walk-in (no customer)

#### 2. New Customer Inline Form (when visible)
Fields:
- Name (required)
- Phone (optional)
- GSTIN (optional)
- State Code (optional)

Submits `POST /customers`, then auto-selects the created customer.

#### 3. Invoice Metadata
- **Invoice Date**: Date picker, defaults to today (`new Date().toISOString().split('T')[0]`)
- **Payment Mode**: Select dropdown with options: CASH, UPI, CARD, CREDIT (default: CASH)

#### 4. Line Items Table

**Columns**: Item Name, HSN, Unit, Qty, Price, Discount, GST %, Total, Delete

**Initial state**: One empty row

**Default values for new item**:
```typescript
{
  id: crypto.randomUUID(),
  name: '',
  hsn: '',
  unit: 'PCS',
  quantity: 1,
  unitPrice: 0,
  discount: 0,
  gstRate: 18
}
```

**Item Name field**:
- Typing triggers debounced `GET /products?search={query}`
- Dropdown shows matching products with name, HSN, price, GST rate
- Selecting a product populates: productId, name, hsn, unit, unitPrice, gstRate
- Can also type custom name (no productId)

**Field validations**:
- Quantity: type="number", min=0, step=0.001
- Price: type="number", min=0, step=0.01
- Discount: type="number", min=0, step=0.01
- GST Rate: select with options [0%, 5%, 12%, 18%, 28%]

**Add Item**: Appends new empty row
**Remove Item**: Removes row (minimum 1 row kept)

#### 5. Notes
- Optional textarea for invoice notes

#### 6. Summary Panel (Right Side)

**GST Calculation** happens on every items change via local `calculateGST()` function:

```typescript
const gstResult = useMemo(() => {
  return calculateGST({
    sellerGSTIN: activeBusiness?.gstin ?? null,
    sellerStateCode: activeBusiness?.stateCode ?? '00',
    buyerStateCode: selectedCustomer?.stateCode ?? null,
    items: items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
      gstRate: item.gstRate,
    })),
  })
}, [items, activeBusiness, selectedCustomer])
```

**Summary displays**:
- Subtotal
- Discount (if > 0)
- Taxable Amount
- IGST (if inter-state) OR CGST + SGST (if intra-state)
- Grand Total (formatted as INR currency)
- Document type (TAX INVOICE or BILL OF SUPPLY)
- Transaction type (INTRA-STATE or INTER-STATE)

### GST Calculation Logic

**File path**: `client/lib/gst-engine.ts`

```typescript
export type GSTInput = {
  sellerGSTIN: string | null
  sellerStateCode: string
  buyerStateCode: string | null
  items: {
    name: string
    quantity: number
    unitPrice: number
    discount: number
    gstRate: number
  }[]
}

export type GSTOutput = {
  documentType: "TAX_INVOICE" | "BILL_OF_SUPPLY"
  transactionType: "INTRA_STATE" | "INTER_STATE"
  lines: GSTLineOutput[]
  summary: GSTSummary
}
```

**Document Type Logic**:
- `BILL_OF_SUPPLY` if: sellerGSTIN is null OR all items have gstRate = 0
- `TAX_INVOICE` otherwise

**Transaction Type Logic**:
- `INTRA_STATE` if: buyerStateCode is null OR buyerStateCode === sellerStateCode
- `INTER_STATE` otherwise

**Per-line calculation** (using Decimal.js for precision):
1. `lineSubtotal = quantity × unitPrice`
2. `taxableValue = lineSubtotal - discount`
3. If BILL_OF_SUPPLY: no tax
4. If TAX_INVOICE + INTRA_STATE: `cgstAmount = sgstAmount = taxableValue × (gstRate/2) / 100`
5. If TAX_INVOICE + INTER_STATE: `igstAmount = taxableValue × gstRate / 100`
6. `lineTotal = taxableValue + cgstAmount + sgstAmount + igstAmount`

### clientBillId

**What it is**: A UUID generated client-side for idempotency

**When generated**: Once on component mount
```typescript
const clientBillIdRef = useRef(crypto.randomUUID())
```

**Purpose**: Prevents duplicate invoice creation if user double-clicks or network retries

### POST /invoices Payload

```typescript
{
  clientBillId: string,  // UUID from useRef
  customerId?: string,   // undefined for walk-in
  invoiceDate: string,   // YYYY-MM-DD
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT',
  notes?: string,
  items: Array<{
    productId?: string,
    name: string,
    hsn?: string,
    unit?: string,
    quantity: number,
    unitPrice: number,
    discount: number,
    gstRate: 0 | 5 | 12 | 18 | 28
  }>
}
```

**Filtering**: Items without name or with quantity = 0 are filtered out before submission

### Post-Submission

1. `createInvoice.mutateAsync()` returns the created invoice
2. React Query invalidates `['invoices', activeBusinessId]` query
3. Navigation: `router.push(`/dashboard/sales/invoices/${result.id}`)`

---

## 7. Invoice Detail

### File Path
`client/app/dashboard/sales/invoices/[id]/page.tsx`

### Data Displayed

**Header**:
- Invoice number (h1)
- Invoice date
- Customer name (or "Walk-in Customer")
- Status badge (ISSUED = green, CANCELLED = red)

**Invoice Details Card**:
- Invoice Number
- Date
- Document Type (TAX INVOICE / BILL OF SUPPLY)
- Transaction Type (INTRA-STATE / INTER-STATE)
- Payment Mode

**Customer Card**:
- Name
- GSTIN (if present)
- Billing Address (if present)
- State Code (if present)
- Or "Walk-in Customer" if no customer

**Items Table**:
| Column | Data |
|--------|------|
| Item | nameSnapshot, HSN code (small text) |
| Qty | quantity + unitSnapshot |
| Rate | unitPrice (2 decimals) |
| Total | lineTotal (2 decimals) |

**Summary Card**:
- Subtotal
- Discount (if > 0)
- Taxable Amount
- IGST (if inter-state) OR CGST + SGST (if intra-state)
- Grand Total (formatted as INR currency)

**Notes Card** (if notes exist):
- Notes text

**PDF Preview** (desktop only, right column):
- Embedded PDFViewer component
- Uses `@react-pdf/renderer` PDFViewer
- Renders `ClassicTemplate` component with invoice data

### PDF Download Action

**Button**: "Download PDF" (outline variant)

**Flow**:
1. Click sets `downloadPdf = true`
2. Triggers `useInvoicePdf(id, enabled)` with `enabled = true`
3. Query fetches `GET /invoices/{id}/pdf`
4. Response: `{ url: string }`
5. On data received: `window.open(pdfData.url, '_blank')`
6. Reset `downloadPdf = false`

### Cancel Invoice Action

**Visibility**: Only shown if status === 'ISSUED' AND role is 'OWNER' or 'ACCOUNTANT'

**Button**: "Cancel Invoice" (destructive variant)

**Flow**:
1. Click sets `showConfirmCancel = true`
2. Shows confirmation panel with warning message
3. "Yes, Cancel Invoice" → calls `PATCH /invoices/{id}/cancel`
4. On success: Closes confirmation, queries invalidated
5. "No, Keep It" → closes confirmation

**Confirmation message**: "Are you sure you want to cancel this invoice? This action cannot be undone. The invoice number will not be reused (GST compliance)."

---

## 8. Product Form

### File Path
`client/app/dashboard/inventory/page.tsx`

### Create Product Form

**Fields**:

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| name | text | Yes | '' | - |
| sellingPrice | number | Yes | '' | min=0, step=0.01 |
| gstRate | select | Yes | '18' | options: [0, 5, 12, 18, 28] |
| unit | text | Yes | '' | - |
| hsnCode | text | No | '' | - |
| category | text | No | '' | (not shown in current UI) |
| quantity | number | No | '' | min=0, step=0.001 |
| location | text | No | '' | - |

**API call on create**:
```
POST /products
Content-Type: application/json

{
  "name": "Basmati Rice 5kg",
  "sellingPrice": 420,
  "gstRate": 5,
  "unit": "BAG",
  "hsnCode": "1006",
  "quantity": 100,
  "location": "Shelf A"
}
```

**On success**:
1. Reset form to defaults
2. Hide form
3. Invalidates products query (list refreshes)

### Edit Product

**Not implemented in current UI** — products list is read-only.

### Soft Delete

**Not implemented in current UI** — no delete button on products.

---

## 9. Customer Form

### File Path
`client/app/dashboard/customers/page.tsx`

### Create Customer Form

**Fields**:

| Field | Type | Required | Default | Validation |
|-------|------|----------|---------|------------|
| name | text | Yes | '' | - |
| phone | text | No | '' | - |
| gstin | text | No | '' | auto-uppercased |
| billingAddress | text | No | '' | - |

**Note**: `stateCode` is NOT collected on the customers page form, but IS collected in the inline new customer form on the invoice create page.

**API call on create**:
```
POST /customers
Content-Type: application/json

{
  "name": "ABC Traders",
  "phone": "9876543210",
  "gstin": "27AABCU9603R1ZM",
  "billingAddress": "123 MG Road, Mumbai"
}
```

**On success**:
1. Reset form to defaults
2. Hide form
3. Invalidates customers query (list refreshes)

### Edit Customer

**Not implemented in current UI** — customers list is read-only.

### Soft Delete

**Not implemented in current UI** — no delete button on customers.

---

## 10. Business Settings

### File Path
`client/app/dashboard/settings/page.tsx`

### Fields Shown and Editable

| Field | Type | Required | Editable by |
|-------|------|----------|-------------|
| tradeName | text | Yes | OWNER only |
| legalName | text | No | OWNER only |
| phone | tel | No | OWNER only |
| stateCode | select | Yes | OWNER only |
| address | textarea | No | OWNER only |
| gstin | text | No (maxLength=15, auto-uppercased) | OWNER only |
| gstinType | select | No | OWNER only |
| invoicePrefix | text | Yes (maxLength=10, auto-uppercased) | OWNER only |

**GSTIN Type options**: Unregistered, Regular, Composition

**State Code options**: Full list of Indian states with code and name

### Logo Upload Flow

**Not implemented** — logoUrl exists in the data model but no upload UI is present.

### API call on save

```
PUT /businesses/{businessId}
Content-Type: application/json

{
  "tradeName": "Sharma Traders",
  "legalName": "Sharma Trading Co. Pvt Ltd",
  "gstin": "24AAAAA0000A1Z5",
  "gstinType": "REGULAR",
  "address": "Shop 12, MG Road, Ahmedabad",
  "stateCode": "24",
  "phone": "9876543210",
  "invoicePrefix": "ST"
}
```

**On success**: Shows "Settings saved successfully!" message

**On error**: Shows error message from API

**Access control**: Non-OWNER roles see form fields as disabled and message "Only business owners can edit settings."

---

## 11. Shared Components

### Button
- **File path**: `client/components/ui/button.tsx`
- **Props interface**:
  ```typescript
  type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>
  // variant: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
  // size: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'
  ```
- **What it does**: Renders styled button with variants using `class-variance-authority`. Uses `@base-ui/react/button` as primitive.

### Card Components
- **File path**: `client/components/ui/card.tsx`
- **Exports**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`
- **What they do**: Compound components for rendering card layouts with consistent styling.

### Badge
- **File path**: `client/components/ui/badge.tsx`
- **Props interface**:
  ```typescript
  type BadgeProps = useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>
  // variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link'
  ```
- **What it does**: Renders inline badge/tag elements.

### Sheet (Slide-over drawer)
- **File path**: `client/components/ui/sheet.tsx`
- **Exports**: `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`
- **Props**: `side: 'top' | 'right' | 'bottom' | 'left'`, `showCloseButton: boolean`
- **What it does**: Slide-over drawer component using `@base-ui/react/dialog`. Used for mobile navigation.

### Sidebar
- **File path**: `client/components/Sidebar.tsx`
- **Props interface**: `{ className?: string }`
- **What it does**:
  - Renders navigation sidebar for dashboard
  - Shows business switcher if user has multiple businesses
  - Filters nav items by user's role
  - Renders collapsible nav items with children
  - Shows logout button
  - Shows skeleton loading state when role is not loaded

### MobileNav
- **File path**: `client/components/MobileNav.tsx`
- **What it does**: Hamburger menu button that opens Sheet with Sidebar content for mobile.

### SessionProvider
- **File path**: `client/components/SessionProvider.tsx`
- **What it does**: Wraps app to attempt session restoration via refresh token on mount.

### QueryProvider
- **File path**: `client/components/QueryProvider.tsx`
- **What it does**: Wraps app with React Query provider. Configures:
  - `staleTime: 60000` (1 minute)
  - No retry on 401, 403, 404 errors
  - Max 2 retries for other errors

### Invoice Templates
- **File path**: `client/components/templates/Classic.tsx`
- **Props interface**:
  ```typescript
  { data: InvoiceTemplateData }
  ```
- **What it does**: React-PDF document template for generating invoice PDFs. Includes:
  - Tax Invoice / Bill of Supply header
  - Seller details block
  - Invoice metadata (number, date, payment mode)
  - Buyer details block
  - Line items table with HSN, quantity, rate, amount
  - GST summary table by HSN
  - Amount in words
  - Bank details section (empty)
  - Declaration and signature section

### Template Data Types
- **File path**: `client/components/templates/types.ts`
- **Exports**:
  ```typescript
  export type InvoiceTemplateId = 'CLASSIC' | 'MODERN' | 'COMPACT'

  export type InvoiceTemplateItem = {
    nameSnapshot: string
    hsnSnapshot?: string | null
    unitSnapshot?: string | null
    quantity: number
    unitPrice: number
    discount: number
    gstRate: number
    taxableValue: number
    cgstAmount: number
    sgstAmount: number
    igstAmount: number
    lineTotal: number
  }

  export type InvoiceTemplateData = {
    invoiceNumber: string
    invoiceDate: string
    documentType: string
    transactionType: string
    paymentMode: string
    notes?: string | null
    business: { ... }
    customer: { ... } | null
    items: InvoiceTemplateItem[]
    subtotal: number
    discount: number
    taxableAmount: number
    cgstTotal: number
    sgstTotal: number
    igstTotal: number
    grandTotal: number
  }
  ```

### Template Registry
- **File path**: `client/components/templates/index.ts`
- **What it does**: Exports `getTemplate(id)` function that returns template component. Currently only CLASSIC is implemented.

### Amount to Words
- **File path**: `client/lib/amount-to-words.ts`
- **Function**: `amountToWords(amount: number): string`
- **What it does**: Converts numeric amount to Indian English words format ("Indian Rupees One Thousand Four Hundred Forty Nine Only"). Handles:
  - Crore, Lakh, Thousand, Hundred
  - Paise (if fractional)

### Utility: cn
- **File path**: `client/lib/utils.ts`
- **Function**: `cn(...inputs: ClassValue[]): string`
- **What it does**: Merges Tailwind CSS classes using `clsx` and `tailwind-merge`.

---

## 12. Error Handling

### Global Error Boundaries

**None implemented** — no React Error Boundary components in the codebase.

### Toast Notifications

**None implemented** — no toast library is used. All feedback is inline.

### API Error Handling Pattern

All hooks use a common error handling wrapper:

```typescript
async function apiCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof HTTPError) {
      const body = await err.response.json<{ error?: string }>().catch(() => ({}))
      throw new Error(body.error ?? 'Something went wrong')
    }
    throw new Error('Could not reach the server')
  }
}
```

### How API Errors are Surfaced

1. **Form submission errors**: Displayed inline in a styled error box
   ```tsx
   {mutation.error && (
     <p className="text-sm text-danger bg-danger-subtle border border-danger/20 rounded-md px-3 py-2">
       {mutation.error.message}
     </p>
   )}
   ```

2. **Query errors**: Displayed as simple text
   ```tsx
   {error && <div className="text-destructive">{error.message}</div>}
   ```

### Network Failure

- Caught by `apiCall` wrapper
- Surfaces as "Could not reach the server" error message
- No automatic retry UI (React Query handles retries silently)

### 401 Handling

1. `afterResponse` hook intercepts 401
2. Attempts token refresh via `POST /auth/refresh`
3. On success: retries original request
4. On failure: clears auth, redirects to `/login`

### React Query Retry Config

```typescript
retry: (failureCount, error: unknown) => {
  const status = (error as { response?: { status?: number } })?.response?.status
  if (status === 401 || status === 403 || status === 404) return false
  return failureCount < 2
}
```

---

## 13. Navigation Structure

### Entry Points

1. **Landing page** (`/`) — public
2. **Login page** (`/login`) — public
3. **Signup page** (`/signup`) — public

### Post-Authentication Flow

```
Login/Signup Success
        │
        ▼
Has memberships? ──No──► /onboarding
        │
       Yes
        │
        ▼
   /dashboard
```

### Main Navigation (Sidebar)

```
┌─────────────────────────┐
│ Business Switcher       │ (if multiple businesses)
├─────────────────────────┤
│ ▶ Sales                 │ OWNER, ACCOUNTANT
│   └─ Invoices           │
│ Customers               │ OWNER, ACCOUNTANT
│ Inventory               │ OWNER, ACCOUNTANT, VIEWER
│ Payments                │ OWNER, ACCOUNTANT
│ Insights                │ OWNER
│ Team                    │ OWNER
│ Settings                │ OWNER, ACCOUNTANT, VIEWER
├─────────────────────────┤
│ Sign out                │
└─────────────────────────┘
```

### Sidebar Config

**File path**: `client/config/sidebar.ts`

```typescript
export const sidebarItems: SidebarItem[] = [
  {
    label: 'Sales',
    href: '/dashboard/sales',
    icon: 'receipt',
    roles: ['OWNER', 'ACCOUNTANT'],
    children: [
      { label: 'Invoices', href: '/dashboard/sales/invoices' },
    ],
  },
  {
    label: 'Customers',
    href: '/dashboard/customers',
    icon: 'users',
    roles: ['OWNER', 'ACCOUNTANT'],
  },
  {
    label: 'Inventory',
    href: '/dashboard/inventory',
    icon: 'box',
    roles: ['OWNER', 'ACCOUNTANT', 'VIEWER'],
  },
  {
    label: 'Payments',
    href: '/dashboard/payments',
    icon: 'wallet',
    roles: ['OWNER', 'ACCOUNTANT'],
  },
  {
    label: 'Insights',
    href: '/dashboard/insights',
    icon: 'bar-chart',
    roles: ['OWNER'],
  },
  {
    label: 'Team',
    href: '/dashboard/team',
    icon: 'user-plus',
    roles: ['OWNER'],
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: 'settings',
    roles: ['OWNER', 'ACCOUNTANT', 'VIEWER'],
  },
]
```

### Route Protection Summary

| Route | Protection |
|-------|------------|
| `/` | Public |
| `/login` | Public |
| `/signup` | Public |
| `/forgot-password` | Public |
| `/verify-otp` | Public |
| `/reset-password` | Public |
| `/403` | Public |
| `/onboarding` | Requires auth (no business needed) |
| `/dashboard/*` | Requires auth + business |

### Mobile Navigation

- Uses `MobileNav` component (hamburger menu)
- Opens `Sheet` from left side
- Contains same `Sidebar` component

### Complete Route Map

```
/                           Landing page (public)
/login                      Login (public)
/signup                     Signup (public)
/forgot-password            Password reset step 1 (public)
/verify-otp                 Password reset step 2 (public)
/reset-password             Password reset step 3 (public)
/403                        Forbidden (public)
/onboarding                 Business setup (protected)
/dashboard                  Dashboard home (protected)
/dashboard/sales            Redirects to invoices (protected)
/dashboard/sales/invoices   Invoice list (protected, OWNER/ACCOUNTANT)
/dashboard/sales/invoices/new    New invoice form (protected, OWNER/ACCOUNTANT)
/dashboard/sales/invoices/[id]   Invoice detail (protected, OWNER/ACCOUNTANT)
/dashboard/customers        Customer list (protected, OWNER/ACCOUNTANT)
/dashboard/inventory        Product list (protected, all roles)
/dashboard/payments         Placeholder (protected, OWNER/ACCOUNTANT)
/dashboard/insights         Placeholder (protected, OWNER)
/dashboard/team             Team management (protected, OWNER only)
/dashboard/settings         Business settings (protected, all roles)
```
