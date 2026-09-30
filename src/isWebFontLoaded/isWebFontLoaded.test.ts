import isWebFontLoaded from './isWebFontLoaded';

function createFontFaceSet(families: string[]) {
  return {
    check: vi.fn(() => true),
    forEach: (callback: (fontFace: { family: string }) => void) => {
      families.forEach((family) => callback({ family }));
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

  it('フォントファミリー名の大文字小文字を区別しない', () => {
    vi.stubGlobal('document', { fonts: createFontFaceSet(['Roboto']) });
    expect(isWebFontLoaded('roboto')).toBe(true);
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
