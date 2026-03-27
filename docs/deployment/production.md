# Production Deployment Guide

This guide covers deploying the Jules Mobile Client to production environments.

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] All security best practices implemented (see [SECURITY.md](SECURITY.md))
- [ ] Environment-specific configurations set
- [ ] API keys properly secured
- [ ] Error handling and logging configured
- [ ] Performance optimizations applied
- [ ] Legal requirements met (privacy policy, terms of service)
- [ ] Testing completed (unit, integration, E2E)
- [ ] Dependencies audited and updated
- [ ] Debug mode disabled
- [ ] Code obfuscation enabled (if required)
- [ ] Crash reporting configured
- [ ] Analytics configured (if desired)
- [ ] Backup strategy in place

## 🏗️ Build Configuration

### Environment Setup

Create environment-specific configuration files:

```bash
# .env.production
EXPO_PUBLIC_API_URL=https://jules.googleapis.com/v1alpha
EXPO_PUBLIC_ENABLE_DEBUG=false
EXPO_PUBLIC_ENABLE_ANALYTICS=true
```

### EAS Build Configuration

Update `eas.json` for production:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      },
      "ios": {
        "buildConfiguration": "Release"
      },
      "env": {
        "EXPO_PUBLIC_ENABLE_DEBUG": "false"
      }
    }
  }
}
```

### App Configuration

Update `app.json`:

```json
{
  "expo": {
    "name": "Jules Mobile Client",
    "slug": "jules-mobile-client",
    "version": "1.0.0",
    "extra": {
      "enableDebug": false
    },
    "android": {
      "package": "com.yourcompany.jules",
      "versionCode": 1,
      "permissions": []
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.jules",
      "buildNumber": "1"
    }
  }
}
```

## 📱 Platform-Specific Builds

### Android Production Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK for production
eas build --platform android --profile production

# Build AAB for Google Play Store
eas build --platform android --profile production --auto-submit
```

**Android Signing:**
- Create a keystore for signing
- Store credentials securely (Expo handles this)
- Never commit keystore to version control

**ProGuard Configuration** (for code obfuscation):

Create `android/app/proguard-rules.pro`:

```proguard
# Keep React Native classes
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Keep Expo modules
-keep class expo.modules.** { *; }

# Add your custom rules here
```

### iOS Production Build

```bash
# Build IPA for App Store
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

**iOS Signing:**
- Create App Store distribution certificate
- Create App Store provisioning profile
- Configure in Apple Developer Console
- EAS handles certificate management

## 🚀 Deployment Options

### Option 1: App Store Distribution

**Google Play Store (Android):**
1. Create Google Play Developer account ($25 one-time fee)
2. Create app listing
3. Upload APK/AAB
4. Complete content rating questionnaire
5. Set up pricing and distribution
6. Publish

**Apple App Store (iOS):**
1. Enroll in Apple Developer Program ($99/year)
2. Create App Store Connect listing
3. Upload IPA using EAS or Xcode
4. Submit for review
5. Respond to review feedback
6. Publish

### Option 2: Enterprise Distribution

For internal company use:

**Android:**
- Build and sign APK
- Distribute via internal channels
- Use Mobile Device Management (MDM)
- Or use Google Play Enterprise

**iOS:**
- Enroll in Apple Developer Enterprise Program ($299/year)
- Create enterprise distribution certificate
- Distribute via MDM or direct download
- Note: Enterprise program has strict requirements

### Option 3: Direct Distribution

**Android APK:**
- Enable "Install from Unknown Sources"
- Download and install APK directly
- Use for testing or small deployments
- Not recommended for large-scale production

**iOS (TestFlight):**
- Limited to 10,000 beta testers
- 90-day testing period per build
- Good for staged rollouts

### Option 4: Over-the-Air (OTA) Updates

Using Expo Updates:

```bash
# Configure expo-updates
npx expo install expo-updates

# Publish update
eas update --branch production --message "Bug fixes"
```

**Benefits:**
- Instant updates without app store review
- Staged rollouts
- Rollback capability

**Limitations:**
- Cannot change native code
- Cannot change app permissions
- Subject to app store policies

## 🔧 Production Configuration

### Disable Debug Mode

Update `app/_layout.tsx`:

```typescript
// Disable console logs in production
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}
```

### Error Handling

Implement global error boundary:

```typescript
import * as Sentry from '@sentry/react-native';

// Initialize Sentry
Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  enableInExpoDevelopment: false,
  debug: __DEV__,
});

// Wrap app in error boundary
function App() {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <AppContent />
    </Sentry.ErrorBoundary>
  );
}
```

### Analytics Setup (Optional)

```bash
# Install Firebase Analytics
npx expo install @react-native-firebase/analytics
```

```typescript
// Track screen views
import analytics from '@react-native-firebase/analytics';

await analytics().logScreenView({
  screen_name: 'Sessions',
  screen_class: 'SessionsScreen',
});
```

### Crash Reporting

Options:
- **Sentry** - Comprehensive error tracking
- **Firebase Crashlytics** - Free, integrates with Firebase
- **Bugsnag** - Good React Native support
- **Instabug** - Bug reporting with user feedback

## 📊 Monitoring & Maintenance

### Performance Monitoring

1. **React Native Performance Monitor**
   - Enable FPS monitor in development
   - Profile with React DevTools

2. **Firebase Performance Monitoring**
   ```bash
   npx expo install @react-native-firebase/perf
   ```

3. **Sentry Performance**
   - Track transaction performance
   - Monitor API response times

### Health Checks

Monitor:
- App crash rate
- API error rates
- User retention
- Session duration
- API quota usage

### Logging

**What to log:**
- API errors
- Authentication failures
- Critical user actions
- Performance metrics

**What NOT to log:**
- API keys
- User credentials
- Personal information
- Full stack traces in production

### Update Strategy

1. **Semantic Versioning**
   - MAJOR.MINOR.PATCH (e.g., 1.2.3)
   - Update version in `app.json`

2. **Release Notes**
   - Maintain CHANGELOG.md
   - Communicate changes to users

3. **Staged Rollouts**
   - Google Play: Staged rollout (10%, 50%, 100%)
   - App Store: Phased release
   - Monitor crash rates at each stage

## 🔐 API Key Management

### For Production

**Option 1: Client-Side (Current)**
- Users enter their own API keys
- Keys stored locally with `expo-secure-store`
- Good for personal use

**Option 2: Backend Proxy (Recommended for Commercial)**
```
Mobile App → Your Backend → Jules API
```

Benefits:
- Centralized key management
- Rate limiting per user
- Usage tracking
- Key rotation without app updates

Example backend proxy:
```typescript
// Express.js example
app.post('/api/sessions', authenticate, async (req, res) => {
  const apiKey = process.env.JULES_API_KEY;
  const response = await fetch('https://jules.googleapis.com/v1alpha/sessions', {
    method: 'POST',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  });
  res.json(await response.json());
});
```

### Rate Limiting

Implement client-side rate limiting:

```typescript
// Simple rate limiter
class RateLimiter {
  private requests: number[] = [];
  private maxRequests = 100;
  private windowMs = 60000; // 1 minute

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}
```

## 💰 Cost Considerations

### Jules API Costs
- Check Google Cloud pricing
- Set budget alerts
- Monitor usage in Cloud Console
- Implement cost allocation tags

### Infrastructure Costs
- App store fees ($25-$299/year)
- Backend hosting (if using proxy)
- CDN for assets
- Crash reporting service
- Analytics service

### Cost Optimization
- Cache API responses where appropriate
- Implement pagination
- Use incremental updates
- Optimize asset sizes
- Use OTA updates instead of full releases

## 📚 Compliance & Legal

### Required for Production

1. **Privacy Policy**
   - Required by app stores
   - Must explain data collection
   - Must be accessible in app

2. **Terms of Service**
   - Define acceptable use
   - Limit liability
   - Specify governing law

3. **Open Source Licenses**
   - Display in app (already implemented in `/licenses`)
   - Comply with license terms
   - Include in documentation

### Optional but Recommended

- Cookie policy (if using web)
- GDPR compliance (EU users)
- CCPA compliance (California users)
- Accessibility statement

## 🧪 Testing Strategy

### Pre-Release Testing

1. **Unit Tests**
   ```bash
   npm test
   ```

2. **Integration Tests**
   - Test API integration
   - Test navigation flows

3. **E2E Tests**
   - Use Detox or Maestro
   - Test critical user journeys

4. **Beta Testing**
   - TestFlight (iOS)
   - Google Play Internal Testing (Android)
   - Gather user feedback

### Performance Testing

- Test on low-end devices
- Test on slow networks
- Test with large datasets
- Monitor memory usage

## 🔄 Rollback Strategy

### If Issues Occur

1. **OTA Updates**
   ```bash
   # Rollback to previous version
   eas update:rollback
   ```

2. **App Store**
   - Cannot rollback instantly
   - Submit hotfix update
   - Usually 1-2 day review for urgent fixes

3. **Feature Flags**
   - Implement feature toggles
   - Disable problematic features remotely

## 📞 Support & Maintenance

### User Support

- Set up support email
- Create FAQ documentation
- Monitor GitHub issues
- Provide in-app help

### Maintenance Schedule

- **Weekly:** Monitor crash reports, check analytics
- **Monthly:** Update dependencies, review security advisories
- **Quarterly:** Performance optimization, user feedback review
- **Yearly:** Major version updates, technology stack review

## 🎯 Launch Checklist

Final checks before launch:

- [ ] All builds tested on real devices
- [ ] Privacy policy and terms in place
- [ ] Support channels established
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery tested
- [ ] Documentation complete
- [ ] Marketing materials ready (if applicable)
- [ ] App store listings complete
- [ ] Beta feedback addressed
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Rollback plan documented

## 📖 Additional Resources

- [Expo Production Deployment](https://docs.expo.dev/distribution/introduction/)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Google Play Launch Checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

**Need Help?** Check [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) or open an issue on GitHub.
