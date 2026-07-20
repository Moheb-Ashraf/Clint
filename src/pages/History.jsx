import { useState, useEffect } from 'react';
import { useConference } from '../contexts/ConferenceContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { 
  History as HistoryIcon, Search, Trash2, 
  Filter, Calendar, User, Users, Tag 
} from 'lucide-react';

const History = () => {
  const { selectedConference } = useConference();
  const conferenceId = selectedConference?.id;
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    if (!conferenceId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/conferences/${conferenceId}/reports/transactions`);
      const data = res.data?.data ?? [];
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('فشل جلب السجل');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchHistory();
  }, [conferenceId]);

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في إلغاء هذه العملية؟')) return;

    try {
      await api.delete(`/transactions/${id}`);
      // تحديث القائمة محلياً بعد الحذف الناجح
      setTransactions(prev => prev.filter(t => t.id !== id));
      alert('تم إلغاء العملية بنجاح');
    } catch (err) {
      alert(err.response?.data?.message || 'فشل إلغاء العملية');
    }
  };

  // فلاتر البحث البسيطة
  const filteredTransactions = (transactions || []).filter(t => {
    const memberName = t?.memberName ?? '';
    const teamName = t?.teamName ?? '';
    const reason = t?.reason ?? '';

    return memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reason.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return <div className="text-center py-20 font-bold">جاري تحميل السجل...</div>;

  return (
    <div className="space-y-6 font-arabic">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-church-dark flex items-center gap-2">
            <HistoryIcon className="text-church-accent" />
            سجل العمليات
          </h1>
          <p className="text-gray-500 text-sm">مراجعة كافة النقاط المسجلة في المؤتمر</p>
        </div>

        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="بحث باسم المخدوم، الفريق، أو السبب..."
            className="w-full p-3 pr-10 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-light bg-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-3 top-3.5 text-gray-400" size={18} />
        </div>
      </div>

      {!conferenceId && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
          يرجى اختيار المؤتمر أولاً لعرض السجل.
        </div>
      )}

      {/* Transactions List/Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
              <tr>
                <th className="p-5 font-semibold">التاريخ</th>
                <th className="p-5 font-semibold">المستفيد</th>
                <th className="p-5 font-semibold">السبب</th>
                <th className="p-5 font-semibold text-center">النقاط</th>
                <th className="p-5 font-semibold">بواسطة</th>
                {isAdmin && <th className="p-5 font-semibold">إجراءات</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-700">
                          {new Date(t.date).toLocaleDateString('ar-EG')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(t.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-church-dark">{t.memberName}</span>
                        <span className="text-xs flex items-center gap-1 text-gray-400">
                          <Users size={12} /> {t.teamName}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">{t.reason}</span>
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded self-start mt-1">
                          {t.category}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`font-black text-lg ${t.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {t.points > 0 ? `+${t.points}` : t.points}
                      </span>
                    </td>
                    <td className="p-5 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={14} /> {t.leaderName}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="p-5">
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                          title="إلغاء العملية"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-400">
                    لا توجد عمليات تطابق بحثك حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;