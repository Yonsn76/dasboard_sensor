import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const pageTitles: { [key: string]: string } = {
  dashboard: 'Dashboard',
  records: 'Todos los Registros',
  settings: 'Configuración',
};


const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentPage, setCurrentPage }) => {
  return (
    <div className="flex h-screen bg-content-bg">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageTitles[currentPage] || 'Dashboard'} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-content-bg p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;