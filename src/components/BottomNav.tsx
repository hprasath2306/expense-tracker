import { NavLink } from 'react-router-dom';
import { Wallet, PieChart, Tag, Plus } from '../utils/icons';

const navItems = [
  { to: '/', icon: Wallet, label: 'Home' },
  { to: '/analytics', icon: PieChart, label: 'Analytics' },
  { to: '/categories', icon: Tag, label: 'Categories' },
];

export default function BottomNav({ onAddClick }: { onAddClick: () => void }) {
  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
      <button className="fab" onClick={onAddClick} aria-label="Add expense">
        <Plus size={24} />
      </button>
    </nav>
  );
}
