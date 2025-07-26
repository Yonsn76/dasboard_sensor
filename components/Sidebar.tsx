import React from 'react';
import clsx from 'clsx';
import { useAuth } from '../hooks/useAuth';
import { GridIcon, SettingsIcon, LogoutIcon, SensorIcon, ListIcon } from './icons';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={clsx(
        'flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-700 group',
        { 'bg-sidebar-active': isActive }
      )}
    >
      {icon}
      <span className="ms-3">{label}</span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-sidebar flex flex-col" aria-label="Sidebar">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <SensorIcon className="h-8 w-8 text-primary-blue" />
        <h1 className="text-xl font-bold text-white ml-2">Panel de Sensores</h1>
      </div>
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-2 font-medium">
          <NavLink
            icon={<GridIcon className="w-6 h-6 text-gray-400 group-hover:text-white" />}
            label="Dashboard"
            isActive={currentPage === 'dashboard'}
            onClick={() => setCurrentPage('dashboard')}
          />
           <NavLink
            icon={<ListIcon className="w-6 h-6 text-gray-400 group-hover:text-white" />}
            label="Registros"
            isActive={currentPage === 'records'}
            onClick={() => setCurrentPage('records')}
          />
          <NavLink
            icon={<SettingsIcon className="w-6 h-6 text-gray-400 group-hover:text-white" />}
            label="Configuración"
            isActive={currentPage === 'settings'}
            onClick={() => setCurrentPage('settings')}
          />
        </ul>
      </div>
      <div className="px-3 py-4 border-t border-gray-700">
         <a
            href="#"
            onClick={(e) => {
                e.preventDefault();
                logout();
            }}
            className="flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-700 group"
          >
            <LogoutIcon className="w-6 h-6 text-gray-400 group-hover:text-white" />
            <span className="ms-3 font-medium">Cerrar Sesión</span>
          </a>
      </div>
    </aside>
  );
};

export default Sidebar;