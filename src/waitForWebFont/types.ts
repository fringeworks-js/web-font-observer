import type { WebFontMatchOptions } from '../types';

/**
 * waitForWebFontのオプション
 */
export type WaitForWebFontOptions = WebFontMatchOptions & {
  /**
   * 利用可能にならなかった場合に失敗とみなすまでの時間（ミリ秒）\
   * `Infinity`を指定した場合はタイムアウトしない。`NaN`の場合はデフォルト値を使用する
   * @default 3000
   */
  timeout?: number;

  /**
   * 待機を中断するためのAbortSignal
   */
  signal?: AbortSignal;
};
