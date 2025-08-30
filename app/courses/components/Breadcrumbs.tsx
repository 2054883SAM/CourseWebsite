import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="mb-6 text-sm">
      <ol className="flex flex-wrap items-center space-x-2">
        <li>
          <Link href="/" className="text-gray-500 hover:text-blue-600 hover:underline">
            Accueil
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <span className="mx-2 text-gray-400">/</span>
            {index === items.length - 1 ? (
              <span className="text-gray-900 font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href}
                className="text-gray-500 hover:text-blue-600 hover:underline"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 