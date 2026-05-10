import { NavLink, useLocation } from 'react-router-dom';
import { manifest } from '../manifest';

interface SiteNavProps {
  onNavigate: () => void;
}

export default function SiteNav({ onNavigate }: SiteNavProps) {
  const location = useLocation();

  return (
    <nav className="space-y-7">
      <div>
        <NavLink
          to="/"
          onClick={onNavigate}
          end
          className={({ isActive }) =>
            [
              'block rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-surface-subtle text-ink'
                : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
            ].join(' ')
          }
        >
          Home
        </NavLink>
      </div>

      {manifest.groups.map((group) => (
        <div key={group.title}>
          <h2 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
            {group.title}
          </h2>
          <ul className="space-y-0.5">
            {group.pages.map((page) => {
              const to = `/${page.slug}`;
              const isActive = location.pathname === to;
              return (
                <li key={page.slug}>
                  <NavLink
                    to={to}
                    onClick={onNavigate}
                    className={[
                      'block rounded-md px-3 py-1.5 text-[13px] leading-snug transition-colors',
                      isActive
                        ? 'bg-surface-subtle text-ink font-medium'
                        : 'text-ink-muted hover:bg-surface-muted hover:text-ink',
                    ].join(' ')}
                  >
                    {page.title}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
