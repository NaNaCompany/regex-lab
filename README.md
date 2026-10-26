# 정규식 실험실

설치·빌드 없는 정적 JavaScript 정규식 작업대. `dist`를 HTTP 정적 서버에서 제공합니다. ES module Worker를 사용하므로 파일 직접 열기보다 정적 서버를 사용해야 합니다. 서버로 사용자 입력을 전송하거나 입력을 저장하지 않습니다.

## 기능

- 한국어 루트, `/en/`, `/es/`, `/zh/`, `/ja/`, `/de/` 6개 언어와 수동 메뉴
- JavaScript RegExp 패턴과 g/i/m/s/u/y 플래그
- 매치 하이라이트·UTF-16 위치·빈 매치 표시·번호 및 이름 캡처 그룹
- `$&`, `$1`, `$<name>`, `$$`, 접두·접미 치환 미리보기
- 결과 JSON, 치환 텍스트 UTF-8 다운로드 및 복사
- Worker 격리, 1초 종료, 수동 중지, 편집 시 진행 작업 취소

## 범위

텍스트 100,000자, 패턴 1,000자, 치환 2,000자, 캡처 그룹 50개, 매치 500개. 결과·누적 캡처 데이터는 각 500,000자 제한입니다. 500개를 넘는 매치는 나머지 원문을 보존하는 부분 치환으로 명시합니다. g가 없으면 첫 매치만 처리합니다. 패턴 문법은 JavaScript이며 PCRE/Python 호환 도구가 아닙니다. 지원하지 않는 브라우저 문법과 잘못된 패턴은 오류를 표시합니다. 데이터 값과 입력은 번역하지 않습니다. 새로고침 시 입력은 사라집니다.

## 검증

2026-10-26 Node fixture suite 통과. 실제 기대값으로 이메일 그룹 추출·전역/첫 매치·플래그·유니코드 빈 매치·부분 치환·입력 및 출력 상한을 검증했습니다. 치환 표현은 고정 기대값과 JavaScript 내장 replace 결과를 함께 대조했습니다. 모든 언어 HTML·메뉴·noindex·카탈로그 및 오류 메시지 완결성을 검사했습니다.

별도 Node Worker에 병적 패턴 `^(a+)+$`와 `a` 40개+`!`를 실행하고 1초에 종료했습니다. 메인 스레드 타이머 응답과 종료 완료를 확인했습니다. 브라우저 UI와 브라우저 Worker의 시각·상호작용 QA는 별도 수행해야 합니다.

앱 루트에서 `$NodeRuntime`을 설치된 Node 실행파일로 지정한 뒤 실행한 명령:

```powershell
& ../../.tools/rtk/rtk.exe proxy $NodeRuntime make-locales.mjs
& ../../.tools/rtk/rtk.exe proxy $NodeRuntime tests.mjs
& ../../.tools/rtk/rtk.exe proxy $NodeRuntime --check dist/core.js
& ../../.tools/rtk/rtk.exe proxy $NodeRuntime --check dist/app.js
& ../../.tools/rtk/rtk.exe proxy $NodeRuntime --check dist/worker.js
& ../../.tools/rtk/rtk.exe proxy $NodeRuntime --check dist/locales.js
```

실제 결과: `Generated 6 language routes.`, `PASS fixtures: captures, flags, Unicode zero-width, substitutions, limits, clipping and six languages.`, `PASS pathological pattern: worker terminated at 1 second; main thread stayed responsive.` 모두 exit 0. JS 구문 검사는 출력 없이 exit 0.

## 출처

[ECMAScript RegExp 표준](https://tc39.es/ecma262/multipage/text-processing.html#sec-regexp-regular-expression-objects). UI·설명·테스트와 구현은 자체 작성했으며 제3자 코드·이미지·폰트·라이브러리를 사용하지 않았습니다.

## Public GitHub Pages release

Launch: https://nanalab.kr/regex-lab/

Korean is at the root. English, Spanish, Chinese, Japanese and German use `/en/`, `/es/`, `/zh/`, `/ja/`, `/de/`.
GitHub Pages serves `main` → `/docs` using the branch build. No project CNAME is used.

Build: `node scripts/build-public.mjs`. The `dist/` snapshot and its original generators/tests are preserved as the application source. The public build adds metadata, six-locale sitemaps, original JPEG cards, More Apps styling and the existing NaNa publisher integrations. It does not upload selected user files.

Publisher integrations: AdSense, Google Tag Manager, Google Analytics and Cloudflare Web Analytics, with the same publisher settings as the NaNa Lab homepage. These scripts can make network requests independently of local file processing.

Original JPEG cards are rendered from original text and geometry using an installed system font; no font files are redistributed. Existing source references and third-party notices remain applicable.
