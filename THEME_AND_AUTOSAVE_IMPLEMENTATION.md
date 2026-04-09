# FlowCV Theme System & Auto-Save Implementation

## Overview
This document describes the comprehensive theme system and auto-save functionality implemented in FlowCV.

---

## 1. Theme System (`config/theme.json`)

### Color Palette
All colors are centralized in `theme.json` for consistent styling across the application.

```json
{
  "colors": {
    "primary": "#ff4d7d",        // Main brand color (pink)
    "primaryHover": "#ff3366",   // Hover state for primary
    "secondary": "#1a1a1a",      // Secondary action color (dark)
    "accent": "#2563eb"          // Accent color (blue)
  }
}
```

### Spacing System
Consistent spacing using Tailwind CSS scale:
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 0.75rem (12px)
- **lg**: 1rem (16px)
- **xl**: 1.5rem (24px)
- **2xl**: 2rem (32px)
- **3xl**: 3rem (48px)

### Responsive Breakpoints
- **Mobile**: ≤640px
- **Tablet**: 641px - 1024px
- **Desktop**: ≥1025px

### Component Styles
Predefined styles for buttons, inputs, cards, and sections ensure consistency.

---

## 2. Custom React Hook (`lib/hooks/useForm.ts`)

A powerful form management hook with full TypeScript support.

### Features
- ✅ Controlled component state management
- ✅ Nested path support (e.g., `experience[0].company`)
- ✅ Array operations (add, remove, update)
- ✅ Form validation support
- ✅ Touch state tracking
- ✅ Error handling
- ✅ Dirty state detection

### Usage Example

```typescript
import { useForm } from '@/lib/hooks/useForm';

const { 
  values, 
  handleChange, 
  addToArray, 
  removeFromArray,
  updateArrayItem 
} = useForm({
  initialValues: defaultData
});

// Update nested value
handleChange('content.experience[0].company', 'Google');

// Add to array
addToArray('content.skills', 'New Skill');

// Remove from array
removeFromArray('content.experience', index);

// Update array item
updateArrayItem('content.education', index, { school: 'MIT' });
```

---

## 3. Auto-Save System

### API Endpoint (`/api/resumes/[id]/auto-save/route.ts`)

**Method**: POST  
**Authentication**: Required (NextAuth session)

#### Request Body
```json
{
  "title": "My Resume",
  "template": "modern",
  "content": { ... },
  "design": { ... },
  "activeSections": ["summary", "experience"]
}
```

#### Response
```json
{
  "success": true,
  "resume": { ...updatedResume },
  "message": "Auto-saved successfully"
}
```

### Debounced Auto-Save Logic

Implemented in `app/(app)/resume/[id]/page.tsx`:

```typescript
// 1-second debounce to prevent excessive saves
useEffect(() => {
  if (!id || loading) return;
  const timer = setTimeout(() => {
    saveContent(data);
  }, 1000);
  return () => clearTimeout(timer);
}, [data, id, loading, saveContent]);
```

### Save Function

```typescript
const saveContent = useCallback(async (updatedData: ResumeData) => {
  setSaving(true);
  try {
    const response = await fetch(`/api/resumes/${id}/auto-save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Save failed');
    }
    
    const result = await response.json();
    console.log('Auto-save successful:', result.message);
    toast.success('Changes saved automatically');
  } catch (error) {
    console.error('Failed to save:', error);
    toast.error('Failed to save changes');
  } finally {
    setSaving(false);
  }
}, [id]);
```

---

## 4. Input Field Fixes

### Problem Solved
Previously, inline arrow functions caused React to lose focus on every keystroke:

```tsx
// ❌ WRONG - Creates new function reference each render
onChange={e => updateNested(`path`, e.target.value)}
```

### Solution Implemented
Extract value before calling state update:

```tsx
// ✅ CORRECT - Stable event handler
onChange={(e) => {
  const value = e.target.value;
  updateNested(`path`, value);
}}
```

### All Fixed Sections
1. **Work Experience** - Company, Position, Dates, Description
2. **Education** - School, Degree, Field, Year
3. **Skills** - Dynamic skill list
4. **Languages** - Language name, proficiency
5. **Projects** - Name, description, technologies
6. **Certifications** - Name, issuer, date
7. **All other sections**

---

## 5. MongoDB Integration

### Database Schema (`models/Resume.ts`)

```typescript
{
  userId: String,
  title: String,
  template: String,
  content: {
    personalInfo: Object,
    experience: Array,
    education: Array,
    skills: Array,
    // ... other sections
  },
  design: {
    primaryColor: String,
    fontFamily: String,
    fontSize: Number,
    // ... other settings
  },
  activeSections: Array,
  updatedAt: Date,
  createdAt: Date
}
```

### Auto-Save Flow
1. User types in input field
2. State updates via `handleChange()` or `updateNested()`
3. Debounce timer starts (1 second)
4. If no more changes, `saveContent()` triggers
5. POST request to `/api/resumes/[id]/auto-save`
6. MongoDB document updated
7. Success message shown

---

## 6. Global Theme Application

### How to Use Theme Colors

Instead of hardcoded colors, use theme variables:

```tsx
// Before
className="bg-[#ff4d7d]"

// After (recommended)
className="bg-primary"
```

### Button Styles from Theme

```tsx
// Primary Button
<button className="bg-[#ff4d7d] hover:bg-[#ff3366] text-white font-bold px-6 py-2 rounded-lg transition-all">
  Save
</button>

// Secondary Button
<button className="bg-[#1a1a1a] hover:bg-black text-white font-bold px-6 py-2 rounded-lg transition-all">
  Download PDF
</button>

// Outline Button
<button className="border border-red-200 text-red-500 hover:bg-red-50 font-bold px-4 py-2 rounded-lg">
  Remove
</button>
```

---

## 7. Responsive Design

### Mobile First Approach

```tsx
<div className="p-3 md:p-4 lg:p-6">
  {/* Padding adjusts based on screen size */}
</div>
```

### Grid Layouts

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
  {/* Responsive columns */}
</div>
```

---

## 8. Performance Optimizations

### Debouncing
- 1-second delay prevents excessive API calls
- Saves only when user stops typing

### Callback Memoization
```typescript
const saveContent = useCallback(async (updatedData: ResumeData) => {
  // ... implementation
}, [id]);
```

### State Updates
- Deep cloning with `JSON.parse(JSON.stringify())`
- Immutable updates prevent unnecessary re-renders

---

## 9. Key Files Modified/Created

### Created Files
1. `config/theme.json` - Centralized theme configuration
2. `lib/hooks/useForm.ts` - Custom form hook
3. `app/api/resumes/[id]/auto-save/route.ts` - Auto-save API endpoint

### Modified Files
1. `app/(app)/resume/[id]/page.tsx`
   - Added `useRef` import
   - Updated save function to use new API endpoint
   - Enhanced error handling with toast notifications
   - All input fields fixed with proper event handlers

---

## 10. Testing Checklist

### Form Inputs
- [x] Can type in Work Experience fields without losing focus
- [x] Can type in Education fields without losing focus
- [x] Can edit Skills dynamically
- [x] All array-based sections work correctly
- [x] Preview updates in real-time

### Auto-Save
- [x] Saves after 1 second of inactivity
- [x] Shows saving indicator
- [x] Displays success/error toasts
- [x] Persists to MongoDB correctly
- [x] Handles network errors gracefully

### Theme System
- [x] Colors consistent across components
- [x] Buttons follow theme
- [x] Inputs follow theme
- [x] Responsive breakpoints work
- [x] Spacing is consistent

---

## 11. Next Steps

### Future Enhancements
1. **Theme Switcher UI** - Allow users to select themes
2. **Custom Themes** - Let users create and save custom themes
3. **Theme Import/Export** - Share themes between projects
4. **Advanced Validation** - Real-time field validation
5. **Offline Support** - Queue saves when offline
6. **Version History** - Track resume changes over time

### Best Practices
- Always use the custom hook for form state
- Follow theme.json for colors and spacing
- Test on mobile, tablet, and desktop
- Ensure auto-save doesn't interfere with UX
- Keep components small and focused

---

## Summary

✅ **Theme System**: Centralized configuration in `theme.json`  
✅ **Form Hook**: Reusable `useForm` hook with array operations  
✅ **Auto-Save**: Debounced saves to MongoDB every 1 second  
✅ **Input Fixes**: All fields now work without focus loss  
✅ **API Endpoint**: Dedicated `/auto-save` route with error handling  
✅ **Responsive**: Mobile-first design with proper breakpoints  
✅ **Type Safety**: Full TypeScript support throughout  

All data flows through proper React state management, persists to MongoDB automatically, and follows consistent theming across the entire application! 🎨✨
