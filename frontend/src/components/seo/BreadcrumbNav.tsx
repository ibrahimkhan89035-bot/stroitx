import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbLink {
  label: string;
  path?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbLink[];
  className?: string;
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ items, className = '' }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-1.5 text-xs text-slate-500 font-medium py-3 ${className}`}
      itemScope
      itemType="https://schema.org/BreadcrumbList"
    >
      <div
        className="flex items-center"
        itemProp="itemListElement"
        itemScope
        itemType="https://schema.org/ListItem"
      >
        <Link
          to="/"
          className="flex items-center hover:text-orange-600 transition-colors"
          itemProp="item"
        >
          <Home className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
          <span itemProp="name">Home</span>
        </Link>
        <meta itemProp="position" content="1" />
      </div>

      {items.map((item, idx) => {
        const position = idx + 2;
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <div
              className="flex items-center"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  className="hover:text-orange-600 transition-colors"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span
                  className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-none"
                  itemProp="name"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              <meta itemProp="position" content={position.toString()} />
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
};
