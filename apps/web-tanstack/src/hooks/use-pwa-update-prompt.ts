import { useEffect } from 'react';
import { toast } from 'sonner';

export function usePwaUpdatePrompt() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    let isDisposed = false;
    let hasPrompted = false;

    const promptForUpdate = (worker: ServiceWorker) => {
      if (isDisposed) {
        return;
      }

      if (hasPrompted) {
        return;
      }

      hasPrompted = true;
      toast.info('New version available', {
        action: {
          label: 'Update',
          onClick: () => {
            worker.addEventListener('statechange', () => {
              if (worker.state === 'activated') {
                window.location.reload();
              }
            });
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
        },
        duration: Infinity
      });
    };

    void navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        if (registration.waiting && navigator.serviceWorker.controller) {
          promptForUpdate(registration.waiting);
        }

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;

          if (!worker) {
            return;
          }

          worker.addEventListener('statechange', () => {
            if (
              worker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              promptForUpdate(worker);
            }
          });
        });

        void registration.update();
      });

    return () => {
      isDisposed = true;
    };
  }, []);
}
