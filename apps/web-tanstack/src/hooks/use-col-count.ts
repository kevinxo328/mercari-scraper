import { useEffect, useState } from 'react';

export function useColCount() {
  const [cols, setCols] = useState(2);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1280) setCols(6);
      else if (w >= 768) setCols(4);
      else if (w >= 400) setCols(3);
      else setCols(2);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return cols;
}
