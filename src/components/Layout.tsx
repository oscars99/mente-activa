import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', key: 'nav.home', icon: '🏠' },
  { to: '/progreso', key: 'nav.progress', icon: '📈' },
  { to: '/ajustes', key: 'nav.settings', icon: '⚙️' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-dvh pb-28">
      <main className="mx-auto w-full max-w-xl px-4 pt-6">{children}</main>
      <nav
        aria-label={t('app.name')}
        className="fixed inset-x-0 bottom-0 z-10 border-t-2 border-borde bg-white pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="mx-auto flex max-w-xl">
          {TABS.map((tab) => (
            <li key={tab.to} className="flex-1">
              <NavLink
                to={tab.to}
                end
                className={({ isActive }) =>
                  `flex min-h-[4.5rem] flex-col items-center justify-center gap-0.5 whitespace-nowrap text-[0.85rem] font-bold ${
                    isActive ? 'bg-primario-claro text-primario-oscuro' : 'text-tinta-suave'
                  }`
                }
              >
                <span aria-hidden className="text-2xl leading-none">
                  {tab.icon}
                </span>
                {t(tab.key)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

/** Full-screen layout for exercises: no tab bar, so nothing can be tapped by accident. */
export function FocusLayout({ children }: { children: ReactNode }) {
  return <main className="mx-auto min-h-dvh w-full max-w-xl px-4 pb-10 pt-4">{children}</main>;
}
