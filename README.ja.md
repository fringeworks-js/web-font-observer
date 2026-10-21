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

### Webフォントが利用可能になるまで待機する

```ts
import { waitForWebFont } from '@fringeworks/web-font-observer';

try {
  await waitForWebFont('Noto Sans JP', { weight: 700, text: 'あ' });
  // Webフォントが利用可能
} catch (error) {
  // TimeoutError / AbortError など
}
```

### 待機を中断する

```ts
const controller = new AbortController();
waitForWebFont('Roboto', { signal: controller.signal });

// コンポーネントのアンマウント時など
controller.abort();
```

### ロード済みかを同期的に判定する

```ts
import { isWebFontLoaded } from '@fringeworks/web-font-observer';

if (isWebFontLoaded('Noto Sans JP')) {
  // 待つ必要なし
}
```

## API

| 関数                                | 説明                                                            |
| ----------------------------------- | --------------------------------------------------------------- |
| `waitForWebFont(family, options?)`  | Webフォントが利用可能になるまで待機する                         |
| `isWebFontLoaded(family, options?)` | Webフォントがロード済みで、すぐに利用できるかを同期的に判定する |

### `waitForWebFont`

```ts
waitForWebFont(
  family: string,
  options?: WaitForWebFontOptions,
): Promise<FontFace[]>
```

指定のWebフォントが利用可能になるまで待機し、該当した`FontFace`の配列で解決するPromiseを返します。\
CSSの読み込み待ちなどで`FontFace`がまだ登録されていない場合は、登録されるまで再確認を繰り返します。

| 引数       | 型                      | 説明                                         |
| ---------- | ----------------------- | -------------------------------------------- |
| `family`   | `string`                | フォントファミリー。クォートの有無は問わない |
| `options?` | `WaitForWebFontOptions` | 下記のオプション                             |

| オプション | 型                                                      | 説明                                                                                                                           |
| ---------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `weight?`  | `number \| 'normal' \| 'bold'`                          | フォントの太さ（`font-weight`）。デフォルトは`'normal'`                                                                        |
| `style?`   | `'normal' \| 'italic' \| 'oblique' \| 'oblique <n>deg'` | フォントのスタイル（`font-style`）。デフォルトは`'normal'`                                                                     |
| `width?`   | `WebFontWidth`                                          | フォントの幅（`font-width`）。キーワードのみ指定可能。デフォルトは`'normal'`                                                   |
| `text?`    | `string`                                                | 判定に使用する文字列。デフォルトは`' '`。[`unicode-range`で分割されたWebフォント](#unicode-rangeで分割されたwebフォント)を参照 |
| `timeout?` | `number`                                                | 失敗とみなすまでの時間（ミリ秒）。デフォルトは`3000`。`Infinity`でタイムアウトなし。`NaN`の場合はデフォルト値を使用する        |
| `signal?`  | `AbortSignal`                                           | 待機を中断するためのシグナル                                                                                                   |

以下の場合はrejectします。

| ケース                                      | エラー                                                        |
| ------------------------------------------- | ------------------------------------------------------------- |
| `timeout`までに利用可能にならなかった       | `TimeoutError`の`DOMException`                                |
| `signal`で中断した                          | `signal.reason`（未設定の場合は`AbortError`の`DOMException`） |
| フォントファイルの読み込みに失敗した        | `document.fonts.load()`のエラー                               |
| `document.fonts`を利用できない（SSR時など） | `NotSupportedError`の`DOMException`                           |

### `isWebFontLoaded`

```ts
isWebFontLoaded(family: string, options?: IsWebFontLoadedOptions): boolean
```

指定のWebフォントがロード済みで、すぐに利用できるかを同期的に判定します。\
`document.fonts`に登録されていないフォントや、ロード済みのファイルが1つも無いフォント、SSR時など判定できない環境では`false`を返します。

| 引数       | 型                       | 説明                                         |
| ---------- | ------------------------ | -------------------------------------------- |
| `family`   | `string`                 | フォントファミリー。クォートの有無は問わない |
| `options?` | `IsWebFontLoadedOptions` | 下記のオプション                             |

| オプション | 型                                                      | 説明                                                                                                                           |
| ---------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `weight?`  | `number \| 'normal' \| 'bold'`                          | フォントの太さ（`font-weight`）。デフォルトは`'normal'`                                                                        |
| `style?`   | `'normal' \| 'italic' \| 'oblique' \| 'oblique <n>deg'` | フォントのスタイル（`font-style`）。デフォルトは`'normal'`                                                                     |
| `width?`   | `WebFontWidth`                                          | フォントの幅（`font-width`）。キーワードのみ指定可能。デフォルトは`'normal'`                                                   |
| `text?`    | `string`                                                | 判定に使用する文字列。デフォルトは`' '`。[`unicode-range`で分割されたWebフォント](#unicode-rangeで分割されたwebフォント)を参照 |

### 定数

| 定数               | 説明                                                             |
| ------------------ | ---------------------------------------------------------------- |
| `DEFAULT_TIMEOUT`  | `waitForWebFont`の`timeout`のデフォルト値（`3000`ミリ秒）        |
| `POLLING_INTERVAL` | `waitForWebFont`が`FontFace`の登録を再確認する間隔（`25`ミリ秒） |

### 型

| 型                       | 説明                                                                              |
| ------------------------ | --------------------------------------------------------------------------------- |
| `WebFontMatchOptions`    | 対象のWebフォントを特定するためのオプション（`weight`・`style`・`width`・`text`） |
| `WebFontWidth`           | `width`に指定できるキーワード                                                     |
| `WaitForWebFontOptions`  | `waitForWebFont`のオプション                                                      |
| `IsWebFontLoadedOptions` | `isWebFontLoaded`のオプション                                                     |

## 注意事項

### 対象はWebフォントのみ

対象は`@font-face`や`FontFace`で登録されたWebフォントです。システムフォントにはロードの過程がなく、ブラウザのプライバシー保護により利用可否を確実に判定する手段もありません。システムフォントを指定した場合、`waitForWebFont`はタイムアウトし、`isWebFontLoaded`は`false`を返します。

### `unicode-range`で分割されたWebフォント

Google FontsのNoto Sans JPのように`unicode-range`で複数のファイルに分割されたWebフォントでは、`text`に含まれる文字を収録したファイルのみが判定の対象になります。実際に表示する文字を`text`に指定してください。

```ts
await waitForWebFont('Noto Sans JP', { text: 'あいう' });
```

`text`の文字を収録したファイルが無い場合（デフォルトの半角スペースを含まない和文専用のフォントなど）、`waitForWebFont`はタイムアウトします。`isWebFontLoaded`は、同じフォントファミリーのファイルが1つもロードされていなければ`false`を返しますが、他のファイルがロード済みであれば`true`を返します。ブラウザはこのような文字をロードを待たずに代替フォントで表示するためです。

### 対応ブラウザ

2021年以降にリリースされた主要ブラウザ（Chrome / Edge 88以降、Firefox 85以降、Safari 14以降）が対象です。

## ライセンス

MIT
