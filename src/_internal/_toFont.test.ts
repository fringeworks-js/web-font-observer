import toFont, { normalizeFamily } from './_toFont';

describe('toFont', () => {
  it('フォントファミリーのみの場合、サイズとクォートしたファミリーを返す', () => {
    expect(toFont('Noto Sans JP', {})).toBe('16px "Noto Sans JP"');
  });

  it('style, weight, widthを指定した場合、ショートハンドに含める', () => {
    expect(
      toFont('Roboto', { style: 'italic', weight: 700, width: 'condensed' }),
    ).toBe('italic 700 condensed 16px "Roboto"');
  });

  it('クォート済みのファミリーは二重にクォートしない', () => {
    expect(toFont('"Roboto"', {})).toBe('16px "Roboto"');
    expect(toFont("'Roboto'", {})).toBe('16px "Roboto"');
  });

  it('ファミリーに含まれるダブルクォートとバックスラッシュをエスケープする', () => {
    expect(toFont('A"B\\C', {})).toBe('16px "A\\"B\\\\C"');
  });
});

describe('normalizeFamily', () => {
  it('前後の空白とクォートを取り除く', () => {
    expect(normalizeFamily('  "Noto Sans JP" ')).toBe('Noto Sans JP');
  });

  it('対応しないクォートは取り除かない', () => {
    expect(normalizeFamily('"Roboto\'')).toBe('"Roboto\'');
  });
});
