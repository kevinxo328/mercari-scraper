import Image from 'next/image';
import { Trash2 } from 'lucide-react';

export type Props = {
  url: string;
  title: string;
  imageUrl: string;
  price: number;
  currency: string;
  showDelete?: boolean;
  isDeleting?: boolean;
  onDelete?: () => void;
};

const LinkCard = (props: Props) => {
  const shouldShowDelete = props.showDelete && typeof props.onDelete === 'function';

  return (
    <a
      href={props.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative"
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100 rounded-lg">
        <Image
          width={300}
          height={300}
          className="object-contain object-center  w-full h-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
          src={props.imageUrl}
          alt={props.title}
        />
        {shouldShowDelete && (
          <button
            type="button"
            aria-label="Delete item"
            disabled={props.isDeleting}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              props.onDelete?.();
            }}
            className="absolute right-2 top-2 z-10 rounded-md bg-black/60 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            {props.isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
      <p className="absolute bottom-2 left-0 bg-gray-700/50 dark:bg-gray-950/80 py-2 px-3 text:lg sm:text-xl font-semibold text-white rounded-r-full">
        {props.price.toLocaleString()} {props.currency}
      </p>
    </a>
  );
};

export default LinkCard;
