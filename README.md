# @niche-works/web-font-observer

`@niche-works/web-font-observer` is a niche library for checking whether web fonts are available.\
It is built on the standard CSS Font Loading API and provides functionality equivalent to [fontfaceobserver](https://github.com/bramstein/fontfaceobserver) for major browsers released in 2021 or later.

**[日本語のREADMEはこちら](./README.ja.md)**

## Features

- **Standards-based**: Uses `document.fonts` (CSS Font Loading API) directly, with no legacy fallback code.
- **Cancelable**: Waiting can be aborted with an `AbortSignal`, which stops polling reliably.
- **Synchronous check**: `isWebFontLoaded` tells you immediately whether a web font is already loaded, so you can skip the waiting state for cached fonts.
- **Modern naming**: Uses `width` (`font-width`) instead of the legacy `stretch` (`font-stretch`).

## Installation

```bash
npm install @niche-works/web-font-observer
# or
pnpm add @niche-works/web-font-observer
```

## Usage

### `waitForWebFont`

Waits until the specified web font becomes available.

```ts
import { waitForWebFont } from '@niche-works/web-font-observer';

try {
  await waitForWebFont('Noto Sans JP', { weight: 700, text: 'あ' });
  // the web font is available
} catch (error) {
  // TimeoutError / AbortError, etc.
}
```

The returned Promise resolves with the matched `FontFace` array and rejects with a `DOMException` in the following cases:

| Case                                         | Error                                     |
| -------------------------------------------- | ----------------------------------------- |
| Not available within `timeout`               | `TimeoutError`                            |
| Aborted with `signal`                        | `signal.reason` (`AbortError` if not set) |
| Failed to load the font file                 | The error from `document.fonts.load()`    |
| `document.fonts` is not available (e.g. SSR) | `NotSupportedError`                       |

#### Cancellation

```ts
const controller = new AbortController();
waitForWebFont('Roboto', { signal: controller.signal });

// e.g. when the component unmounts
controller.abort();
```

### `isWebFontLoaded`

Synchronously checks whether the specified web font is already loaded and ready to use.

```ts
import { isWebFontLoaded } from '@niche-works/web-font-observer';

if (isWebFontLoaded('Noto Sans JP')) {
  // no need to wait
}
```

It returns `false` when the font is not registered in `document.fonts`, or when it cannot be checked (e.g. during SSR).

## Options

| Option     | Type                                                    | Default  | Description                                                                                          |
| ---------- | ------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| `weight?`  | `number \| 'normal' \| 'bold'`                          | `normal` | Font weight (`font-weight`)                                                                          |
| `style?`   | `'normal' \| 'italic' \| 'oblique' \| 'oblique <n>deg'` | `normal` | Font style (`font-style`)                                                                            |
| `width?`   | `'normal' \| 'condensed' \| 'expanded' \| ...`          | `normal` | Font width (`font-width`). Only keywords are accepted                                                |
| `text?`    | `string`                                                | `' '`    | Text used for the check. See [Web fonts split by `unicode-range`](#web-fonts-split-by-unicode-range) |
| `timeout?` | `number`                                                | `3000`   | `waitForWebFont` only. Time in milliseconds before giving up. `Infinity` disables the timeout        |
| `signal?`  | `AbortSignal`                                           | -        | `waitForWebFont` only. Signal to abort waiting                                                       |

## Notes

### Only web fonts are supported

The target is web fonts registered via `@font-face` or `FontFace`. System fonts have no loading process and their availability cannot be detected reliably due to browser privacy protections. Specifying a system font causes `waitForWebFont` to time out and `isWebFontLoaded` to return `false`.

### Web fonts split by `unicode-range`

For web fonts split into multiple files by `unicode-range` (such as Noto Sans JP from Google Fonts), only the files covering the characters in `text` are checked. Specify `text` with the characters you actually display.

```ts
await waitForWebFont('Noto Sans JP', { text: 'あいう' });
```

### Supported browsers

Major browsers released in 2021 or later (Chrome / Edge 88+, Firefox 85+, Safari 14+).

## License

MIT
