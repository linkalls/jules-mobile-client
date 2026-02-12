# Changelog

All notable changes to Jules Mobile Client will be documented in this file.

## [Unreleased]

### Added
- **Documentation**: Comprehensive CONTRIBUTING.md guide for contributors
- **Documentation**: TROUBLESHOOTING.md guide with common issues and solutions
- **Documentation**: FAQ.md with frequently asked questions and answers
- **GitHub Templates**: Issue templates for bug reports, feature requests, and questions
- **GitHub Templates**: Pull request template with detailed checklist
- **README Improvements**: Added badges (license, version, platform support)
- **README Improvements**: Added troubleshooting section and quick fixes
- **README Improvements**: Added comprehensive documentation table
- **README Improvements**: Added roadmap section
- **README Improvements**: Enhanced contributing section
- **Settings Screen**: Help & Resources section with links to FAQ, Troubleshooting, and GitHub
- **Icons**: Added questionmark.circle, clock, and clock.fill icons for better UX
- **Internationalization**: Added new translation keys for help and documentation links

### Changed
- **README**: Restructured with improved organization and navigation
- **README**: Added support information section
- **Settings**: Enhanced layout with new help resources section

### Documentation
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
