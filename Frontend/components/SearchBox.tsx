'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number | string;
  imageUrl: string;
  URL: string;
}

interface SearchBoxProps {
  onResults?: (results: Product[]) => void;
  searchEndpoint?: string;
  type?: string;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  onResults,
  searchEndpoint = '/api/products/search',
  type = 'product',
}) => {
  const router = useRouter();
  const [query, setQuery] = useState<string>('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [results, setResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);

  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      if (searchEndpoint == '/api/products/search') {
        router.push(`/search/${encodeURIComponent(query)}`);
        setQuery('');
        setShowResults(false);
      } else {
        router.push(`/searchPost/${encodeURIComponent(query)}`);
        setQuery('');
        setShowResults(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (typingTimeout) clearTimeout(typingTimeout);

    const timeout = setTimeout(() => {
      fetchResults(value);
    }, 300);

    setTypingTimeout(timeout);
  };

  const fetchResults = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      onResults?.([]);
      return;
    }

    try {
      const response = await axios.get(`${DOMAIN}${searchEndpoint}?q=${encodeURIComponent(searchQuery)}`);
      setResults(response.data);
      onResults?.(response.data);
      setShowResults(true);
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  return (
    <div className="relative w-full h-full" ref={boxRef}>
      {/* Search Input */}
      <div
        className={`flex h-full w-full px-5 py-1 ${type === '1'
          ? 'bg-black text-white focus-within:border-gray-600 border-gray-700 focus-within:border-2'
          : 'bg-white focus-within:border-stone-700 border-black focus-within:border-3'
          } border transition-colors duration-200 rounded-full shadow-sm items-center`}
      >
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Tìm kiếm"
          className={`w-full outline-none bg-transparent ${type === '1' ? 'text-white' : 'text-gray-800'
            } placeholder-gray-400 text-[14px] line-clamp-1 text-muted`}
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
        <Search className="text-gray-500 w-5 h-5" />
      </div>

      {/* Search Results Box */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg z-[9999] max-h-72 overflow-y-auto">
          {results.map((product) => (
            <div
              key={product._id}
              className="p-3 hover:bg-gray-100 flex cursor-pointer border-b border-gray-200 last:border-none"
              onClick={() => window.open(product.URL, "_blank")}
            >
              {product.imageUrl ? (
                <div className='relative w-16 h-16'>
                  <Image
                    fill
                    className="object-cover rounded"
                    src={product.imageUrl}
                    alt={product.title}
                  />
                </div>
              ) : "Không có hình ảnh"}
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {product.title}
                </h3>
                <div className="font-bold flex text-xs mt-1">
                  <p className="mr-2 text-black">Giá tiền:</p>
                  <p className="text-red-500">{product.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
