import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { usePwaUpdatePrompt } from './use-pwa-update-prompt';

const { toastInfo } = vi.hoisted(() => ({
  toastInfo: vi.fn()
}));

vi.mock('sonner', () => ({
  toast: {
    info: toastInfo
  }
}));

function mockDisplayModeStandalone(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(display-mode: standalone)' ? matches : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
}

function mockServiceWorker() {
  const waitingWorker = {
    addEventListener: vi.fn(),
    postMessage: vi.fn()
  };
  const registration = {
    waiting: waitingWorker,
    installing: null,
    addEventListener: vi.fn(),
    update: vi.fn()
  };
  const serviceWorker = {
    controller: {},
    register: vi.fn().mockResolvedValue(registration)
  };

  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: serviceWorker
  });

  return { registration, serviceWorker };
}

describe('usePwaUpdatePrompt', () => {
  beforeEach(() => {
    toastInfo.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not show the update toast in a regular web tab', async () => {
    mockDisplayModeStandalone(false);
    const { serviceWorker } = mockServiceWorker();

    renderHook(() => usePwaUpdatePrompt());

    await waitFor(() => {
      expect(serviceWorker.register).toHaveBeenCalledWith('/sw.js', {
        scope: '/'
      });
    });

    expect(toastInfo).not.toHaveBeenCalled();
  });

  it('shows the update toast when the app is running in standalone mode', async () => {
    mockDisplayModeStandalone(true);
    mockServiceWorker();

    renderHook(() => usePwaUpdatePrompt());

    await waitFor(() => {
      expect(toastInfo).toHaveBeenCalledWith(
        'New version available',
        expect.objectContaining({
          duration: Infinity
        })
      );
    });
  });
});
