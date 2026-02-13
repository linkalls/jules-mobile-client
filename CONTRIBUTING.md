# Contributing to Jules Mobile Client

Thank you for considering contributing to Jules Mobile Client! This document provides guidelines and instructions for contributing to the project.

## 🌟 Ways to Contribute

- **Report Bugs**: Submit detailed bug reports via GitHub Issues
- **Suggest Features**: Share ideas for new features or improvements
- **Submit PRs**: Contribute code fixes, features, or documentation
- **Improve Documentation**: Help us make our docs clearer and more comprehensive
- **Translations**: Add or improve translations for additional languages

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- [Git](https://git-scm.com/)
- iOS: Xcode 15+ with iOS Simulator
- Android: Android Studio with emulator

### Development Setup

1. **Fork and Clone**

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/jules-mobile-client.git
cd jules-mobile-client

# Add upstream remote
git remote add upstream https://github.com/linkalls/jules-mobile-client.git
```

2. **Install Dependencies**

```bash
# Using Bun (recommended)
bun install

# Or using npm
npm install
```

3. **Start Development Server**

```bash
bun start
```

4. **Run on Device**

```bash
# iOS
bun ios

# Android
bun android
```

## 📝 Contribution Guidelines

### Code Style

- **TypeScript**: Use strict types, avoid `any`
- **React**: Use functional components with hooks
- **Naming**: Use camelCase for variables, PascalCase for components
- **Comments**: Add JSDoc comments for public APIs and complex logic
- **Formatting**: Run `bun lint` before committing

### File Organization

```
app/                    # Expo Router screens
components/            # Reusable components
  ├── jules/          # Domain-specific components
  └── ui/             # Generic UI components
constants/            # Types, translations, theme
hooks/               # Custom React hooks
docs/                # Documentation
```

### Component Guidelines

1. **Always support dark mode**:

```tsx
const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';
const colors = isDark ? Colors.dark : Colors.light;
```

2. **Add i18n support**:

```tsx
const { t } = useI18n();
// Add keys to constants/i18n.ts
```

3. **Include accessibility labels**:

```tsx
<TouchableOpacity
  accessibilityLabel={t('buttonLabel')}
  accessibilityHint={t('buttonHint')}
>
```

4. **Use haptic feedback**:

```tsx
import * as Haptics from 'expo-haptics';

Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

### Adding Translations

Add new translation keys to **both** languages in `constants/i18n.ts`:

```typescript
const translations = {
  ja: {
    myNewKey: '日本語テキスト',
  },
  en: {
    myNewKey: 'English text',
  },
};
```

### Testing

Before submitting a PR:

1. **Run the linter**:

```bash
bun lint
```

2. **Type check**:

```bash
bunx tsc --noEmit
```

3. **Test on both platforms** (if possible):

```bash
bun ios
bun android
```

4. **Test in both themes** (light and dark)

5. **Test in both languages** (Japanese and English)

## 🔀 Pull Request Process

### Before Submitting

1. **Create a feature branch**:

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** following the guidelines above

3. **Commit with clear messages**:

```bash
git commit -m "feat: add session export functionality"
git commit -m "fix: resolve dark mode issue in settings"
git commit -m "docs: update API reference"
```

Commit message prefixes:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Build process or tooling changes

4. **Keep commits focused**: Each commit should represent a single logical change

5. **Update documentation** if your changes affect:
   - API endpoints
   - Component props
   - Configuration
   - User-facing features

### Submitting the PR

1. **Push to your fork**:

```bash
git push origin feature/your-feature-name
```

2. **Open a Pull Request** on GitHub

3. **Fill out the PR template** with:
   - Description of changes
   - Related issue number (if applicable)
   - Screenshots/videos (for UI changes)
   - Testing steps

4. **Wait for review** - maintainers will review your PR

5. **Address feedback** - make requested changes if needed

### PR Review Criteria

- ✅ Code follows project style guidelines
- ✅ Changes are well-tested
- ✅ Documentation is updated
- ✅ No breaking changes (or clearly documented)
- ✅ Commit messages are clear
- ✅ Dark mode support
- ✅ Internationalization support
- ✅ Accessibility considerations

## 🐛 Reporting Bugs

### Bug Report Template

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**:
   - Step 1
   - Step 2
   - Step 3
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**:
   - App version
   - Platform (iOS/Android)
   - OS version
   - Device model
6. **Screenshots**: If applicable
7. **Logs**: Any relevant error messages

## 💡 Suggesting Features

### Feature Request Template

1. **Problem Statement**: What problem does this solve?
2. **Proposed Solution**: How should it work?
3. **Alternatives Considered**: Other solutions you've thought about
4. **Additional Context**: Mockups, examples, etc.

## 📚 Documentation Contributions

We always welcome documentation improvements! Areas that need help:

- Clarifying existing documentation
- Adding examples and tutorials
- Improving API reference
- Adding troubleshooting guides
- Creating video tutorials
- Translating documentation

## 🌍 Translation Contributions

To add a new language:

1. Add the language to `constants/i18n.ts`:

```typescript
const translations = {
  ja: { /* Japanese translations */ },
  en: { /* English translations */ },
  es: { /* Spanish translations */ }, // New language
};
```

2. Update the language selector in `app/(tabs)/settings.tsx`

3. Update README to mention the new language

4. Test all screens in the new language

## 🔒 Security

If you discover a security vulnerability, please **do not** open a public issue. Instead, email the maintainers directly at the email listed in the repository.

## 📜 Code of Conduct

### Our Pledge

In the interest of fostering an open and welcoming environment, we as contributors and maintainers pledge to make participation in our project and our community a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment:

- **Be respectful** and inclusive in language and actions
- **Be collaborative** and constructive in feedback
- **Focus on what's best** for the community and project
- **Show empathy** towards other contributors and users
- Gracefully accepting constructive criticism
- Using welcoming and inclusive language
- Respecting differing viewpoints and experiences
- Focusing on what is best for the community
- Showing empathy towards other community members

### Unacceptable Behavior

Examples of unacceptable behavior include:

- Harassment or discriminatory language or imagery
- Trolling, insulting, or derogatory comments
- Personal or political attacks
- Public or private harassment
- Publishing others' private information without permission
- Sexual language or imagery and unwelcome sexual attention
- Other conduct which could reasonably be considered inappropriate

### Our Responsibilities

Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned with this Code of Conduct, or to ban temporarily or permanently any contributor for other behaviors that they deem inappropriate, threatening, offensive, or harmful.

### Scope

This Code of Conduct applies both within project spaces and in public spaces when an individual is representing the project or its community. Examples include using an official project e-mail address, posting via an official social media account, or acting as an appointed representative at an online or offline event.

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project maintainers. All complaints will be reviewed and investigated and will result in a response that is deemed necessary and appropriate to the circumstances. The project team is obligated to maintain confidentiality with regard to the reporter of an incident.

### Attribution

This Code of Conduct is adapted from the [Contributor Covenant](https://www.contributor-covenant.org/), version 2.0.

## ❓ Questions?

If you have questions about contributing:

1. Check the [documentation](docs/)
2. Search [existing issues](https://github.com/linkalls/jules-mobile-client/issues)
3. Open a new issue with the "question" label

## 📄 License

By contributing, you agree that your contributions will be licensed under the BSD 2-Clause License.

---

Thank you for contributing to Jules Mobile Client! 🎉
