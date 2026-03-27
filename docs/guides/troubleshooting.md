# Troubleshooting Guide

This guide covers common issues and their solutions for Jules Mobile Client.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Build Issues](#build-issues)
- [Runtime Errors](#runtime-errors)
- [API Connection Issues](#api-connection-issues)
- [Performance Issues](#performance-issues)
- [Platform-Specific Issues](#platform-specific-issues)

---

## Installation Issues

### "Command not found: bun"

**Problem**: Bun is not installed or not in your PATH.

**Solution**:

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Or on macOS with Homebrew
brew install oven-sh/bun/bun

# Verify installation
bun --version
```

### "Unable to resolve module"

**Problem**: Dependencies are not properly installed or cache is corrupted.

**Solution**:

```bash
# Clear node_modules and reinstall
rm -rf node_modules
bun install

# Clear Metro bundler cache
bun start --clear

# Or reset the entire project
bun run reset-project
```

### Expo CLI Issues

**Problem**: Expo commands are not working.

**Solution**:

```bash
# Use bunx to run Expo commands
bunx expo start
bunx expo install <package>

# Or install Expo CLI globally
npm install -g expo-cli
```

---

## Build Issues

### Metro Bundler Failed to Start

**Problem**: The Metro bundler crashes or fails to start.

**Solution**:

```bash
# 1. Clear all caches
rm -rf node_modules
rm -rf .expo
rm -rf ~/.expo
bun install

# 2. Start with cache clearing
bun start --clear

# 3. If using npm, clear npm cache
npm cache clean --force
```

### "Invariant Violation: Native module cannot be null"

**Problem**: Required native modules are not available in Expo Go.

**Solution**:

1. **Check if using Expo Go**: Some modules like `expo-secure-store` require a development build
2. **Create a development build**:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android
```

3. **Or test on web** (limited functionality):

```bash
bun web
```

### TypeScript Errors

**Problem**: TypeScript compilation errors.

**Solution**:

```bash
# Check types without emitting files
bunx tsc --noEmit

# If types are outdated, reinstall
rm -rf node_modules
bun install
```

### Build Size Too Large

**Problem**: APK/IPA file is too large.

**Solution**:

1. **Use production profile**:

```bash
eas build --profile production --platform android
```

2. **Check for large assets** in `assets/` directory

3. **Enable Hermes** (already enabled in this project)

---

## Runtime Errors

### "Network request failed"

**Problem**: Unable to connect to Jules API.

**Solution**:

1. **Check API key**:
   - Go to Settings
   - Verify your Jules API key is correct
   - Get a new key from [Google Cloud Console](https://console.cloud.google.com/)

2. **Check internet connection**:
   - Ensure device has active internet
   - Try disabling VPN if enabled

3. **Check API endpoint**:
   - Base URL should be `https://jules.googleapis.com/v1alpha`
   - Check `hooks/use-jules-api.ts` for correct endpoint

### "Undefined is not an object (reading 'sessions')"

**Problem**: API response format is unexpected or empty.

**Solution**:

1. **Check API key permissions**
2. **Verify API response** in network debugger
3. **Check if you have any sessions** - create a test session
4. **Update the app** - API format may have changed

### "Cannot read property 't' of undefined"

**Problem**: i18n context is not available.

**Solution**:

1. **Ensure I18nProvider is in layout**:
   - Check `app/_layout.tsx`
   - Verify `I18nProvider` wraps the app

2. **Use useI18n hook correctly**:

```tsx
import { useI18n } from '@/constants/i18n-context';

function MyComponent() {
  const { t } = useI18n();
  return <Text>{t('myKey')}</Text>;
}
```

### White Screen on Launch

**Problem**: App shows white/blank screen.

**Solution**:

1. **Check console for errors**:

```bash
# View logs
bunx expo start
# Then press 'j' to open debugger
```

2. **Reset bundler cache**:

```bash
bun start --clear
```

3. **Check splash screen**:
   - Verify `expo-splash-screen` is installed
   - Check `app.json` for splash configuration

---

## API Connection Issues

### "Invalid API Key"

**Problem**: Authentication fails with Jules API.

**Solution**:

1. **Verify API key format**:
   - Should start with `AIzaSy...`
   - No spaces or newlines
   - Check in Settings screen

2. **Generate new API key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new API key with Jules API access
   - Update in Settings

3. **Check API restrictions**:
   - Ensure API key has Jules API enabled
   - Verify any IP/domain restrictions

### Sessions Not Loading

**Problem**: Session list is empty or not updating.

**Solution**:

1. **Pull to refresh**:
   - Swipe down on Sessions screen

2. **Check API key**:
   - Settings > Verify API key is saved

3. **Create a test session**:
   - Try creating a new session
   - If creation fails, check API key

4. **Check network logs**:
   - Look for errors in console
   - Verify API endpoint is reachable

### "Failed to fetch sources"

**Problem**: Cannot load repositories when creating session.

**Solution**:

1. **Check Google Cloud project**:
   - Verify you have repositories connected
   - Connect GitHub repositories in Cloud Console

2. **Wait and retry**:
   - Initial source loading can take time
   - Try refreshing after a few seconds

3. **Check pagination**:
   - Scroll down in repository list
   - Sources load progressively

---

## Performance Issues

### Slow List Scrolling

**Problem**: Session or activity lists lag when scrolling.

**Solution**:

1. **Reduce session list size**:
   - Archive old sessions
   - Filter by status

2. **Clear app data**:
   - Uninstall and reinstall app
   - This clears cached data

3. **Update React Native**:
   - Ensure using latest stable version
   - Check `package.json`

### High Memory Usage

**Problem**: App uses excessive memory.

**Solution**:

1. **Limit loaded activities**:
   - Activities auto-paginate
   - Don't keep too many sessions open

2. **Optimize images**:
   - Check image sizes in `assets/`
   - Use optimized formats

3. **Close unused screens**:
   - Navigate back when done
   - Don't stack many screens

### Slow App Launch

**Problem**: App takes long to start.

**Solution**:

1. **Optimize splash screen**:
   - Ensure fast initial load
   - Check `app/_layout.tsx`

2. **Lazy load data**:
   - Sessions load after launch
   - Don't block on initial data fetch

3. **Reduce bundle size**:
   - Remove unused dependencies
   - Use code splitting

---

## Platform-Specific Issues

### iOS Issues

#### "Failed to build iOS app"

**Solution**:

```bash
# Clean Xcode build
cd ios
rm -rf build
rm -rf Pods
pod install
cd ..

# Rebuild
bun ios
```

#### Simulator Not Found

**Solution**:

1. **Open Xcode**:
   - Xcode > Preferences > Locations
   - Set Command Line Tools

2. **List simulators**:

```bash
xcrun simctl list devices
```

3. **Create new simulator**:
   - Xcode > Window > Devices and Simulators
   - Add new iOS simulator

### Android Issues

#### "SDK location not found"

**Solution**:

1. **Set ANDROID_HOME**:

```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

2. **Verify SDK installation**:
   - Open Android Studio
   - Tools > SDK Manager
   - Install latest Android SDK

#### Emulator Won't Start

**Solution**:

1. **Check virtualization**:
   - Enable Intel VT-x or AMD-V in BIOS
   - Check Hyper-V settings on Windows

2. **Create new AVD**:
   - Android Studio > AVD Manager
   - Create Device > Choose system image

3. **Use physical device**:
   - Enable Developer Options
   - Enable USB debugging
   - Connect via USB

### Web Issues

#### "Not all features available on web"

**Problem**: Some features don't work in web browser.

**Solution**:

This is expected. The following features require native:
- `expo-secure-store` (uses localStorage fallback)
- `expo-haptics` (no haptic on web)
- Some gestures

**Recommendation**: Use iOS/Android for full experience.

---

## Getting Help

If your issue isn't listed here:

1. **Check existing issues**: [GitHub Issues](https://github.com/linkalls/jules-mobile-client/issues)
2. **Search documentation**: [docs/](../docs/)
3. **Ask the community**: Open a new issue with details
4. **Check Expo docs**: [Expo Documentation](https://docs.expo.dev/)

## Useful Commands

```bash
# Clear all caches
bun start --clear
rm -rf node_modules && bun install

# Reset project completely
bun run reset-project

# Type check
bunx tsc --noEmit

# Lint code
bun lint

# View logs
bunx expo start
# Then press:
# - 'j' to open debugger
# - 'r' to reload app
# - 'shift+m' to toggle menu
```

## Debug Mode

Enable debug logging:

```typescript
// In app/_layout.tsx or components
if (__DEV__) {
  console.log('Debug info:', data);
}
```

## Common Error Codes

| Error | Meaning | Solution |
|-------|---------|----------|
| `NETWORK_ERROR` | Cannot reach API | Check internet, API key |
| `UNAUTHORIZED` | Invalid API key | Update API key in Settings |
| `NOT_FOUND` | Resource not found | Session may be deleted |
| `INVALID_ARGUMENT` | Bad request params | Check input values |
| `PERMISSION_DENIED` | No access | Check API key permissions |

---

**Still having issues?** Open an issue on [GitHub](https://github.com/linkalls/jules-mobile-client/issues) with:
- Error message
- Steps to reproduce
- Screenshots
- Device/platform info
- App version
