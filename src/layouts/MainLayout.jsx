import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useConference } from '../contexts/ConferenceContext';
import { 
  LayoutDashboard, Users, UserPlus, History, 
  Settings, LogOut, Menu, X, Trophy , Tag 
} from 'lucide-react';
import { useState } from 'react';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { selectedConference, clearConference } = useConference();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { path: '/teams', icon: Trophy, label: 'ترتيب الفرق' },
    { path: '/add-points', icon: UserPlus, label: 'تسجيل نقاط' },
    { path: '/categories', icon: Tag, label: 'الفئات والأسباب' },
    { path: '/members', icon: Users, label: 'المخدومين' },
    { path: '/history', icon: History, label: 'سجل العمليات' },
    { path: '/settings', icon: Settings, label: 'الإعدادات' },
  ];

  const adminMenuItems = user?.role === 'ADMIN' ? [{ path: '/users', icon: Users, label: 'إدارة المستخدمين' }] : [];

  const handleSwitchConference = () => {
    setIsSidebarOpen(false);
    clearConference();
    navigate('/select-conference');
  };

  return (
    <div className="flex min-h-screen bg-church-bg font-arabic" dir="rtl">
      {/* Sidebar للهواتف */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 lg:hidden ${isSidebarOpen ? 'visible' : 'pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      >
        <div className={`absolute inset-0 bg-black/50 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`} />
        <aside
          className={`absolute right-0 top-0 flex h-full w-64 flex-col bg-church-dark p-6 text-white shadow-xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
            <button onClick={() => setIsSidebarOpen(false)} className="rounded-lg p-2 hover:bg-white/10">
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-church-accent">{selectedConference?.name || 'اختر مؤتمر'}</h2>
          </div>

          <button
            onClick={handleSwitchConference}
            className="mb-4 flex items-center justify-center rounded-lg border border-blue-300/40 bg-white/10 px-3 py-2 text-sm text-blue-200 transition-colors hover:bg-white/20"
          >
            تغيير المؤتمر
          </button>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  location.pathname === item.path ? 'bg-church-accent text-church-dark font-bold' : 'hover:bg-white/10'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}

            {adminMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  location.pathname === item.path ? 'bg-church-accent text-church-dark font-bold' : 'hover:bg-white/10'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-church-accent font-bold text-church-dark">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-bold">{user?.name || 'User'}</p>
                <p className="text-xs text-blue-300">{user?.role || 'User'}</p>
              </div>
            </div>
            <button onClick={logout} className="flex w-full items-center gap-2 text-red-400 transition-colors hover:text-red-300">
              <LogOut size={18} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Sidebar للديسكتوب */}
      <aside className="hidden w-64 shrink-0 flex-col bg-church-dark text-white shadow-xl lg:flex">
        <div className="border-b border-white/10 p-6 text-center">
          <h2 className="truncate text-xl font-bold text-church-accent">{selectedConference?.name || 'اختر مؤتمر'}</h2>
          <button onClick={handleSwitchConference} className="mt-2 text-xs text-blue-300 underline hover:text-white">
            تغيير المؤتمر
          </button>
        </div>

        <nav className="mt-10 flex-1 space-y-2 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                location.pathname === item.path ? 'bg-church-accent text-church-dark font-bold' : 'hover:bg-white/10'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}

          {adminMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                location.pathname === item.path ? 'bg-church-accent text-church-dark font-bold' : 'hover:bg-white/10'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-church-accent font-bold text-church-dark">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold">{user?.name || 'User'}</p>
              <p className="text-xs text-blue-300">{user?.role || 'User'}</p>
            </div>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-2 text-red-400 transition-colors hover:text-red-300">
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 p-4 backdrop-blur-md lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="rounded-lg p-2 text-church-dark hover:bg-gray-100">
            <Menu size={24} />
          </button>
        </header>
        <div className="p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;