# 本番環境への展開ガイド

このガイドでは、Jules Mobile Client を本番環境 (Google Play Store や Apple App Store など) に展開するプロセスの詳細について説明します。

## 📋 展開前チェックリスト

アプリを申請する前に、以下の項目が完了していることを確認してください：

- [ ] アプリアイコンとスプラッシュスクリーンの設定
- [ ] パッケージ名 / バンドル ID の設定
- [ ] バージョン番号の更新
- [ ] 開発用ログの無効化
- [ ] プライバシーポリシーの用意
- [ ] アプリのスクリーンショットの準備
- [ ] エラー追跡の設定 (推奨)

## ⚙️ アプリの設定

### app.json の更新

本番用に `app.json` を更新します：

```json
{
  "expo": {
    "name": "Jules",
    "slug": "jules-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
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

## 📱 プラットフォーム固有のビルド

### Android の本番ビルド

```bash
# EAS CLI をインストール
npm install -g eas-cli

# Expo にログイン
eas login

# ビルドの設定
eas build:configure

# 本番用の APK をビルド
eas build --platform android --profile production

# Google Play Store 用の AAB をビルド
eas build --platform android --profile production --auto-submit
```

**Android の署名:**
- 署名用のキーストアを作成する
- 認証情報を安全に保管する (Expo がこれを処理します)
- キーストアは絶対にバージョン管理にコミットしない

**ProGuard の設定** (コードの難読化用):

`android/app/proguard-rules.pro` を作成します：

```proguard
# React Native のクラスを保持
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# Expo モジュールを保持
-keep class expo.modules.** { *; }

# ここにカスタムルールを追加
```

### iOS の本番ビルド

```bash
# App Store 用の IPA をビルド
eas build --platform ios --profile production

# App Store に申請
eas submit --platform ios
```

**iOS の署名:**
- App Store Distribution 証明書を作成する
- App Store プロビジョニングプロファイルを作成する
- Apple Developer Console で設定する
- EAS が証明書の管理を処理します

## 🚀 展開のオプション

### オプション 1: アプリストアでの配布

**Google Play Store (Android):**
1. Google Play Developer アカウントを作成する (1 回限りの料金 25 ドル)
2. アプリのストア掲載情報を作成する
3. APK / AAB をアップロードする
4. コンテンツのレーティングのアンケートに回答する
5. 価格と配布の設定を行う
6. 公開する

**Apple App Store (iOS):**
1. Apple Developer Program に登録する (年間 99 ドル)
2. App Store Connect でアプリの掲載情報を作成する
3. EAS または Xcode を使用して IPA をアップロードする
4. 審査に提出する
5. 審査のフィードバックに対応する
6. 公開する

### オプション 2: エンタープライズ配布

社内利用の場合：

**Android:**
- APK をビルドして署名する
- 社内のチャンネルを通じて配布する
- Mobile Device Management (MDM) を使用する
- または Google Play エンタープライズを使用する

**iOS:**
- Apple Developer Enterprise Program に登録する (年間 299 ドル)
- エンタープライズ配布証明書を作成する
- MDM または直接ダウンロードで配布する
- 注: エンタープライズプログラムには厳格な要件があります

### オプション 3: 直接配布

**Android APK:**
- 「提供元不明のアプリ」からのインストールを許可する
- APK を直接ダウンロードしてインストールする
- テストや小規模な展開に使用する
- 大規模な本番環境での使用は推奨されません

**iOS (TestFlight):**
- ベータテスターは 10,000 人まで
- 1 ビルドあたりのテスト期間は 90 日間
- 段階的なロールアウトに適しています

### オプション 4: Over-the-Air (OTA) アップデート

Expo Updates を使用：

```bash
# expo-updates の設定
npx expo install expo-updates

# アップデートの公開
eas update --branch production --message "バグの修正"
```

**メリット:**
- アプリストアの審査なしで即座にアップデート
- 段階的なロールアウト
- ロールバックが可能

**制限事項:**
- ネイティブコードの変更は不可
- アプリの権限の変更は不可
- アプリストアのポリシーに依存する

## 🔧 本番環境の設定

### デバッグモードの無効化

`app/_layout.tsx` を更新します：

```typescript
// 本番環境で console.log を無効にする
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}
```

### エラー処理

グローバルなエラー境界 (Error Boundary) を実装します：

```typescript
import * as Sentry from '@sentry/react-native';

// Sentry の初期化
Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  enableInExpoDevelopment: false,
  debug: __DEV__,
});

// アプリをエラー境界でラップする
function App() {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <AppContent />
    </Sentry.ErrorBoundary>
  );
}
```

### 分析の設定 (オプション)

```bash
# Firebase Analytics のインストール
npx expo install @react-native-firebase/analytics
```

```typescript
// 画面表示のトラッキング
import analytics from '@react-native-firebase/analytics';

await analytics().logScreenView({
  screen_name: 'Sessions',
  screen_class: 'SessionsScreen',
});
```

### クラッシュレポート

オプション：
- **Sentry** - 包括的なエラートラッキング
- **Firebase Crashlytics** - 無料、Firebase と統合
- **Bugsnag** - React Native の優れたサポート
- **Instabug** - ユーザーフィードバック付きのバグレポート

## 📊 監視とメンテナンス

### パフォーマンス監視

1. **React Native Performance Monitor**
   - 開発環境で FPS モニターを有効にする
   - React DevTools でプロファイリングする

2. **Firebase Performance Monitoring**
   ```bash
   npx expo install @react-native-firebase/perf
   ```

3. **Sentry Performance**
   - トランザクションのパフォーマンスを追跡する
   - API の応答時間を監視する

### ヘルスチェック

以下を監視：
- アプリのクラッシュ率
- API のエラー率
- ユーザーの継続率
- セッションの長さ
- API のクォータ使用量

### ログ記録

**記録すべきもの:**
- API のエラー
- 認証の失敗
- 重要なユーザーアクション
- パフォーマンスの指標

**記録してはいけないもの:**
- API キー
- ユーザーの認証情報
- 個人情報
- 本番環境での完全なスタックトレース

### アップデート戦略

1. **セマンティックバージョニング**
   - MAJOR.MINOR.PATCH (例: 1.2.3)
   - `app.json` のバージョンを更新

2. **リリースノート**
   - CHANGELOG.md を維持する
   - 変更内容をユーザーに伝える

3. **段階的なロールアウト**
   - Google Play: 段階的なロールアウト (10%, 50%, 100%)
   - App Store: 段階的リリース
   - 各段階でクラッシュ率を監視する

## 🔐 API キー管理

### 本番環境向け

**オプション 1: クライアント側 (現在)**
- ユーザー自身が API キーを入力する
- キーは `expo-secure-store` を使用してローカルに保存される
- 個人の使用に適している

**オプション 2: バックエンドプロキシ (商用で推奨)**
```
モバイルアプリ → バックエンドサーバー → Jules API
```

メリット：
- 一元化されたキー管理
- ユーザーごとのレート制限
- 使用量の追跡
- アプリのアップデートなしでのキーのローテーション

バックエンドプロキシの例：
```typescript
// Express.js の例
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

### レート制限

クライアント側のレート制限を実装します：

```typescript
// シンプルなレートリミッター
class RateLimiter {
  private requests: number[] = [];
  private maxRequests = 100;
  private windowMs = 60000; // 1 分

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

## 💰 コストの考慮事項

### Jules API のコスト
- Google Cloud の料金を確認する
- 予算アラートを設定する
- Cloud Console で使用量を確認する
- コスト割り当てタグを実装する

### インフラコスト
- アプリストアの手数料 (年間 25 ドル～ 299 ドル)
- バックエンドのホスティング (プロキシを使用する場合)
- アセットの CDN
- クラッシュレポートサービス
- 分析サービス

### コストの最適化
- 適切な場所で API の応答をキャッシュする
- ページネーションを実装する
- インクリメンタルな更新を使用する
- アセットのサイズを最適化する
- 完全なリリースの代わりに OTA アップデートを使用する

## 📚 コンプライアンスと法務

### 本番環境で必要なもの

1. **プライバシーポリシー**
   - アプリストアから求められます
   - データの収集について説明する必要があります
   - アプリ内でアクセス可能である必要があります

2. **利用規約**
   - 許容される使用の定義
   - 責任の制限
   - 準拠法の指定

3. **オープンソースライセンス**
   - アプリ内に表示する (すでに `/licenses` で実装済み)
   - ライセンスの条件を遵守する
   - ドキュメントに含める

### 推奨されるオプション

- Cookie ポリシー (Web を使用する場合)
- GDPR コンプライアンス (EU のユーザー向け)
- CCPA コンプライアンス (カリフォルニアのユーザー向け)
- アクセシビリティステートメント

## 🧪 テスト戦略

### リリース前のテスト

1. **ユニットテスト**
   ```bash
   npm test
   ```

2. **統合テスト**
   - API の統合をテストする
   - ナビゲーションのフローをテストする

3. **E2E テスト**
   - Detox または Maestro を使用する
   - 重要なユーザージャーニーをテストする

4. **ベータテスト**
   - TestFlight (iOS)
   - Google Play 内部テスト (Android)
   - ユーザーからのフィードバックを収集する

### パフォーマンスのテスト

- 低スペックなデバイスでテストする
- 低速なネットワークでテストする
- 大規模なデータセットでテストする
- メモリの使用状況を監視する

## 🔄 ロールバック戦略

### 問題が発生した場合

1. **OTA アップデート**
   ```bash
   # 前のバージョンにロールバックする
   eas update:rollback
   ```

2. **アプリストア**
   - 即座にはロールバックできません
   - ホットフィックスのアップデートを申請する
   - 緊急の修正の場合は通常 1 ～ 2 日で審査が完了します

3. **フィーチャーフラグ**
   - フィーチャートグルを実装する
   - 問題のある機能をリモートで無効にする

## 📞 サポートとメンテナンス

### ユーザーサポート

- サポート用メールアドレスを設定する
- FAQ ドキュメントを作成する
- GitHub Issue を監視する
- アプリ内ヘルプを提供する

### メンテナンスのスケジュール

- **毎週:** クラッシュレポートの監視、分析の確認
- **毎月:** 依存関係の更新、セキュリティアドバイザリの確認
- **四半期ごと:** パフォーマンスの最適化、ユーザーからのフィードバックの確認
- **毎年:** メジャーバージョンの更新、技術スタックの見直し

## 🎯 ローンチのチェックリスト

リリース前の最終確認：

- [ ] すべてのビルドを実機でテストした
- [ ] プライバシーポリシーと利用規約が用意されている
- [ ] サポートチャンネルが確立されている
- [ ] 監視とアラートが設定されている
- [ ] バックアップとリカバリがテストされている
- [ ] ドキュメントが完成している
- [ ] マーケティング資料が準備されている (該当する場合)
- [ ] アプリストアの掲載情報が完成している
- [ ] ベータ版のフィードバックに対応した
- [ ] パフォーマンスのベンチマークを満たしている
- [ ] セキュリティ監査が完了している
- [ ] ロールバックの計画が文書化されている

## 📖 その他のリソース

- [Expo Production Deployment](https://docs.expo.dev/distribution/introduction/)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Google Play Launch Checklist](https://developer.android.com/distribute/best-practices/launch/launch-checklist)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

**お困りですか？** [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) を確認するか、GitHub で Issue を開いてください。
