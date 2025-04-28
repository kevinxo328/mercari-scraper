import { prisma } from '@/utils/db';

const AppHeader = async () => {
  const getLatestUpdateTime = async () => {
    const latestUpdate = await prisma.scrapeResult.findFirst({
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        updatedAt: true
      }
    });
    return latestUpdate?.updatedAt;
  };

  const latestUpdateTime = await getLatestUpdateTime();
  const localeTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <header className="bg-white p-4 flex items-center gap-2 sticky">
      <svg
        viewBox="0 0 50 49"
        width="30"
        height="30"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        role="img"
      >
        <g id="mercari-logo">
          <path
            fill="#ff0211"
            fillRule="evenodd"
            d="M42.65,14.15l0,21a3.55,3.55,0,0,1-2,3.17l-17.8,8.59a3.54,3.54,0,0,1-3.08,0L9.25,41.82,2,38.27A3.51,3.51,0,0,1,0,35.1l0-21a3.5,3.5,0,0,1,2-3.14L19.79,2.07a3.55,3.55,0,0,1,3.16,0L40.71,11A3.53,3.53,0,0,1,42.65,14.15Z"
          ></path>
          <circle fill="#4dc9ff" cx="36.03" cy="14.65" r="9.56"></circle>
          <path
            fill="#fff"
            d="M5.87,32.15,4,31.23V25.7c0-1.62.91-3.24,2.79-3.05a4.75,4.75,0,0,1,3.54,2.75,2.4,2.4,0,0,1,2.13-.6c1,.13,4.59,1.48,4.59,6.39V37.7l-2.05-1V30.58a3.25,3.25,0,0,0-2.57-3.44c-.61-.06-1.14.43-1.15,1.48s0,6.21,0,6.21L9.4,33.91V28.12c0-2.55-1.65-3.34-2.37-3.42-.41,0-1.16.21-1.16,1.52Z"
          ></path>
        </g>
      </svg>
      <h1 className="text-md font-bold">Mercari Scraper</h1>
      <div className="ml-auto">
        <p className="text-right text-xs sm:text-sm text-gray-500">
          Last updated: <br className="sm:hidden" />
          {latestUpdateTime
            ? `${latestUpdateTime.toLocaleTimeString()} ${localeTimeZone}`
            : 'N/A'}
        </p>
      </div>
    </header>
  );
};

export default AppHeader;
