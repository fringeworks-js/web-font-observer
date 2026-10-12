# @fringeworks/web-font-observer

`@fringeworks/web-font-observer` は、Webフォントの利用可否を確認することに特化した、誰かにとっては便利なライブラリです。\
標準の CSS Font Loading API をベースに、[fontfaceobserver](https://github.com/bramstein/fontfaceobserver) 相当の機能を2021年以降の主要ブラウザ向けに提供します。

**[English README is available here](./README.md)**

## 特徴

- **標準準拠**: `document.fonts`（CSS Font Loading API）を直接使用し、レガシーブラウザ向けのコードを含みません。
- **中断可能**: `AbortSignal`で待機を中断でき、再確認の処理も確実に停止します。
- **同期判定**: `isWebFontLoaded`でWebフォントがロード済みかを即座に判定できるため、キャッシュ済みのフォントで待機状態を省略できます。
- **現行仕様の命名**: 旧名の`stretch`（`font-stretch`）ではなく、`width`（`font-width`）を使用します。

## インストール

```bash
npm install @fringeworks/web-font-observer
# または
pnpm add @fringeworks/web-font-observer
```

## 使い方

### `waitForWebFont`

指定のWebフォントが利用可能になるまで待機します。

```ts
import { waitForWebFont } from '@fringeworks/web-font-observer';

try {
  await waitForWebFont('Noto Sans JP', { weight: 700, text: 'あ' });
  // Webフォントが利用可能
} catch (error) {
  // TimeoutError / AbortError など
}
```

戻り値のPromiseは、該当した`FontFace`の配列で解決します。以下の場合は`DOMException`でrejectします。

| ケース                                      | エラー                                        |
| ------------------------------------------- | --------------------------------------------- |
| `timeout`までに利用可能にならなかった       | `TimeoutError`                                |
| `signal`で中断した                          | `signal.reason`（未設定の場合は`AbortError`） |
| フォントファイルの読み込みに失敗した        | `document.fonts.load()`のエラー               |
| `document.fonts`を利用できない（SSR時など） | `NotSupportedError`                           |

#### 中断

```ts
const controller = new AbortController();
waitForWebFont('Roboto', { signal: controller.signal });

// コンポーネントのアンマウント時など
controller.abort();
```

### `isWebFontLoaded`

指定のWebフォントがロード済みで、すぐに利用できるかを同期的に判定します。

```ts
import { isWebFontLoaded } from '@fringeworks/web-font-observer';

if (isWebFontLoaded('Noto Sans JP')) {
  // 待つ必要なし
}
```

`document.fonts`に登録されていないフォントや、SSR時など判定できない環境では`false`を返します。

## オプション

| オプション | 型                                                      | デフォルト | 説明                                                                                                        |
| ---------- | ------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| `weight?`  | `number \| 'normal' \| 'bold'`                          | `normal`   | フォントの太さ（`font-weight`）                                                                             |
| `style?`   | `'normal' \| 'italic' \| 'oblique' \| 'oblique <n>deg'` | `normal`   | フォントのスタイル（`font-style`）                                                                          |
| `width?`   | `'normal' \| 'condensed' \| 'expanded' \| ...`          | `normal`   | フォントの幅（`font-width`）。キーワードのみ指定可能                                                        |
| `text?`    | `string`                                                | `' '`      | 判定に使用する文字列。[`unicode-range`で分割されたWebフォント](#unicode-rangeで分割されたwebフォント)を参照 |
| `timeout?` | `number`                                                | `3000`     | `waitForWebFont`のみ。失敗とみなすまでの時間（ミリ秒）。`Infinity`でタイムアウトなし                        |
| `signal?`  | `AbortSignal`                                           | -          | `waitForWebFont`のみ。待機を中断するためのシグナル                                                          |

## 注意事項

### 対象はWebフォントのみ

対象は`@font-face`や`FontFace`で登録されたWebフォントです。システムフォントにはロードの過程がなく、ブラウザのプライバシー保護により利用可否を確実に判定する手段もありません。システムフォントを指定した場合、`waitForWebFont`はタイムアウトし、`isWebFontLoaded`は`false`を返します。

### `unicode-range`で分割されたWebフォント

Google FontsのNoto Sans JPのように`unicode-range`で複数のファイルに分割されたWebフォントでは、`text`に含まれる文字を収録したファイルのみが判定の対象になります。実際に表示する文字を`text`に指定してください。

```ts
await waitForWebFont('Noto Sans JP', { text: 'あいう' });
```

### 対応ブラウザ

2021年以降にリリースされた主要ブラウザ（Chrome / Edge 88以降、Firefox 85以降、Safari 14以降）が対象です。

## ライセンス

MIT
