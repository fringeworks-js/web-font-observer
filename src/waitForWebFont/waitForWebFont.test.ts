import { DEFAULT_TIMEOUT, POLLING_INTERVAL } from '../constants';
import waitForWebFont from './waitForWebFont';

const fontFace = { family: 'Roboto' } as FontFace;

describe('waitForWebFont', () => {
  let load: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    load = vi.fn(() => Promise.resolve([fontFace]));
    vi.stubGlobal('document', { fonts: { load } });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('FontFaceが見つかった場合、FontFaceの配列で解決する', async () => {
    await expect(waitForWebFont('Roboto')).resolves.toEqual([fontFace]);
    expect(load).toHaveBeenCalledWith('16px "Roboto"', undefined);
  });

  it('オプションとtextをload()に渡す', async () => {
    await waitForWebFont('Roboto', {
      style: 'italic',
      weight: 300,
      text: 'あ',
    });
    expect(load).toHaveBeenCalledWith('italic 300 16px "Roboto"', 'あ');
  });

  it('FontFaceが登録されるまで再確認を繰り返す', async () => {
    load
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValue([fontFace]);
    const promise = waitForWebFont('Roboto');

    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL * 2);
    await expect(promise).resolves.toEqual([fontFace]);
    expect(load).toHaveBeenCalledTimes(3);
  });

  it('タイムアウトまでに見つからない場合、TimeoutErrorでrejectし再確認を止める', async () => {
    load.mockResolvedValue([]);
    const promise = waitForWebFont('Roboto');
    const assertion = expect(promise).rejects.toMatchObject({
      name: 'TimeoutError',
    });

    await vi.advanceTimersByTimeAsync(DEFAULT_TIMEOUT);
    await assertion;
    const count = load.mock.calls.length;
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL * 10);
    expect(load).toHaveBeenCalledTimes(count);
  });

  it('timeoutを指定した場合、その時間でタイムアウトする', async () => {
    load.mockResolvedValue([]);
    const promise = waitForWebFont('Roboto', { timeout: 100 });
    const assertion = expect(promise).rejects.toMatchObject({
      name: 'TimeoutError',
    });

    await vi.advanceTimersByTimeAsync(100);
    await assertion;
  });

  it('timeoutにInfinityを指定した場合、タイムアウトしない', async () => {
    load.mockResolvedValue([]);
    const onSettled = vi.fn();
    waitForWebFont('Roboto', { timeout: Infinity }).then(onSettled, onSettled);

    await vi.advanceTimersByTimeAsync(DEFAULT_TIMEOUT * 10);
    expect(onSettled).not.toHaveBeenCalled();

    load.mockResolvedValue([fontFace]);
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL);
    expect(onSettled).toHaveBeenCalledWith([fontFace]);
  });

  it('load()がrejectした場合、そのエラーでrejectする', async () => {
    const error = new DOMException('failed', 'NetworkError');
    load.mockRejectedValue(error);
    await expect(waitForWebFont('Roboto')).rejects.toBe(error);
  });

  it('signalで中断した場合、signal.reasonでrejectし再確認を止める', async () => {
    load.mockResolvedValue([]);
    const controller = new AbortController();
    const promise = waitForWebFont('Roboto', { signal: controller.signal });
    const assertion = expect(promise).rejects.toMatchObject({
      name: 'AbortError',
    });

    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL);
    controller.abort();
    await assertion;
    const count = load.mock.calls.length;
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL * 10);
    expect(load).toHaveBeenCalledTimes(count);
  });

  it('中断済みのsignalを渡した場合、load()を呼ばずにrejectする', async () => {
    const controller = new AbortController();
    const reason = new Error('canceled');
    controller.abort(reason);
    await expect(
      waitForWebFont('Roboto', { signal: controller.signal }),
    ).rejects.toBe(reason);
    expect(load).not.toHaveBeenCalled();
  });

  it('signal.reasonが無い場合、AbortErrorを補う', async () => {
    const signal = { aborted: true, reason: undefined } as AbortSignal;
    await expect(waitForWebFont('Roboto', { signal })).rejects.toMatchObject({
      name: 'AbortError',
    });
  });

  it('解決後はsignalのイベントリスナーを解除する', async () => {
    const controller = new AbortController();
    const removeEventListener = vi.spyOn(
      controller.signal,
      'removeEventListener',
    );
    await waitForWebFont('Roboto', { signal: controller.signal });
    expect(removeEventListener).toHaveBeenCalledWith(
      'abort',
      expect.any(Function),
    );
  });

  it('documentが存在しない環境では、NotSupportedErrorでrejectする', async () => {
    vi.stubGlobal('document', undefined);
    await expect(waitForWebFont('Roboto')).rejects.toMatchObject({
      name: 'NotSupportedError',
    });
  });
});
