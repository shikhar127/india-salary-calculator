# SalaryFit Releases

This folder contains all production releases of the India Salary Calculator (SalaryFit) app.

## Release Structure

Each version is stored in its own folder:

```
releases/
├── README.md (this file)
└── v1.0/
    ├── india-salary-calculator-v1.0.apk  (Signed production APK)
    ├── Release Notes.md                   (Full changelog)
    ├── BUILD_INFO.txt                     (Build metadata)
    └── SHA256SUMS.txt                     (Checksum for verification)
```

## Current Release

**Latest:** v1.0 (Feb 22, 2026)
- APK: `v1.0/india-salary-calculator-v1.0.apk`
- Status: ✅ Production Ready
- Target: Google Play Store

## Verification

Verify APK integrity:
```bash
cd releases/v1.0
shasum -a 256 -c SHA256SUMS.txt
```

## Installation

Install via ADB:
```bash
adb install releases/v1.0/india-salary-calculator-v1.0.apk
```

## Release Checklist

Before creating a new release:

1. Update version in `android/app/build.gradle`
2. Update CHANGELOG / Release Notes
3. Build with correct vite base (`/` for APK, `/india-salary-calculator/` for web)
4. Test on multiple devices
5. Sign with release keystore
6. Generate SHA256 checksum
7. Tag in git: `git tag v1.x`
8. Push to GitHub
9. Create release folder
10. Upload to Play Store

## Notes

- **APK vs AAB**: Current releases are APK. Play Store prefers AAB (Android App Bundle) for production.
- **Web Build**: Separate from APK build (different vite base path).
- **Keystore**: `../release.keystore` (never commit to git!)
