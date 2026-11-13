import isWebFontLoaded from './isWebFontLoaded';

// 実際のブラウザーの FontFaceSet で、実装が前提にしている動きと判定の結果を確かめる
const FONT_URL = new URL(
  '../../fixtures/NunitoSans-Regular.woff2',
  import.meta.url,
).href;

const added: FontFace[] = [];

/**
 * FontFace を document.fonts に登録する（テストの後に取り除く）
 */
function addFontFace(
  family: string,
  source: string | ArrayBuffer,
  descriptors?: FontFaceDescriptors,
): FontFace {
  const fontFace = new FontFace(family, source, descriptors);
  document.fonts.add(fontFace);
  added.push(fontFace);
  return fontFace;
}

async function fetchFont(): Promise<ArrayBuffer> {
  const response = await fetch(FONT_URL);
  return response.arrayBuffer();
}

describe('isWebFontLoaded（ブラウザー）', () => {
  afterEach(() => {
    added.splice(0).forEach((fontFace) => document.fonts.delete(fontFace));
  });

  it('前提: check() は、登録されていないファミリーにも true を返す', () => {
    expect(document.fonts.check('16px "Unregistered Family"')).toBe(true);
  });

  it('登録されていないファミリーは false', () => {
    expect(isWebFontLoaded('Unregistered Family')).toBe(false);
  });

  it('登録して読み込む前は false、読み込んだ後は true', async () => {
    const fontFace = addFontFace('Test Url Font', `url("${FONT_URL}")`);
    expect(fontFace.status).toBe('unloaded');
    expect(isWebFontLoaded('Test Url Font')).toBe(false);

    await fontFace.load();
    expect(isWebFontLoaded('Test Url Font')).toBe(true);
  });

  it('ArrayBuffer で登録して読み込まれたフォントは true', async () => {
    const fontFace = addFontFace('Test Buffer Font', await fetchFont());
    await fontFace.loaded;
    expect(isWebFontLoaded('Test Buffer Font')).toBe(true);
    expect(isWebFontLoaded('"test buffer font"')).toBe(true);
  });

  it('unicode-range で分けたファイルは、text の文字を収録したファイルで判定する', async () => {
    const buffer = await fetchFont();
    const latin = addFontFace('Test Split Font', buffer, {
      unicodeRange: 'U+0000-00FF',
    });
    // あ を収録したファイルは、まだ読み込んでいない
    addFontFace('Test Split Font', `url("${FONT_URL}")`, {
      unicodeRange: 'U+3042',
    });
    await latin.loaded;

    expect(isWebFontLoaded('Test Split Font', { text: 'a' })).toBe(true);
    expect(isWebFontLoaded('Test Split Font', { text: 'あ' })).toBe(false);
  });
});
