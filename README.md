# Jules Mobile Client

<p align="center">
  <img src="assets/images/icon.png" alt="Jules Mobile Client" width="120" />
</p>

<p align="center">
  <strong>A React Native mobile client for Google's Jules AI coding assistant</strong>
</p>

<p align="center">
  <a href="README.ja.md">🇯🇵 日本語</a> •
  <a href="docs/ARCHITECTURE.md">📐 Architecture</a> •
  <a href="docs/API.md">🔌 API Reference</a>
</p>

---

## ✨ Features

- 📱 **Cross-Platform** - Works on iOS and Android via Expo
- 🌙 **Dark Mode** - Full dark/light theme support
- 🌐 **i18n** - Japanese and English localization
- 🔐 **Secure Storage** - API keys stored securely with expo-secure-store
- 💬 **Real-time Chat** - View and interact with Jules sessions
- 📝 **Markdown Support** - Rich text rendering with syntax highlighting
- ⚡ **Optimized Performance** - Memoized components and efficient list rendering

## 📸 Screenshots

| Sessions | Session Detail | Create Task | Settings |
|----------|---------------|-------------|----------|
| View all active sessions | Chat with Jules AI | Create new coding tasks | Configure API key |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Bun](https://bun.sh/) (recommended) or npm
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Jules API Key](https://console.cloud.google.com/) from Google Cloud Console

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/jules-mobile-client.git
cd jules-mobile-client

# Install dependencies
bun install

# Start the development server
bun start
```

### Running on Device

```bash
# iOS Simulator
bun ios

# Android Emulator
bun android

# Web Browser
bun web
```

## ⚙️ Configuration

### API Key Setup

1. Open the app
2. Navigate to **Settings** tab
3. Enter your Jules API Key
4. The key is securely stored on your device

> 💡 Get your API key from [Google Cloud Console](https://console.cloud.google.com/) or Jules Settings page.

## 📂 Project Structure

```
jules-mobile-client/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Sessions list
│   │   └── settings.tsx   # Settings screen
│   ├── session/[id].tsx   # Session detail/chat
│   ├── create-session.tsx # New task creation
│   └── _layout.tsx        # Root layout
├── components/
│   ├── jules/             # Jules-specific components
│   │   ├── activity-item.tsx
│   │   ├── session-card.tsx
│   │   └── loading-overlay.tsx
│   └── ui/                # Generic UI components
├── constants/
│   ├── types.ts           # TypeScript types
│   ├── i18n.ts            # Translations
│   └── theme.ts           # Color schemes
├── hooks/
│   ├── use-jules-api.ts   # Jules API hook
│   └── use-secure-storage.ts
└── docs/                  # Documentation
```

## 🔌 Jules API Integration

The app integrates with the [Jules API](https://jules.googleapis.com/v1alpha) to:

- **List Sessions** - View all coding sessions
- **Create Sessions** - Start new tasks with repository context
- **View Activities** - Real-time chat history with polling
- **Approve Plans** - Confirm AI-generated plans

See [API Reference](docs/API.md) for detailed documentation.

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Expo SDK 54](https://expo.dev/) | React Native framework |
| [Expo Router](https://docs.expo.dev/router/introduction/) | File-based routing |
| [React Native 0.81](https://reactnative.dev/) | Mobile UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) | Secure storage |
| [react-native-markdown-display](https://github.com/iamacup/react-native-markdown-display) | Markdown rendering |

## 📱 Building for Production

### Using EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android (APK)
eas build --platform android --profile production

# Build for iOS
eas build --platform ios --profile production
```

### Build Profiles

| Profile | Description |
|---------|-------------|
| `development` | Development client with debugging |
| `preview` | Internal distribution APK |
| `production` | Production-ready build |

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Jules](https://jules.google/) - AI coding assistant
- [Expo](https://expo.dev/) - Amazing React Native tooling
- [React Native](https://reactnative.dev/) - Mobile framework

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/linkalls">linkalls</a>
</p>
