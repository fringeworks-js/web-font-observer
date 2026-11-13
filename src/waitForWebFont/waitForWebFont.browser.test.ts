import waitForWebFont from './waitForWebFont';

// 実際のブラウザーの FontFaceSet で、実装が前提にしている動きと待ち方を確かめる
const FONT_URL = new URL(
  '../../fixtures/NunitoSans-Regular.woff2',
  import.meta.url,
).href;

const added: FontFace[] = [];

/**
 * FontFace を document.fonts に登録する（テストの後に取り除く）
 */
function addFontFace(family: string, source: string): FontFace {
  const fontFace = new FontFace(family, source);
  document.fonts.add(fontFace);
  added.push(fontFace);
  return fontFace;
}

describe('waitForWebFont（ブラウザー）', () => {
  afterEach(() => {
    added.splice(0).forEach((fontFace) => document.fonts.delete(fontFace));
  });

  it('前提: load() は、登録されていないファミリーでは空の配列で解決する', async () => {
    await expect(
      document.fonts.load('16px "Unregistered Family"'),
    ).resolves.toEqual([]);
  });

  it('登録済みで読み込む前のフォントを読み込み、その FontFace で解決する', async () => {
    const fontFace = addFontFace('Test Wait Font', `url("${FONT_URL}")`);
    const result = await waitForWebFont('Test Wait Font');
    expect(result).toEqual([fontFace]);
    expect(fontFace.status).toBe('loaded');
  });

  it('呼んだ後に登録されたフォントも、再確認して待つ', async () => {
    const promise = waitForWebFont('Test Late Font');
    setTimeout(() => addFontFace('Test Late Font', `url("${FONT_URL}")`), 100);
    const result = await promise;
    expect(result).toHaveLength(1);
    expect(result[0]!.status).toBe('loaded');
  });

  it('登録されないフォントは TimeoutError で reject する', async () => {
    await expect(
      waitForWebFont('Unregistered Family', { timeout: 100 }),
    ).rejects.toMatchObject({ name: 'TimeoutError' });
  });

  it('フォントのファイルを読み込めない場合は、load() のエラーで reject する', async () => {
    addFontFace('Test Missing Font', 'url("/fixtures/missing.woff2")');
    await expect(waitForWebFont('Test Missing Font')).rejects.toMatchObject({
      name: 'NetworkError',
    });
  });
});
