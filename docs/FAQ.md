# Frequently Asked Questions (FAQ)

## General Questions

### What is Jules Mobile Client?

Jules Mobile Client is a cross-platform mobile application for interacting with Google's Jules AI coding assistant. It allows you to create, manage, and monitor coding sessions directly from your iOS or Android device.

### Is this an official Google app?

No, Jules Mobile Client is an independent, open-source project created by the community. It uses the official Jules API but is not affiliated with or endorsed by Google.

### What platforms are supported?

- **iOS**: Requires iOS 13.0 or later
- **Android**: Requires Android 5.0 (API level 21) or later
- **Web**: Limited support via Expo web (some features unavailable)

### Is it free?

Yes! Jules Mobile Client is free and open-source under the BSD 2-Clause License. However, you need a Jules API key from Google Cloud, which may have associated costs depending on usage.

---

## Getting Started

### How do I get a Jules API key?

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Jules API (v1alpha)
4. Go to "APIs & Services" > "Credentials"
5. Create an API key
6. Copy the key and paste it in the app's Settings screen

### Why can't I see any sessions?

Possible reasons:
- **No API key set**: Add your API key in Settings
- **No sessions created**: Create a new session using the "+" button
- **API key invalid**: Verify your key in Settings
- **Network issue**: Check your internet connection

Try:
1. Pull down to refresh on the Sessions screen
2. Check Settings > Verify API key is saved
3. Create a test session

### How do I create my first session?

1. Tap the **"+"** button on the Sessions screen
2. Select a repository from the dropdown
3. Enter a task description (e.g., "Fix login bug")
4. Choose Start or Review mode
5. Tap "Create Session"

---

## Features

### What's the difference between Start and Review modes?

- **Start Mode** (Default):
  - Jules automatically executes approved plans
  - Best for quick tasks
  - Less manual intervention

- **Review Mode**:
  - Requires manual approval for each plan
  - More control over changes
  - Review before execution

Choose the mode when creating a session.

### Can I upload images or files?

The UI is prepared for photo uploads using `expo-image-picker`, but the **Jules API (v1alpha) does not currently support image attachments**. This feature will be available when the API adds support.

### Does it support dark mode?

Yes! Dark mode is fully supported:
- Auto-detects system theme by default
- Manual toggle in Settings
- All screens optimized for dark mode

### What languages are supported?

Currently supported languages:
- 🇯🇵 **Japanese** (日本語)
- 🇺🇸 **English**

Want to add more languages? Check our [Contributing Guide](../CONTRIBUTING.md)!

### Can I search for sessions?

Yes! Use the search bar at the top of the Sessions screen to search by:
- Session title
- Repository name
- Session ID

### Can I filter sessions?

Yes! Tap the filter icon to:
- **Sort**: By newest, oldest, or title
- **Filter by status**: Active, Completed, Failed, or All

---

## Session Management

### How do I view session details?

Tap on any session card in the Sessions list to view:
- Full chat history
- Activities and updates
- Generated plans
- Status and metadata

### How do I approve a plan?

If you created a session in **Review mode**:
1. Open the session
2. Scroll to the plan approval request
3. Review the plan steps
4. Tap "Approve Plan"

Or approve from the Sessions list using the "Approve" button.

### Can I delete sessions?

Currently, the app does not support deleting sessions. Sessions are managed through the Jules API and Google Cloud Console.

### What do the session status badges mean?

| Status | Meaning |
|--------|---------|
| 🟢 **Active** | Session is currently running |
| 🔵 **Completed** | Session finished successfully |
| 🔴 **Failed** | Session encountered an error |
| 🟡 **Queued** | Session waiting to start |
| 🟠 **Planning** | AI is generating a plan |

### Can I pause or stop a session?

Session control (pause/stop) is not currently supported in the mobile app. Sessions run until completion or failure.

---

## Repositories

### Why don't I see my repositories?

Repositories must be connected to your Google Cloud project:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to Jules settings
3. Connect your GitHub repositories
4. Refresh the app

### What's the "Recent Repositories" section?

Recent Repositories shows repos you've used in previous sessions for quick access. They appear at the top of the repository list when creating a new session.

### Can I add custom repositories?

Repositories must be configured through Google Cloud Console. The app displays repositories available through the Jules API.

---

## Technical Questions

### What technology stack is used?

- **Framework**: Expo SDK 54
- **UI**: React Native 0.81
- **Language**: TypeScript 5.3
- **Routing**: Expo Router 4.x
- **Package Manager**: Bun (recommended) or npm

See [docs/ARCHITECTURE.md](ARCHITECTURE.md) for detailed architecture.

### Does it work offline?

Limited offline support:
- Previously loaded data is cached
- Cannot create sessions or fetch new data offline
- An internet connection is required for most features

### Is my API key secure?

Yes! API keys are stored using `expo-secure-store`:
- **iOS**: Stored in Keychain
- **Android**: Stored in EncryptedSharedPreferences
- **Web**: Stored in browser localStorage (less secure)

Never share your API key with others.

### Can I use this with my own AI backend?

The app is specifically designed for the Jules API. To use a different backend, you would need to:
1. Fork the repository
2. Modify `hooks/use-jules-api.ts`
3. Update API endpoints and data models

---

## Performance

### Why is the app slow?

Common causes:
- **Large session list**: Filter or search to reduce visible items
- **Slow network**: Check internet connection
- **Outdated app**: Update to the latest version
- **Device limitations**: Older devices may be slower

See [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) for optimization tips.

### Does it drain battery?

The app is optimized for battery efficiency:
- No background polling by default
- Pull-to-refresh manual updates
- Minimal animations

---

## Privacy & Security

### What data is collected?

The app does NOT collect any personal data or analytics. All data:
- API calls go directly to Google's Jules API
- API keys stored locally on device
- No third-party tracking

### Is the source code available?

Yes! Jules Mobile Client is fully open-source:
- **Repository**: [github.com/linkalls/jules-mobile-client](https://github.com/linkalls/jules-mobile-client)
- **License**: BSD 2-Clause
- **Contributions**: Welcome!

### Can I self-host this app?

Yes! You can:
1. Clone the repository
2. Build using EAS Build or locally
3. Distribute via TestFlight (iOS) or APK (Android)
4. No server required - all API calls go to Google

---

## Troubleshooting

### The app crashes on startup

Try:
1. **Restart device**
2. **Reinstall app**:
   - Delete app
   - Reinstall from store or rebuild
3. **Clear data**: Uninstall removes all local data

### "Network request failed" error

Solutions:
1. Check internet connection
2. Verify API key in Settings
3. Try on different network (disable VPN)
4. Check Jules API status

See [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more solutions.

### Sessions not refreshing

Try:
1. **Pull down** to refresh manually
2. **Check API key** in Settings
3. **Restart app**
4. **Reinstall** if issue persists

### Dark mode not working

1. Go to **Settings**
2. Toggle **Dark Mode** switch
3. Restart app if needed

Or enable system-wide dark mode on your device.

---

## Contributing

### How can I contribute?

We welcome contributions! You can:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation
- Add translations

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.

### I found a bug. What should I do?

1. Check [existing issues](https://github.com/linkalls/jules-mobile-client/issues)
2. If not reported, open a new issue with:
   - Description
   - Steps to reproduce
   - Screenshots
   - Device/platform info

### I have a feature idea

Great! Open a feature request issue with:
- Problem it solves
- Proposed solution
- Use cases
- Mockups (if applicable)

---

## Building & Development

### Can I build the app myself?

Yes! See [docs/DEVELOPMENT.md](DEVELOPMENT.md) for setup instructions:

```bash
git clone https://github.com/linkalls/jules-mobile-client.git
cd jules-mobile-client
bun install
bun start
```

### How do I create a production build?

Using EAS Build:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build Android
eas build --platform android --profile production

# Build iOS
eas build --platform ios --profile production
```

See [README.md](../README.md#building-for-production) for details.

### Can I contribute without coding?

Absolutely! You can:
- Improve documentation
- Report bugs
- Test features
- Suggest UI/UX improvements
- Help with translations
- Create tutorials or videos

---

## Roadmap

### What features are planned?

Potential future features (not committed):
- Session export/sharing
- Offline mode
- Push notifications
- Statistics dashboard
- Multi-account support
- Custom themes
- More languages

Check [GitHub Issues](https://github.com/linkalls/jules-mobile-client/issues) for active discussions.

### When will X feature be added?

This is a community-driven open-source project. Feature timelines depend on:
- Community contributions
- Maintainer availability
- Jules API capabilities

Want it sooner? Consider contributing!

---

## Still Have Questions?

- 📖 **Read the docs**: [docs/](../docs/)
- 🐛 **Report issues**: [GitHub Issues](https://github.com/linkalls/jules-mobile-client/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/linkalls/jules-mobile-client/discussions)
- 📧 **Contact**: See repository for contact info

---

**Didn't find your answer?** Open an issue with the "question" label!
