# 🎨 NexaHR — UI/UX Design Specifications & Visual Architecture

**Product Name:** NexaHR Enterprise Human Resource Management System (HRMS)  
**Design System Version:** `2.0 Enterprise Design System`  
**Design Principle:** Modern, High-Trust, Data-Dense Enterprise SaaS Aesthetics  

---

## 1. Design Philosophy & Experience Goals

NexaHR is crafted to deliver a consumer-grade experience within an enterprise-grade productivity platform. It replaces the clunky, gray-box legacy HR tools with an interface that feels fast, fluid, legible, and aesthetically refined.

### Core Experience Pillars
1. **High Visual Clarity & Low Cognitive Load:** Dense operational metrics are structured using visual cards, color-coded badges, and clear hierarchy so HR admins can absorb complex payroll and attendance data at a glance.
2. **First-Class Dual Theming (Dark & Light):** Built with persistent CSS Custom Variables and Tailwind classes to provide a sleek dark theme for low-light environments and an ultra-clean, crisp light theme for corporate offices.
3. **Responsive Parity:** Seamless transitions across desktop screens ($1440\text{px}+$), laptop displays ($1024\text{px}$), tablets ($768\text{px}$), and mobile devices ($320\text{px}$) with bottom navigation bars for smartphones.
4. **Delightful Micro-Interactions:** Smooth transitions on hover, soft drop-down springs, animated pulse badges for live status, and responsive modal dialogues.

---

## 2. Color Palette & Token System

### 2.1 Core Palette

| Role | Token Name | Light Mode Hex | Dark Mode Hex | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Brand** | `primary-600` / `500` | `#4F46E5` (Indigo) | `#6366F1` (Indigo Bright) | Primary buttons, active nav items, brand logos |
| **Primary Accent** | `sky-500` | `#0EA5E9` (Sky Blue) | `#38BDF8` (Sky) | Highlights, metric trends, active tabs |
| **Success / Positive** | `emerald-500` | `#10B981` (Emerald) | `#34D399` (Emerald Bright) | Present status, approved leaves, paid payslips |
| **Warning / Pending** | `amber-500` | `#F59E0B` (Amber) | `#FBBF24` (Amber Bright) | Pending leaves, late check-ins, action alerts |
| **Danger / Error** | `rose-500` | `#F43F5E` (Rose) | `#FB7185` (Rose Bright) | Absent records, rejected leaves, deletions |
| **Neutral Background** | `bg-main` | `#F8FAFC` (Slate 50) | `#0B0F17` (Deep Obsidian) | Main viewport canvas background |
| **Card / Surface** | `bg-card` | `#FFFFFF` (Pure White) | `#111827` (Gray 900) | Metric cards, data tables, modal dialogs |
| **Border / Divider** | `border-subtle`| `#E2E8F0` (Slate 200) | `#1F2937` (Gray 800) | Card outlines, table rows, nav dividers |
| **Text Primary** | `text-primary` | `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) | Main headings, table data, bold metrics |
| **Text Secondary** | `text-muted` | `#64748B` (Slate 500) | `#94A3B8` (Slate 400) | Subtitles, labels, timestamps, table headers |

---

## 3. Typography & Hierarchy

NexaHR utilizes a clean, modern sans-serif typography stack based on **Inter** and **system-ui** fallbacks.

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Type Scale Matrix

| Element | Class / Token | Size | Weight | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Display Title** | `text-2xl lg:text-3xl` | 24px - 30px | 700 (Bold) | 1.2 | `-0.02em` |
| **Section Header** | `text-lg lg:text-xl` | 18px - 20px | 600 (SemiBold) | 1.3 | `-0.01em` |
| **Card Metric Value** | `text-2xl` | 24px | 700 (Bold) | 1.0 | `0` |
| **Body Standard** | `text-sm` | 14px | 400 (Regular) | 1.5 | `0` |
| **Button / Navigation**| `text-sm` | 14px | 500 (Medium) | 1.4 | `0` |
| **Table Header / Badge**| `text-xs` | 12px | 600 (SemiBold) | 1.4 | `+0.05em` |
| **Micro Caption / Time** | `text-[11px]` | 11px | 400 (Regular) | 1.3 | `0` |

---

## 4. Layout & Navigation Architecture

### 4.1 Layout Shell Structure
```
+-------------------------------------------------------------------------------+
| TOP HEADER: Brand Logo | Breadcrumb | Search | Notification Bell | Theme | Profile |
+------------------+------------------------------------------------------------+
| SIDEBAR NAV      | MAIN WORKSPACE CONTENT AREA                                |
| (Collapsible)    |                                                            |
|                  | [Page Title & Action Button Header]                        |
| * Dashboard      |                                                            |
| * Employees      | [Metric KPI Cards Grid (4 cols)]                           |
| * Attendance     |                                                            |
| * Leaves         | [Main Data View: Filter Bar + Interactive Table + Pagination]
| * Payroll        |                                                            |
| * Recruitment    |                                                            |
| * Settings       |                                                            |
+------------------+------------------------------------------------------------+
| (Mobile View: Fixed Bottom Navigation Bar with Quick Punch Floating Button)   |
+-------------------------------------------------------------------------------+
```

### 4.2 Responsive Navigation Breakpoints
- **Desktop ($\ge 1024\text{px}$):** Persistent left sidebar with icons and category labels, expandable sub-menus, top search bar, and full notification popover.
- **Tablet ($768\text{px} - 1023\text{px}$):** Compact sidebar icon-rail with flyout hover menus, responsive multi-column metric grids.
- **Mobile ($< 768\text{px}$):** Hidden left sidebar accessible via hamburger drawer; sticky bottom navigation bar with direct access to Dashboard, Attendance Punch, Leaves, and Profile.

---

## 5. UI Component Design Specifications

### 5.1 Metric KPI Cards
- **Container:** Rounded corners (`rounded-xl` / `12px`), subtle border (`border border-slate-200 dark:border-gray-800`), smooth shadow (`shadow-sm hover:shadow-md transition-shadow`).
- **Structure:** Top row with category title & icon container in tinted background; bottom row with bold counter metric and percentage trend badge (e.g., `+4.2% vs last month`).

### 5.2 Enterprise Data Tables
- **Header:** Uppercase, muted text with sortable column indicator arrows (`text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-50 dark:bg-gray-800/50`).
- **Rows:** Hover highlight (`hover:bg-slate-50/80 dark:hover:bg-gray-800/40`), zebra border separators, and vertical alignment for avatar thumbnails and employee IDs.
- **Action Column:** Floating or right-aligned action trigger (`Edit`, `View Details`, `Download`, `Delete`) with confirmation dialogs for destructive actions.

### 5.3 Badges & Status Indicators
- **`APPROVED` / `PRESENT`:** `bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800`
- **`PENDING` / `LATE`:** `bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800`
- **`REJECTED` / `ABSENT`:** `bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800`

### 5.4 Modal Dialogues & Drawers
- **Backdrop:** Semi-transparent dark overlay with backdrop blur (`bg-slate-900/60 backdrop-blur-sm`).
- **Card:** Center-aligned on desktop, bottom sheet on mobile devices.
- **Interactivity:** Keyboard accessibility (`Escape` to close), auto-focus on primary form field, and spinner animations during API submissions.

---

## 6. Accessibility & Usability (a11y)

1. **Color Contrast:** All text and interactive states adhere to **WCAG 2.1 AA** standards with minimum contrast ratio of $4.5:1$ for normal text and $3:1$ for large text.
2. **Focus Rings:** Visible, accessible keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none`) on all interactive buttons, inputs, and links.
3. **Form Validation Feedback:** Inline field-level validation messages in distinct rose colors with clear descriptive text rather than generic alerts.
4. **Empty State Illustrations:** Helpful, visually appealing zero-state banners when tables or searches return 0 records, with direct primary action buttons (e.g. *"No employees found — Add your first employee"*).
