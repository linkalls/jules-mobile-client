# Changelog

All notable changes to Jules Mobile Client will be documented in this file.

## [Unreleased]

### Added
- **Search Functionality**: Real-time search of sessions by title or name
- **Sort Options**: Sort sessions by newest, oldest, or title
- **Filter by Status**: Filter sessions by Active, Completed, Failed, or All
- **Filter Modal**: Modern UI with gradient design for sort and filter options
- **App Version Display**: Shows current app version in Settings screen
- **Retry Mechanism**: Added retry button to error messages for better UX
- **Accessibility Labels**: Comprehensive accessibility support with labels and hints
- **Internationalization**: Added 16+ new translation keys for Japanese and English
- **Dark Theme Documentation**: Created guide for adding dark theme screenshots

### Changed
- **README.md**: Updated with comprehensive feature list and new features section
- **Error Handling**: Improved with user-friendly messages and retry functionality
- **Empty States**: Different messages for no sessions vs. no search results

### Security
- **Production Logging**: Removed debug console.log statements from production builds
- **Development Guards**: Added `__DEV__` checks for development-only logging
- **CodeQL Scan**: Passed security scan with 0 vulnerabilities

### Performance
- **Optimized Filtering**: Used useMemo for filtered and sorted session data
- **Constants Extraction**: Moved filter/sort options to constants for better maintainability

## [1.0.0] - Initial Release

### Core Features
- Cross-platform mobile app for Jules AI coding assistant
- Full dark/light theme support with auto-detection
- Japanese and English localization
- Secure API key storage with expo-secure-store
- Real-time chat interface with Jules sessions
- Markdown rendering with syntax highlighting
- Session management (list, create, view)
- Plan approval workflow
- Recent repositories tracking
- Modern gradient-based UI design
- Haptic feedback on interactions
- Optimized performance with memoized components
