# 🎨 Design System Guide

## 📐 **Spacing & Layout**

### **Container Spacing**
```css
/* Page Container */
.page-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8;
}

/* Section Spacing */
.section-spacing {
  @apply mb-8;
}

/* Card Spacing */
.card-spacing {
  @apply p-6;
}

/* Form Spacing */
.form-spacing {
  @apply space-y-8;
}

.form-group-spacing {
  @apply space-y-6;
}

.form-field-spacing {
  @apply space-y-2;
}
```

### **Grid System**
```css
/* Responsive Grid */
.grid-responsive {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6;
}

.grid-form {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.grid-actions {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4;
}
```

## 🎯 **Typography**

### **Headings**
```css
/* Page Title */
.page-title {
  @apply text-3xl font-bold text-gray-900 tracking-tight;
}

/* Section Title */
.section-title {
  @apply text-2xl font-bold text-gray-900;
}

/* Subsection Title */
.subsection-title {
  @apply text-lg font-semibold text-gray-900;
}

/* Card Title */
.card-title {
  @apply text-xl font-semibold text-gray-900;
}
```

### **Body Text**
```css
/* Description */
.description {
  @apply text-sm text-gray-600 mt-2;
}

/* Label */
.label {
  @apply block text-sm font-medium text-gray-700;
}

/* Helper Text */
.helper-text {
  @apply text-sm text-gray-500;
}

/* Error Text */
.error-text {
  @apply text-sm text-red-600;
}
```

## 🎨 **Colors**

### **Primary Colors**
```css
/* Blue (Primary) */
.primary-blue {
  @apply bg-blue-600 hover:bg-blue-700 text-white;
}

.primary-blue-light {
  @apply bg-blue-50 text-blue-700;
}

/* Gray Scale */
.gray-50 { @apply bg-gray-50; }
.gray-100 { @apply bg-gray-100; }
.gray-200 { @apply bg-gray-200; }
.gray-300 { @apply bg-gray-300; }
.gray-400 { @apply bg-gray-400; }
.gray-500 { @apply bg-gray-500; }
.gray-600 { @apply bg-gray-600; }
.gray-700 { @apply bg-gray-700; }
.gray-800 { @apply bg-gray-800; }
.gray-900 { @apply bg-gray-900; }
```

### **Status Colors**
```css
/* Success */
.success-green {
  @apply bg-green-100 text-green-800;
}

/* Warning */
.warning-yellow {
  @apply bg-yellow-100 text-yellow-800;
}

/* Error */
.error-red {
  @apply bg-red-100 text-red-800;
}

/* Info */
.info-blue {
  @apply bg-blue-100 text-blue-800;
}
```

## 🔲 **Components**

### **Cards**
```css
/* Primary Card */
.card-primary {
  @apply bg-white rounded-xl shadow-sm border border-gray-200;
}

/* Card Header */
.card-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

/* Card Body */
.card-body {
  @apply p-6;
}

/* Card Footer */
.card-footer {
  @apply flex items-center justify-end space-x-4 pt-6 border-t border-gray-200;
}
```

### **Buttons**
```css
/* Primary Button */
.btn-primary {
  @apply inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200;
}

/* Secondary Button */
.btn-secondary {
  @apply inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200;
}

/* Danger Button */
.btn-danger {
  @apply inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200;
}

/* Icon Button */
.btn-icon {
  @apply p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200;
}
```

### **Form Elements**
```css
/* Input Field */
.input-field {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200;
}

/* Select Field */
.select-field {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200;
}

/* Textarea */
.textarea-field {
  @apply w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none;
}

/* Input with Icon */
.input-with-icon {
  @apply relative;
}

.input-with-icon input {
  @apply pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200;
}

.input-with-icon .icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
}
```

### **Tables**
```css
/* Table Container */
.table-container {
  @apply bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden;
}

/* Table */
.table {
  @apply w-full;
}

/* Table Header */
.table-header {
  @apply bg-gray-50 border-b border-gray-200;
}

.table-header th {
  @apply px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200;
}

/* Table Body */
.table-body {
  @apply bg-white divide-y divide-gray-200;
}

.table-body tr {
  @apply hover:bg-gray-50 transition-colors duration-200;
}

.table-body td {
  @apply px-6 py-4 whitespace-nowrap;
}
```

### **Modals**
```css
/* Modal Overlay */
.modal-overlay {
  @apply fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4;
}

/* Modal Container */
.modal-container {
  @apply bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto;
}

/* Modal Header */
.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

/* Modal Body */
.modal-body {
  @apply p-6 space-y-8;
}

/* Modal Footer */
.modal-footer {
  @apply flex items-center justify-end space-x-4 pt-6 border-t border-gray-200;
}
```

## 🎭 **Interactive States**

### **Hover States**
```css
/* Card Hover */
.card-hover {
  @apply hover:shadow-md transition-shadow duration-200;
}

/* Button Hover */
.btn-hover {
  @apply hover:scale-105 transition-transform duration-200;
}

/* Row Hover */
.row-hover {
  @apply hover:bg-gray-50 transition-colors duration-200;
}
```

### **Focus States**
```css
/* Input Focus */
.input-focus {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

/* Button Focus */
.btn-focus {
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500;
}
```

### **Loading States**
```css
/* Loading Spinner */
.loading-spinner {
  @apply animate-spin rounded-full h-4 w-4 border-b-2 border-white;
}

/* Loading Container */
.loading-container {
  @apply min-h-screen flex items-center justify-center bg-gray-50;
}

/* Loading Content */
.loading-content {
  @apply flex flex-col items-center space-y-4;
}
```

## 📱 **Responsive Design**

### **Breakpoints**
```css
/* Mobile First */
.mobile-first {
  @apply grid grid-cols-1;
}

/* Tablet */
.tablet {
  @apply md:grid-cols-2;
}

/* Desktop */
.desktop {
  @apply lg:grid-cols-3;
}
```

### **Responsive Spacing**
```css
/* Responsive Padding */
.responsive-padding {
  @apply px-4 sm:px-6 lg:px-8;
}

/* Responsive Margin */
.responsive-margin {
  @apply mb-4 sm:mb-6 lg:mb-8;
}

/* Responsive Text */
.responsive-text {
  @apply text-sm sm:text-base lg:text-lg;
}
```

## 🎨 **Icons & Visual Elements**

### **Icon Sizes**
```css
/* Small Icons */
.icon-sm {
  @apply w-4 h-4;
}

/* Medium Icons */
.icon-md {
  @apply w-5 h-5;
}

/* Large Icons */
.icon-lg {
  @apply w-6 h-6;
}

/* Extra Large Icons */
.icon-xl {
  @apply w-8 h-8;
}
```

### **Avatar & Images**
```css
/* Avatar */
.avatar {
  @apply h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center;
}

/* Avatar Large */
.avatar-lg {
  @apply h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center;
}

/* Avatar Small */
.avatar-sm {
  @apply h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center;
}
```

## 🎯 **Usage Examples**

### **Page Layout**
```jsx
<div className="min-h-screen bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Page Content */}
  </div>
</div>
```

### **Card Component**
```jsx
<div className="bg-white rounded-xl shadow-sm border border-gray-200">
  <div className="p-6">
    {/* Card Content */}
  </div>
</div>
```

### **Form Layout**
```jsx
<form className="space-y-8">
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-gray-900">Section Title</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Label</label>
        <input className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200" />
      </div>
    </div>
  </div>
</form>
```

### **Button Group**
```jsx
<div className="flex items-center justify-end space-x-4">
  <button className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
    Cancel
  </button>
  <button className="px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
    Save
  </button>
</div>
```

---

**This design system ensures consistent spacing, padding, and styling across all components, following Linear's clean and modern approach.** 