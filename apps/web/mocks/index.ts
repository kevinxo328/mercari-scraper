export async function initMocks() {
  if (typeof window === 'undefined' && process.env.MSW_ENABLED === 'true') {
    const { server } = await import('./setups/server');
    server.listen();
    console.log('MSW is enabled in the server');
  }

  if (
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_MSW_ENABLED === 'true'
  ) {
    const { worker } = await import('./setups/browser');
    worker.start({
      onUnhandledRequest: 'bypass'
    });
    console.log('MSW is enabled in the browser');
  }
}
