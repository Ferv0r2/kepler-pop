# Android Build 문제 해결 과정

**날짜**: 2025-08-18  
**프로젝트**: KeplerPop  
**환경**: React Native 0.81.0, pnpm

## 문제 상황

`pnpm android` 명령 실행 시 빌드 실패

## 해결 과정

### 1. 초기 오류: gradle-plugin을 찾을 수 없음

**오류 메시지**:

```
Error resolving plugin [id: 'com.facebook.react.settings']
> Included build '/home/amlk/KeplerPop/node_modules/@react-native/gradle-plugin' does not exist.
```

**원인**: pnpm은 symlink 기반 구조를 사용하는데, gradle이 표준 node_modules 구조를 기대함

**해결**:

```bash
ln -sf ../.pnpm/@react-native+gradle-plugin@0.81.0/node_modules/@react-native/gradle-plugin node_modules/@react-native/gradle-plugin
```

`.npmrc` 설정

```
node-linker=hoisted
shamefully-hoist=true
```

### 2. keystore.properties 파일 없음

**오류 메시지**:

```
A problem occurred evaluating project ':app'.
> /home/amlk/KeplerPop/android/keystore.properties (No such file or directory)
```

**원인**: build.gradle이 keystore.properties를 무조건 로드하려고 시도

**해결**: `/home/amlk/KeplerPop/android/app/build.gradle` 수정

```gradle
// 기존 코드
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

// 수정된 코드
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

release signingConfig도 수정:

```gradle
release {
    if (keystorePropertiesFile.exists()) {
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
    } else {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
}
```

### 3. react-native-reanimated의 worklets 의존성 문제

**오류 메시지**:

```
A problem occurred evaluating project ':react-native-reanimated'.
> Process 'command 'node'' finished with non-zero exit value 1
```

**원인**: react-native-reanimated가 react-native-worklets를 찾으려고 하는데 설치되어 있지 않음

**해결**:

```bash
pnpm add react-native-worklets
```

### 4. codegen 모듈을 찾을 수 없음

**오류 메시지**:

```
Error: Cannot find module '/home/amlk/KeplerPop/node_modules/@react-native/codegen/lib/cli/combine/combine-js-to-schema-cli.js'
```

**원인**: pnpm symlink 구조 문제

**해결**:

```bash
ln -sf ../.pnpm/@react-native+codegen@0.81.0_@babel+core@7.28.3/node_modules/@react-native/codegen node_modules/@react-native/codegen
```

### 5. AndroidManifest.xml 파싱 오류

**오류 메시지**:

```
Execution failed for task ':app:processDebugMainManifest'.
> com.android.manifmerger.ManifestMerger2$MergeFailureException: Error parsing /home/amlk/KeplerPop/android/app/src/main/AndroidManifest.xml
```

**원인**: AndroidManifest.xml에서 `tools:replace` 속성을 사용하는데 tools 네임스페이스가 선언되지 않음

**해결**: `/home/amlk/KeplerPop/android/app/src/main/AndroidManifest.xml` 수정

```xml
<!-- 기존 -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

<!-- 수정 -->
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">
```

## 최종 결과

- 빌드 성공 ✅
- APK 생성 위치: `/home/amlk/KeplerPop/android/app/build/outputs/apk/debug/app-debug.apk`
- APK 크기: 약 216MB

## 추가 설치된 의존성

- react-native-worklets@0.4.1

## 수정된 파일 목록

1. `/home/amlk/KeplerPop/android/app/build.gradle`
2. `/home/amlk/KeplerPop/android/app/src/main/AndroidManifest.xml`
3. `/home/amlk/KeplerPop/package.json` (react-native-worklets 추가)

## 생성된 symlink

1. `node_modules/@react-native/gradle-plugin` -> pnpm 저장소의 gradle-plugin
2. `node_modules/@react-native/codegen` -> pnpm 저장소의 codegen

## 향후 주의사항

- pnpm을 사용하는 React Native 프로젝트에서는 symlink 관련 문제가 발생할 수 있음
- 새로운 native 의존성 추가 시 비슷한 symlink 생성이 필요할 수 있음
- `pnpm install` 후에도 symlink가 유지되는지 확인 필요
