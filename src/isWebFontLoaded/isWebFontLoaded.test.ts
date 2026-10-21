import isWebFontLoaded from './isWebFontLoaded';

type FontFaceStub = { family: string; status: FontFaceLoadStatus };

function createFontFaceSet(fontFaces: (string | FontFaceStub)[]) {
  return {
    check: vi.fn(() => true),
    forEach: (callback: (fontFace: FontFaceStub) => void) => {
      fontFaces.forEach((fontFace) =>
        callback(
          typeof fontFace === 'string'
            ? { family: fontFace, status: 'loaded' }
            : fontFace,
        ),
      );
    },
  };
}

describe('isWebFontLoaded', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('登録済みのWebフォントがロード済みの場合、trueを返す', () => {
    const fonts = createFontFaceSet(['"Noto Sans JP"']);
    vi.stubGlobal('document', { fonts });
    expect(isWebFontLoaded('Noto Sans JP')).toBe(true);
    expect(fonts.check).toHaveBeenCalledWith('16px "Noto Sans JP"', undefined);
  });

  it('登録済みのWebフォントが未ロードの場合、falseを返す', () => {
    const fonts = createFontFaceSet(['Roboto']);
    fonts.check.mockReturnValue(false);
    vi.stubGlobal('document', { fonts });
    expect(isWebFontLoaded('Roboto')).toBe(false);
  });

  it('登録されていないフォント（システムフォント等）の場合、check()を呼ばずにfalseを返す', () => {
    const fonts = createFontFaceSet(['Roboto']);
    vi.stubGlobal('document', { fonts });
    expect(isWebFontLoaded('Arial')).toBe(false);
    expect(fonts.check).not.toHaveBeenCalled();
  });

  it('ロード済みのFontFaceが無い場合（textを収録したファイルが無い場合など）、check()を呼ばずにfalseを返す', () => {
    // check()は該当するFontFaceが無いとtrueを返す
    const fonts = createFontFaceSet([
      { family: 'MyJP', status: 'unloaded' },
      { family: 'MyJP', status: 'loading' },
      { family: 'MyJP', status: 'error' },
    ]);
    vi.stubGlobal('document', { fonts });
    expect(isWebFontLoaded('MyJP')).toBe(false);
    expect(fonts.check).not.toHaveBeenCalled();
  });

  it('同じファミリーにロード済みのFontFaceがあれば、check()の結果を返す', () => {
    const fonts = createFontFaceSet([
      { family: 'MyJP', status: 'unloaded' },
      { family: 'MyJP', status: 'loaded' },
    ]);
    vi.stubGlobal('document', { fonts });
    expect(isWebFontLoaded('MyJP', { text: 'あ' })).toBe(true);
    expect(fonts.check).toHaveBeenCalledWith('16px "MyJP"', 'あ');
  });

  it('別のファミリーのFontFaceがロード済みでも、対象のファミリーが未ロードならfalseを返す', () => {
    const fonts = createFontFaceSet([
      { family: 'Roboto', status: 'loaded' },
      { family: 'MyJP', status: 'unloaded' },
    ]);
    vi.stubGlobal('document', { fonts });
    expect(isWebFontLoaded('MyJP')).toBe(false);
  });

  it('フォントファミリー名の大文字小文字を区別しない', () => {
    vi.stubGlobal('document', { fonts: createFontFaceSet(['Roboto']) });
    expect(isWebFontLoaded('roboto')).toBe(true);
  });

  it('クォート付きのフォントファミリー名を指定できる', () => {
    const fonts = createFontFaceSet(['Noto Sans JP']);
    vi.stubGlobal('document', { fonts });
    expect(isWebFontLoaded('"Noto Sans JP"')).toBe(true);
    expect(isWebFontLoaded("'Noto Sans JP'")).toBe(true);
    expect(fonts.check).toHaveBeenCalledWith('16px "Noto Sans JP"', undefined);
  });

  it('オプションとtextをcheck()に渡す', () => {
    const fonts = createFontFaceSet(['Roboto']);
    vi.stubGlobal('document', { fonts });
    isWebFontLoaded('Roboto', { weight: 'bold', text: 'あ' });
    expect(fonts.check).toHaveBeenCalledWith('bold 16px "Roboto"', 'あ');
  });

  it('check()が例外を投げた場合、falseを返す', () => {
    const fonts = createFontFaceSet(['Roboto']);
    fonts.check.mockImplementation(() => {
      throw new DOMException('invalid', 'SyntaxError');
    });
    vi.stubGlobal('document', { fonts });
    expect(isWebFontLoaded('Roboto')).toBe(false);
  });

  it('documentが存在しない環境では、falseを返す', () => {
    vi.stubGlobal('document', undefined);
    expect(isWebFontLoaded('Roboto')).toBe(false);
  });
});
