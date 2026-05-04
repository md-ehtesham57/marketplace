import { ReactNode } from "react";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  logo: ReactNode;
  navItems?: NavItem[];
  actions?: ReactNode;
}

export function Navbar({ logo, navItems, actions }: NavbarProps) {
  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">{logo}</div>
          {navItems && navItems.length > 0 && (
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="text-sm font-medium text-slate-600 hover:text-sky-500 transition-colors duration-150">
                  {item.label}
                </a>
              ))}
            </nav>
          )}
          {actions && (
            <div className="flex items-center gap-3">{actions}</div>
          )}
        </div>
      </div>
    </header>
  );
}
