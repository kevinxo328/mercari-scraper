type Props = {
  url: string;
  title: string;
  imageUrl: string;
  price: number;
  currency: string;
};

const ScraperResultCard = (props: Props) => {
  return (
    <a
      href={props.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative"
    >
      <div className="aspect-square overflow-hidden bg-gray-100 rounded-lg">
        <img
          className="object-contain object-center  w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
          src={props.imageUrl}
          alt={props.title}
        />
      </div>
      <p className="absolute bottom-2 left-0 bg-gray-700/50 dark:bg-gray-950/80 py-2 px-3 text:lg sm:text-xl font-semibold text-white rounded-r-full">
        {props.price.toLocaleString()} {props.currency}
      </p>
    </a>
  );
};

export default ScraperResultCard;
