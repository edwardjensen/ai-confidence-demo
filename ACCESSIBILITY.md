# Accessibility Features

This application has been enhanced with comprehensive accessibility features to ensure it works well with screen readers and keyboard navigation.

## Key Accessibility Features

### Keyboard Navigation
- **Skip to main content** link for users who navigate with keyboards
- **Focus trapping** in modal dialogs
- **Escape key** support to close modals
- **Enhanced focus indicators** with visible outlines and high contrast
- **Tab navigation** through all interactive elements

### Screen Reader Support
- **ARIA landmarks** (`main`, `complementary`, `contentinfo`) for navigation
- **Proper heading hierarchy** (h1-h5) for content structure
- **ARIA labels and descriptions** for all interactive elements
- **Live regions** for dynamic content announcements
- **Role attributes** for custom UI components
- **Descriptive alt text** for images and icons

### Form Accessibility
- **Proper labels** for all form inputs (visible and hidden for screen readers)
- **Required field indicators** with `aria-required`
- **Field descriptions** linked with `aria-describedby`
- **Error handling** with focus management

### Modal Accessibility
- **Focus management** - focus is trapped within modals and restored on close
- **ARIA modal attributes** (`aria-modal="true"`, `role="dialog"`)
- **Keyboard navigation** within modals
- **Background scrolling prevention** when modals are open

### Visual Accessibility
- **High contrast mode** support with CSS media queries
- **Reduced motion** support for users with vestibular disorders
- **Large touch targets** for mobile accessibility
- **Color contrast compliance** with WCAG guidelines
- **Text scaling** support up to 200% zoom

### Interactive Element Enhancements
- **Temperature slider** with proper ARIA attributes and value announcements
- **Toggle switches** with clear state indicators
- **Buttons** with descriptive labels and states
- **Links** with context for external navigation

### Content Structure
- **Semantic HTML** using proper elements (`section`, `article`, `aside`, `header`, `footer`)
- **List structures** for grouped content
- **Proper table headers** if tables are present
- **Meaningful text** for all interactive elements

## Screen Reader Testing

This application has been designed to work with popular screen readers including:
- **NVDA** (Windows)
- **JAWS** (Windows)  
- **VoiceOver** (macOS/iOS)
- **TalkBack** (Android)

## Keyboard Shortcuts

- **Tab / Shift+Tab**: Navigate between interactive elements
- **Enter / Space**: Activate buttons and links
- **Escape**: Close modal dialogs
- **Arrow keys**: Navigate within components (when applicable)

## Browser Support

Accessibility features are supported in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## WCAG Compliance

This application aims to meet WCAG 2.1 AA standards including:
- **Perceivable**: Information presented in multiple ways
- **Operable**: Interface components are operable by various input methods
- **Understandable**: Information and UI operation is understandable
- **Robust**: Content can be interpreted by various assistive technologies

## Testing Tools

For accessibility testing, consider using:
- **axe-core** browser extension
- **WAVE** web accessibility evaluation tool
- **Lighthouse** accessibility audit
- **Screen reader** testing with actual assistive technology

## Future Improvements

Planned accessibility enhancements:
- **Voice navigation** support
- **Enhanced mobile** accessibility
- **Multi-language** screen reader support
- **Custom keyboard shortcuts**
