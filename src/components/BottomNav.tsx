import { useLocation, useNavigate } from 'react-router-dom';
import { Wallet, PieChart, Tag, Plus } from '../utils/icons';

const navItems = [
  { to: '/', icon: Wallet, label: 'Home' },
  { to: '/analytics', icon: PieChart, label: 'Analytics' },
  { to: '/categories', icon: Tag, label: 'Categories' },
];

export default function BottomNav({ onAddClick }: { onAddClick: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  function handleNav(to: string) {
    if (location.pathname === to) return;
    // Home pushes normally so it stays as the base entry;
    // other tabs replace so back always returns to Home then exits.
    navigate(to, { replace: to !== '/' });
  }

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {navItems.map(({ to, icon: Icon, label }) => (
          <button
            key={to}
            className={`nav-item ${location.pathname === to ? 'active' : ''}`}
            onClick={() => handleNav(to)}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <button className="fab" onClick={onAddClick} aria-label="Add expense">
        <Plus size={24} />
      </button>
    </nav>
  );
}
