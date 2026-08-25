<div align="center">

<br/>

# 🍽️ Delicious — Food Delivery & Partner Platform

**A modern, full-featured food delivery web application built with Next.js 16 and Spring Boot.**

Browse menus · Order food · Manage your kitchen · Deliver with ease

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5-f97316?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=reactquery)](https://tanstack.com/query)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Pages & Routes](#-pages--routes)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Backend Integration](#-backend-integration)
- [Role-Based Access](#-role-based-access)

---

## 🌟 Overview

**Delicious** is a full-stack food ordering and delivery platform designed to connect **customers**, **restaurant sellers**, and **delivery riders** in one seamless ecosystem. The frontend is a modern Single Page Application (SPA) built with the Next.js App Router, featuring a premium UI with glassmorphism, smooth animations, and a fully responsive layout.

The platform supports four distinct user roles — **Customer**, **Seller**, **Rider**, and **Admin** — each with dedicated dashboards and tailored workflows.

---

## ✨ Key Features

### 👤 Customer Experience
- 🏠 **Browseable Home Feed** — Filter food products by cuisine category with paginated results
- 🔍 **Product Detail Pages** — View detailed information, pricing, and seller info for each menu item
- 🛒 **Persistent Cart** — Add/remove/update quantities with cart state persisted across browser sessions via `localStorage`
- 🎟️ **Promo Code Coupon** — Apply promotional discount codes at checkout (e.g., `DELICIOUS50`)
- 📦 **Order Placement** — Checkout flow with automatic delivery details pre-filled from customer profile
- ✅ **Order Confirmation Screen** — Animated success state showing Order ID, amount, and delivery address
- 👥 **Partner Kitchens & Riders Sections** — Browse active sellers and registered delivery riders on the home page

### 🔐 Authentication & Registration
- **Multi-role Registration** — Separate dedicated registration forms for Customers, Sellers, and Riders
- **Unified Login** — Single login page with automatic role-based redirect after authentication:
  - `CUSTOMER` → Home (`/`)
  - `SELLER` → Seller Dashboard (`/seller/dashboard`)
  - `RIDER` → Rider Dashboard (`/rider/dashboard`)
  - `ADMIN` → Admin Dashboard (`/admin/dashboard`)
- **Session Persistence** — Auth token and user profile stored in `localStorage`, automatically attached to all API requests via Axios interceptors
- **Secure Logout** — Clears token and user data from store and `localStorage`

### 🏪 Seller Dashboard (`/seller/dashboard`)
- **Product Management** — Full CRUD for restaurant menu items (Create, Read, Update, Delete)
- **Product Status Control** — Toggle menu items between active/inactive states
- **Product Modal Editor** — Inline edit modals for updating product name, description, price, category, and making time
- **Kitchen Header** — Personalized header with seller store name and profile info

### 🛵 Rider Dashboard (`/rider/dashboard`)
- **Active Deliveries Tab** — View and manage orders currently assigned to the rider with real-time status transitions
- **Available Jobs Tab** — Browse open orders available for pickup
- **Profile Tab** — View and update rider profile information including vehicle registration details
- **Sidebar Navigation** — Icon-based collapsible sidebar with intuitive tab switching

### 🛠️ Admin Dashboard (`/admin/dashboard`)
- **Product Management Console** — View all platform products, create new ones, edit, and delete with seller assignment
- **Category Management** — Create and manage cuisine categories (e.g., Burgers, Pizza, Biryani)
- **Order Dispatch Desk** — View all platform orders, update order statuses (PENDING → CONFIRMED → OUT_FOR_DELIVERY → DELIVERED)
- **User Sub-dashboards** — Dedicated sub-pages for viewing registered Customers (`/customers`), Sellers (`/sellers`), and Riders (`/riders`)

### 🌐 Public Browsing
- **Seller Profiles** (`/sellers/[id]`) — Public profile page for each restaurant kitchen
- **Product Detail** (`/products/[id]`) — Full product detail page with add-to-cart action

---

## 🧰 Technology Stack

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.6 | React framework with App Router for SSR/CSR hybrid rendering |
| **React** | 19.2.4 | UI component library |
| **React DOM** | 19.2.4 | DOM rendering |

### State Management
| Technology | Version | Purpose |
|---|---|---|
| **Zustand** | ^5.0.13 | Global client state — `useCartStore` for the shopping cart and `useAuthStore` for authenticated user session |

### Data Fetching & Caching
| Technology | Version | Purpose |
|---|---|---|
| **TanStack React Query** | ^5.100.10 | Server state management, caching, background refetching, and loading states for all API calls |
| **Axios** | ^1.16.1 | HTTP client with request/response interceptors for auth token injection and standardized error formatting |

### Styling
| Technology | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | ^4 | Utility-first CSS framework for rapid, consistent UI development |
| **PostCSS** | — | CSS processing via `@tailwindcss/postcss` plugin |
| **Geist Font** (Google Fonts) | — | `Geist Sans` and `Geist Mono` for modern, clean typography via `next/font/google` |

### Icons
| Technology | Version | Purpose |
|---|---|---|
| **Lucide React** | ^1.16.0 | Comprehensive icon library used throughout all UI components |

### Developer Tooling
| Technology | Version | Purpose |
|---|---|---|
| **ESLint** | ^9 | Code linting with `eslint-config-next` |
| **eslint-config-next** | 16.2.6 | Next.js-specific lint rules |

---

## 📁 Project Structure

```
delicious_frontend/
├── public/                     # Static assets (images, default food image)
└── src/
    ├── app/                    # Next.js App Router — all pages & layouts
    │   ├── layout.js           # Root layout (fonts, QueryProvider wrapper)
    │   ├── page.js             # Home page (product browse, navbar)
    │   ├── login/              # Login page
    │   ├── register/
    │   │   ├── customer/       # Customer registration form
    │   │   ├── seller/         # Seller onboarding form
    │   │   └── rider/          # Rider registration form
    │   ├── checkout/           # Cart review & order placement page
    │   ├── products/[id]/      # Dynamic product detail page
    │   ├── sellers/[id]/       # Dynamic seller/kitchen public profile
    │   ├── seller/dashboard/   # Seller panel (product CRUD)
    │   ├── rider/dashboard/    # Rider panel (jobs, active, profile)
    │   └── admin/
    │       └── dashboard/
    │           ├── page.js     # Admin main console (products, categories, orders tabs)
    │           ├── customers/  # Admin: view all customers
    │           ├── sellers/    # Admin: view all sellers
    │           └── riders/     # Admin: view all riders
    │
    ├── components/             # Reusable UI components
    │   ├── admin/              # AdminSidebar, AdminProductsTab, AdminCategoriesTab, AdminOrdersTab
    │   ├── home/               # CategorySection, ProductSection, HomeSellersSection, HomeRidersSection, HomeEcosystemSection, HomeFooter
    │   ├── seller/             # SellerKitchenHeader, SellerProductsList, SellerProductModal
    │   ├── rider/              # RiderSidebar, RiderActiveTab, RiderJobsTab, RiderProfileTab
    │   ├── shared/             # Notification (toast alerts)
    │   └── ui/                 # Loader, AuthCard, Input, Button (base design system)
    │
    ├── providers/
    │   └── QueryProvider.js    # TanStack React Query client provider
    │
    ├── services/               # Axios API service layer
    │   ├── api.js              # Base Axios instance with interceptors
    │   ├── authApi.js          # Login / Register calls
    │   ├── productApi.js       # Product CRUD calls
    │   ├── categoryApi.js      # Category CRUD calls
    │   ├── orderApi.js         # Order creation & management calls
    │   ├── customerApi.js      # Customer profile calls
    │   ├── sellerApi.js        # Seller profile calls
    │   ├── riderApi.js         # Rider profile & delivery calls
    │   ├── reviewApi.js        # Product review calls
    │   └── userApi.js          # User management calls
    │
    └── store/
        └── store.js            # Zustand stores: useCartStore, useAuthStore
```

---

## 🗺️ Pages & Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Home — browse products, categories, sellers, riders |
| `/login` | Public | Unified login with role-based redirect |
| `/register/customer` | Public | Customer registration form |
| `/register/seller` | Public | Seller / Restaurant onboarding form |
| `/register/rider` | Public | Rider delivery partner registration |
| `/products/[id]` | Public | Product detail page |
| `/sellers/[id]` | Public | Seller/Kitchen public profile page |
| `/checkout` | Auth | Shopping cart review and order placement |
| `/seller/dashboard` | Seller | Product management kitchen console |
| `/rider/dashboard` | Rider | Active deliveries, open jobs, profile |
| `/admin/dashboard` | Admin | Products, Categories, Orders management |
| `/admin/dashboard/customers` | Admin | View all registered customers |
| `/admin/dashboard/sellers` | Admin | View all registered seller partners |
| `/admin/dashboard/riders` | Admin | View all registered delivery riders |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (or Yarn / pnpm)
- A running instance of the **Delicious Backend** (Spring Boot on port `8080`)

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd delicious_frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.local.example .env.local
# Edit .env.local and set your API URL (see below)

# 4. Start the development server
npm run dev
```

The app will be available at **[http://localhost:3000](http://localhost:3000)**.

### Build for Production

```bash
npm run build
npm run start
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the project root:

```env
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api/v1` | The base URL of the Spring Boot backend REST API |

---

## 🔌 Backend Integration

The frontend communicates with a **Spring Boot REST API** (Java 17) via a centralized Axios instance (`src/services/api.js`).

**Automatic Authentication Injection:** Every outgoing request automatically includes a `Bearer <token>` header if a token is present in `localStorage`.

**Standardized Error Handling:** The Axios response interceptor normalizes all API error responses (network errors, 4xx, 5xx) into a clean `Error` object, consumed uniformly by TanStack Query's `onError` callbacks.

**API Response Envelope:** The backend uses a consistent `ApiResponse<T>` wrapper:
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... }
}
```

---

## 🔐 Role-Based Access

The platform supports four user roles managed server-side and reflected in the frontend session:

| Role | After Login | Primary Dashboard |
|---|---|---|
| `CUSTOMER` | Redirected to `/` | Home page with cart & ordering |
| `SELLER` | Redirected to `/seller/dashboard` | Kitchen product management |
| `RIDER` | Redirected to `/rider/dashboard` | Delivery job management |
| `ADMIN` | Redirected to `/admin/dashboard` | Full platform administration |

The navbar dynamically displays a role badge and links to the appropriate dashboard for the logged-in user.

---

<div align="center">

**Built with ❤️ as a Varsity Assignment Project**

</div>
