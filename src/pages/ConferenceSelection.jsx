import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useConference } from '../contexts/ConferenceContext';
import { LayoutGrid, ArrowLeftCircle, PlusCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // للتأكد من الرتبة


const ConferenceSelection = () => {
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectConference } = useConference();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConferences = async () => {
      try {
        const res = await api.get('/conferences');
        setConferences(res.data.data.conferences);
      } catch (err) {
        console.error('Failed to fetch conferences');
      } finally {
        setLoading(false);
      }
    };
    fetchConferences();
  }, []);

  const handleSelect = (conf) => {
    selectConference(conf);
    navigate('/dashboard');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-church-bg p-6 font-arabic">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-church-dark">اختر المؤتمر</h1>
            <p className="text-gray-500">اختر المؤتمر الذي ترغب في إدارته الآن</p>
          </div>
          <LayoutGrid size={40} className="text-church-accent" />
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {conferences.map((conf) => (
            <div 
              key={conf.id}
              onClick={() => handleSelect(conf)}
              className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-church-light"
            >
              <div className="bg-church-dark p-4 text-white group-hover:bg-church-light transition-colors">
                <div className="flex justify-between items-start">
                  <Calendar size={20} className="text-church-accent" />
                  <span className="text-xs bg-white/20 px-2 py-1 rounded capitalize">{conf.status.toLowerCase()}</span>
                </div>
                <h3 className="mt-4 text-xl font-bold">{conf.name}</h3>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {conf.description || 'لا يوجد وصف مضاف لهذا المؤتمر'}
                </p>
                <div className="flex items-center text-church-dark font-semibold text-sm">
                  <span>دخول للوحة التحكم</span>
                  <ArrowLeftCircle size={16} className="mr-2 rotate-180" />
                </div>
              </div>
            </div>
          ))}

          {/* زر إضافة مؤتمر جديد (للأدمن فقط) */}
          {user?.role === 'ADMIN' && (
            <Link
              to="/create-conference"
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 p-6 text-gray-400 transition-all hover:border-church-light hover:text-church-light"
            >
              <PlusCircle size={40} className="mb-2" />
              <span className="font-bold">إضافة مؤتمر جديد</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConferenceSelection;