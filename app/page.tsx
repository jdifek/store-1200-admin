'use client'
import { useState, useEffect, ReactNode } from 'react';
import { Menu, X, Home, Package, FolderTree, MessageSquare, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { LoginPage } from '@/components/LoginPage';
import { Dashboard } from '@/components/Dashboard';
import { Categories } from '@/components/Categories';
import { Products } from '@/components/Products';
import { Chats } from '@/components/Chats';
import { Reviews } from '@/components/Reviews';

type PageType = 'dashboard' | 'categories' | 'products' | 'chats' | 'reviews';

interface MenuItem {
  id: PageType;
  label: string;
  icon: ReactNode;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    api.clearToken();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Главная', icon: <Home size={20} /> },
    { id: 'categories', label: 'Категории', icon: <FolderTree size={20} /> },
    { id: 'products', label: 'Товары', icon: <Package size={20} /> },
    { id: 'chats', label: 'Чаты', icon: <MessageSquare size={20} /> },
    { id: 'reviews', label: 'Отзывы', icon: <Star size={20} /> },
  ];

  const renderPage = (): ReactNode => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'categories':
        return <Categories />;
      case 'products':
        return <Products />;
      case 'chats':
        return <Chats />;
      case 'reviews':
        return <Reviews />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-600 transition"
          >
            <X size={20} />
            {sidebarOpen && <span>Выход</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {renderPage()}
      </div>
    </div>
  );
}