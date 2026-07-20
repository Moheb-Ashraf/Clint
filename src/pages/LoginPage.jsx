import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, Church } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تسجيل الدخول. تأكد من البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-church-bg px-4 font-arabic">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header - طابع كنسي */}
        <div className="bg-church-dark p-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <Church size={32} className="text-church-accent" />
          </div>
          <h1 className="text-2xl font-bold">نظام إدارة المؤتمرات</h1>
          <p className="mt-2 text-sm text-blue-100">سجل دخولك لإدارة النشاطات</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border-r-4 border-red-500">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 pr-10 outline-none transition focus:border-church-dark focus:ring-1 focus:ring-church-dark"
                  placeholder="admin@church.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute right-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">كلمة المرور</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  className="w-full rounded-lg border border-gray-300 p-3 pr-10 outline-none transition focus:border-church-dark focus:ring-1 focus:ring-church-dark"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute right-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-church-dark p-3 font-semibold text-white transition hover:bg-blue-900 disabled:opacity-50"
            >
              {loading ? 'جاري التحميل...' : (
                <>
                  <LogIn size={20} />
                  <span>دخول للنظام</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="bg-gray-50 p-4 text-center text-xs text-gray-500">
         كنيسة الملاك ميخائيل القلزم 
        </div>
      </div>
    </div>
  );
};

export default LoginPage;