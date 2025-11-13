# 🎨 Sugarcane Platform - Complete Color Palette

> Extracted from entire codebase on November 13, 2025
> This document contains every unique color used across the platform

---

## 1. 🌟 Global Primary Colors (Green Theme)

### Primary Green Scale (Tailwind Extended)
```css
/* Custom Primary Colors from tailwind.config.js */
--primary-50:  #f0f9f4   /* Lightest green tint */
--primary-100: #dcf2e2   /* Very light green */
--primary-200: #bce5ca   /* Light green */
--primary-300: #8dd2a8   /* Medium light green */
--primary-400: #4a7c59   /* Medium green */
--primary-500: #2c5f2d   /* Base primary green */
--primary-600: #1e4620   /* Dark green */
--primary-700: #18371a   /* Darker green */
--primary-800: #142d16   /* Very dark green */
--primary-900: #0f2511   /* Darkest green */
```

### Core Primary Hexadecimal Values
- `#245305` - Deep forest green (Headers)
- `#2c5419` - Dark olive green
- `#2c5530` - Primary dark green (Headings)
- `#2c5f2d` - Base primary green
- `#3a6b1f` - Medium forest green
- `#4a7c3c` - Sage green
- `#4a7c59` - Medium green-gray
- `#4caf50` - Success green (Material Design)
- `#6db850` - Light sage green

### Primary RGB/RGBA Values
- `rgb(44, 95, 45)` - Primary green RGB
- `rgba(44, 95, 45, 0.1)` - Primary green 10% opacity
- `rgba(44, 95, 45, 0.3)` - Primary green 30% opacity
- `rgba(44, 95, 45, 0.4)` - Primary green 40% opacity
- `rgba(45, 80, 22, 0.2)` - Dark green 20% opacity

---

## 2. 🎨 Global Secondary Colors (Gray Scale)

### Secondary Gray Scale (Tailwind Extended)
```css
/* Custom Secondary Colors from tailwind.config.js */
--secondary-50:  #f8f9fa   /* Lightest gray */
--secondary-100: #e9ecef   /* Very light gray */
--secondary-200: #dee2e6   /* Light gray */
--secondary-300: #ced4da   /* Medium light gray */
--secondary-400: #adb5bd   /* Medium gray */
--secondary-500: #6c757d   /* Base gray */
--secondary-600: #495057   /* Dark gray */
--secondary-700: #343a40   /* Darker gray */
--secondary-800: #212529   /* Very dark gray */
--secondary-900: #1a1e21   /* Darkest gray */
```

### Additional Gray Hexadecimal Values
- `#e1e5e9` - Very light border gray
- `#e2e8f0` - Slate gray light
- `#f5f7fa` - Off-white background
- `#fafbfc` - Almost white

---

## 3. 🌫️ Neutral & Background Colors

### White & Off-White
- `#ffffff` / `white` - Pure white
- `#fafafa` - Subtle off-white
- `#f8f9fa` - Light background
- `#f5f7fa` - Gray-tinted white
- `#fafbfc` - Card background

### Light Backgrounds
- `#f0f9f4` - Light green tint
- `#f8f9fa` - Neutral light
- `#e9ecef` - Very light gray background

### Dark Backgrounds
- `#1a1e21` - Very dark gray
- `#212529` - Dark background
- `#343a40` - Medium dark gray

---

## 4. 📝 Text Colors

### Primary Text
- `#000000` / `black` - Pure black text
- `#212529` - Dark text (primary)
- `#343a40` - Medium dark text
- `#495057` - Gray text (secondary)
- `#666666` / `#666` - Medium gray text
- `#6c757d` - Muted text

### Light Text
- `#ffffff` / `white` - White text
- `#f8f9fa` - Off-white text

### Colored Text
- `#2c5530` - Green headings
- `#721c24` - Error text (dark red)

---

## 5. 🖼️ Border & Shadow Colors

### Border Colors
- `#e1e5e9` - Light border
- `#e2e8f0` - Slate border
- `#dee2e6` - Gray border
- `#ced4da` - Medium gray border
- `#adb5bd` - Dark gray border
- `#2c5530` - Green accent border
- `#4caf50` - Success border

### Shadow Colors (RGBA)
- `rgba(0, 0, 0, 0.05)` - Very subtle shadow
- `rgba(0, 0, 0, 0.08)` - Light shadow
- `rgba(0, 0, 0, 0.1)` - Medium shadow
- `rgba(0, 0, 0, 0.3)` - Dark shadow
- `rgba(44, 95, 45, 0.1)` - Green shadow light
- `rgba(44, 95, 45, 0.3)` - Green shadow medium
- `rgba(44, 95, 45, 0.4)` - Green shadow dark
- `rgba(74, 124, 89, 0.3)` - Sage shadow medium
- `rgba(74, 124, 89, 0.4)` - Sage shadow dark
- `rgba(45, 80, 22, 0.2)` - Forest shadow
- `rgba(255, 255, 255, 0.5)` - White shadow/outline
- `rgba(239, 68, 68, 0.3)` - Red shadow (error)
- `rgba(255, 152, 0, 0.3)` - Orange shadow (warning)

---

## 6. ✅ Status Colors

### Success Colors
- `#28a745` - Success green (primary)
- `#218838` - Success green dark (hover)
- `#4caf50` - Material success green
- `#45a049` - Success green dark
- `#20c997` - Teal success
- `#d4edda` - Success background light
- `#c3e6cb` - Success background
- `#155724` - Success text dark

### Warning Colors
- `#ff9800` - Warning orange
- `#f57c00` - Warning orange dark
- `#ffc107` - Amber warning
- `#fff3cd` - Warning background
- `#856404` - Warning text dark

### Error Colors
- `#dc2626` - Error red
- `#ef4444` - Error red light
- `#c82333` - Error red dark
- `#dc3545` - Danger red
- `#f8d7da` - Error background
- `#f5c6cb` - Error background light
- `#721c24` - Error text dark

### Info Colors
- `#17a2b8` - Info blue
- `#138496` - Info blue dark
- `#d1ecf1` - Info background
- `#0c5460` - Info text dark

---

## 7. 🌈 Gradients (Complete Gradient Strings)

### Green Gradients (Primary)
```css
/* Header Gradients */
linear-gradient(135deg, #245305 0%, #3a6b1f 100%)
linear-gradient(135deg, #2d5016 0%, #3a6b1f 100%)
linear-gradient(135deg, #4a7c3c 0%, #6db850 100%)
linear-gradient(135deg, #2c5419 0%, #4a7c3c 100%)

/* Button & Card Gradients */
linear-gradient(90deg, #2d5016 0%, #3a6b1f 100%)
linear-gradient(135deg, #4caf50 0%, #45a049 100%)
linear-gradient(to bottom, #fafbfc 0%, white 100%)

/* Background Gradients */
linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)
```

### Purple/Blue Gradients (Dashboard Cards)
```css
linear-gradient(135deg, #667eea 0%, #764ba2 100%)
linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)
```

### Special Gradients
```css
/* Gold/Yellow Gradient */
linear-gradient(135deg, #ffd700, #ffed4e)

/* Orange Gradient (Warning) */
linear-gradient(135deg, #ff9800, #f57c00)

/* Purple Gradient */
linear-gradient(135deg, #9c27b0, #7b1fa2)

/* Red Gradient (Error) */
linear-gradient(135deg, #ef4444, #dc2626)

/* Background Gradient */
linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)
```

---

## 8. 👥 Role-Based Color Groups

### 🌾 Farmer Colors
**Primary Theme:** Green & Earthy Tones

**Main Colors:**
- `#2c5530` - Farmer primary green (headings)
- `#28a745` - Farmer action green (buttons)
- `#218838` - Farmer action green dark (hover)
- `#4a7c3c` - Farmer sage green
- `#6db850` - Farmer light green

**Backgrounds:**
- `#f8f9fa` - Farmer page background
- `#f0f9f4` - Farmer card background (light green tint)
- `#d4edda` - Farmer success background

**Borders & Accents:**
- `#28a745` - Farmer active border
- `rgba(44, 95, 48, 0.1)` - Farmer shadow

**Gradients:**
```css
linear-gradient(135deg, #4a7c3c 0%, #6db850 100%)
linear-gradient(135deg, #2c5419 0%, #4a7c3c 100%)
```

---

### 🏭 Factory Colors  
**Primary Theme:** Industrial Green & Gray

**Main Colors:**
- `#245305` - Factory deep green (headers)
- `#2d5016` - Factory dark green
- `#3a6b1f` - Factory medium green
- `#4caf50` - Factory success green
- `#45a049` - Factory action green (hover)

**Backgrounds:**
- `#f5f7fa` - Factory page background
- `#fafbfc` - Factory card background
- `#e9ecef` - Factory section background

**Borders & Accents:**
- `#2c5530` - Factory border accent
- `rgba(45, 80, 22, 0.2)` - Factory shadow

**Gradients:**
```css
linear-gradient(135deg, #245305 0%, #3a6b1f 100%)
linear-gradient(135deg, #2d5016 0%, #3a6b1f 100%)
linear-gradient(90deg, #2d5016 0%, #3a6b1f 100%)
linear-gradient(135deg, #4caf50 0%, #45a049 100%)
linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) /* Dashboard */
```

**Status Badges:**
- Pending: `linear-gradient(135deg, #ffc107, #ff9800)`
- Accepted: `linear-gradient(135deg, #28a745, #20c997)`
- Declined: `linear-gradient(135deg, #dc3545, #c82333)`

---

### 🎯 HHM (Hub Head Manager) Colors
**Primary Theme:** Forest Green & Professional

**Main Colors:**
- `#2c5530` - HHM primary green
- `#2c5f2d` - HHM base green
- `#1e4620` - HHM dark green
- `#18371a` - HHM darker green
- `#4a7c59` - HHM medium green

**Backgrounds:**
- `#f8f9fa` - HHM page background
- `#dcf2e2` - HHM light green background
- `#bce5ca` - HHM card background tint

**Borders & Accents:**
- `#2c5530` - HHM active border
- `#4caf50` - HHM action border

**Gradients:**
```css
linear-gradient(135deg, #2c5f2d 0%, #1e4620 100%)
linear-gradient(135deg, #245305 0%, #3a6b1f 100%)
```

---

### 👷 Worker Colors
**Primary Theme:** Blue & Neutral

**Main Colors:**
- `#17a2b8` - Worker info blue
- `#138496` - Worker info blue dark
- `#667eea` - Worker accent blue
- `#5a6fd8` - Worker blue variant

**Backgrounds:**
- `#f8f9fa` - Worker page background
- `#d1ecf1` - Worker info background

**Borders & Accents:**
- `#17a2b8` - Worker border
- `#0c5460` - Worker text dark

**Gradients:**
```css
linear-gradient(135deg, #667eea 0%, #764ba2 100%)
linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)
```

---

### 🔧 Admin Colors
**Primary Theme:** Purple & Gray

**Main Colors:**
- `#764ba2` - Admin purple
- `#9c27b0` - Admin purple light
- `#7b1fa2` - Admin purple dark
- `#6a4190` - Admin purple variant

**Backgrounds:**
- `#f8f9fa` - Admin page background
- `#e9ecef` - Admin section background

**Gradients:**
```css
linear-gradient(135deg, #9c27b0, #7b1fa2)
linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

---

## 📊 Summary Statistics

- **Total Unique HEX Colors:** 85+
- **Total Unique RGB/RGBA Values:** 30+
- **Total Unique Gradients:** 20+
- **Primary Theme:** Green (Sugarcane/Agriculture)
- **Secondary Themes:** Gray (Neutral), Blue (Info), Red (Error), Orange (Warning)

---

## 🎨 Color Usage Guidelines

### Primary Actions
- Use `#28a745` or `#4caf50` for primary action buttons
- Use green gradients for headers and hero sections

### Danger/Destructive Actions
- Use `#dc3545` or `#ef4444` for delete/cancel buttons
- Use red backgrounds for error states

### Info/Secondary Actions
- Use `#17a2b8` for informational elements
- Use gray colors for secondary actions

### Status Indicators
- **Success:** Green (`#28a745`, `#4caf50`)
- **Warning:** Orange/Amber (`#ffc107`, `#ff9800`)
- **Error:** Red (`#dc3545`, `#ef4444`)
- **Info:** Blue (`#17a2b8`)
- **Neutral:** Gray (`#6c757d`)

---

**Generated:** November 13, 2025  
**Platform:** Sugarcane Platform  
**Version:** Complete Color Audit
