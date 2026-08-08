import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const SearchInput = ({
  placeholder = "Search...",
  value,
  onChange,
  className = "",
}: SearchInputProps) => {
  return (
    <div className={`relative ${className}`}>
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        role="searchbox"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="
          w-full pl-10 pr-4 py-2 rounded-xl border text-sm
          bg-white dark:bg-dark
          text-gray-900 dark:text-gray-100
          placeholder-gray-400 dark:placeholder-gray-500
          border-gray-200 dark:border-gray-700
          shadow-sm
          transition-all duration-200
          focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25
        "
      />
    </div>
  );
};

export default SearchInput;
