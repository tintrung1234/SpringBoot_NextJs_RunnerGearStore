'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Breadcrumb: React.FC = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Tạm ẩn component đến khi client render

  const pathnames = pathname.split('/').filter((x) => x);

  return (
    <nav className="text-sm text-gray-600 my-3">
      <ul className="flex items-center flex-wrap">
        <li>
          <Link href="/" className="hover:underline text-gray-600 font-medium">
            Trang chủ
          </Link>
        </li>

        {pathnames.map((name, index) => {
          const routeTo = '/' + pathnames.slice(0, index + 1).join('/');
          const isLast = index === pathnames.length - 1;

          return (
            <li key={index} className="flex items-center">
              <span className="mx-2">{'>'}</span>
              {isLast ? (
                <span className="text-black font-semibold capitalize">
                  {decodeURIComponent(name)}
                </span>
              ) : (
                <Link
                  href={routeTo}
                  className="hover:underline text-gray-600 capitalize"
                >
                  {decodeURIComponent(name)}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
