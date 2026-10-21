# @fringeworks/web-font-observer

`@fringeworks/web-font-observer` is a library some will find handy, for checking whether web fonts are available.\
It is built on the standard CSS Font Loading API and provides functionality equivalent to [fontfaceobserver](https://github.com/bramstein/fontfaceobserver) for major browsers released in 2021 or later.

**[日本語のREADMEはこちら](./README.ja.md)**

## Features

- **Standards-based**: Uses `document.fonts` (CSS Font Loading API) directly, with no legacy fallback code.
- **Cancelable**: Waiting can be aborted with an `AbortSignal`, which stops polling reliably.
- **Synchronous check**: `isWebFontLoaded` tells you immediately whether a web font is already loaded, so you can skip the waiting state for cached fonts.
- **Modern naming**: Uses `width` (`font-width`) instead of the legacy `stretch` (`font-stretch`).

## Installation

```bash
npm install @fringeworks/web-font-observer
# or
pnpm add @fringeworks/web-font-observer
```

## Usage

### Waiting until a web font is available

```ts
import { waitForWebFont } from '@fringeworks/web-font-observer';

try {
  await waitForWebFont('Noto Sans JP', { weight: 700, text: 'あ' });
  // the web font is available
} catch (error) {
  // TimeoutError / AbortError, etc.
}
```

### Aborting the wait

```ts
const controller = new AbortController();
waitForWebFont('Roboto', { signal: controller.signal });

// e.g. when the component unmounts
controller.abort();
```

### Checking synchronously whether it is loaded

```ts
import { isWebFontLoaded } from '@fringeworks/web-font-observer';

if (isWebFontLoaded('Noto Sans JP')) {
  // no need to wait
}
```

## API

| Function                            | Description                                                        |
| ----------------------------------- | ------------------------------------------------------------------ |
| `waitForWebFont(family, options?)`  | Waits until a web font becomes available                           |
| `isWebFontLoaded(family, options?)` | Synchronously checks whether a web font is loaded and ready to use |

### `waitForWebFont`

```ts
waitForWebFont(
  family: string,
  options?: WaitForWebFontOptions,
): Promise<FontFace[]>
```

Waits until the specified web font becomes available, and returns a Promise that resolves with the matched `FontFace` array.\
If the `FontFace` is not registered yet (e.g. the CSS is still loading), it keeps checking until it is registered.

| Parameter  | Type                    | Description                          |
| ---------- | ----------------------- | ------------------------------------ |
| `family`   | `string`                | Font family. It may be quoted or not |
| `options?` | `WaitForWebFontOptions` | The options below                    |

| Option     | Type                                                    | Description                                                                                                                 |
| ---------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `weight?`  | `number \| 'normal' \| 'bold'`                          | Font weight (`font-weight`). Defaults to `'normal'`                                                                         |
| `style?`   | `'normal' \| 'italic' \| 'oblique' \| 'oblique <n>deg'` | Font style (`font-style`). Defaults to `'normal'`                                                                           |
| `width?`   | `WebFontWidth`                                          | Font width (`font-width`). Only keywords are accepted. Defaults to `'normal'`                                               |
| `text?`    | `string`                                                | Text used for the check. Defaults to `' '`. See [Web fonts split by `unicode-range`](#web-fonts-split-by-unicode-range)     |
| `timeout?` | `number`                                                | Time in milliseconds before giving up. Defaults to `3000`. `Infinity` disables the timeout. `NaN` falls back to the default |
| `signal?`  | `AbortSignal`                                           | Signal to abort waiting                                                                                                     |

It rejects in the following cases:

| Case                                         | Error                                                          |
| -------------------------------------------- | -------------------------------------------------------------- |
| Not available within `timeout`               | `DOMException` named `TimeoutError`                            |
| Aborted with `signal`                        | `signal.reason` (`DOMException` named `AbortError` if not set) |
| Failed to load the font file                 | The error from `document.fonts.load()`                         |
| `document.fonts` is not available (e.g. SSR) | `DOMException` named `NotSupportedError`                       |

### `isWebFontLoaded`

```ts
isWebFontLoaded(family: string, options?: IsWebFontLoadedOptions): boolean
```

Synchronously checks whether the specified web font is already loaded and ready to use.\
It returns `false` when the font is not registered in `document.fonts`, when none of its files are loaded, or when it cannot be checked (e.g. during SSR).

| Parameter  | Type                     | Description                          |
| ---------- | ------------------------ | ------------------------------------ |
| `family`   | `string`                 | Font family. It may be quoted or not |
| `options?` | `IsWebFontLoadedOptions` | The options below                    |

| Option    | Type                                                    | Description                                                                                                             |
| --------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `weight?` | `number \| 'normal' \| 'bold'`                          | Font weight (`font-weight`). Defaults to `'normal'`                                                                     |
| `style?`  | `'normal' \| 'italic' \| 'oblique' \| 'oblique <n>deg'` | Font style (`font-style`). Defaults to `'normal'`                                                                       |
| `width?`  | `WebFontWidth`                                          | Font width (`font-width`). Only keywords are accepted. Defaults to `'normal'`                                           |
| `text?`   | `string`                                                | Text used for the check. Defaults to `' '`. See [Web fonts split by `unicode-range`](#web-fonts-split-by-unicode-range) |

### Constants

| Constant           | Description                                                                       |
| ------------------ | --------------------------------------------------------------------------------- |
| `DEFAULT_TIMEOUT`  | Default `timeout` of `waitForWebFont` (`3000` ms)                                 |
| `POLLING_INTERVAL` | Interval at which `waitForWebFont` rechecks the `FontFace` registration (`25` ms) |

### Types

| Type                     | Description                                                                  |
| ------------------------ | ---------------------------------------------------------------------------- |
| `WebFontMatchOptions`    | Options to identify the target web font (`weight`, `style`, `width`, `text`) |
| `WebFontWidth`           | Keywords accepted by `width`                                                 |
| `WaitForWebFontOptions`  | Options of `waitForWebFont`                                                  |
| `IsWebFontLoadedOptions` | Options of `isWebFontLoaded`                                                 |

## Notes

### Only web fonts are supported

The target is web fonts registered via `@font-face` or `FontFace`. System fonts have no loading process and their availability cannot be detected reliably due to browser privacy protections. Specifying a system font causes `waitForWebFont` to time out and `isWebFontLoaded` to return `false`.

### Web fonts split by `unicode-range`

For web fonts split into multiple files by `unicode-range` (such as Noto Sans JP from Google Fonts), only the files covering the characters in `text` are checked. Specify `text` with the characters you actually display.

```ts
await waitForWebFont('Noto Sans JP', { text: 'あいう' });
```

If no file covers the characters in `text` (e.g. a Japanese-only font that does not include the default space), `waitForWebFont` times out. `isWebFontLoaded` returns `false` if none of the files of the font family are loaded, but returns `true` if other files are already loaded. This is because browsers render such characters with a fallback font without waiting for any load.

### Supported browsers

Major browsers released in 2021 or later (Chrome / Edge 88+, Firefox 85+, Safari 14+).

## License

MIT
