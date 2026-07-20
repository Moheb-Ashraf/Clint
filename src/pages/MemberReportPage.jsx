import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConference } from '../contexts/ConferenceContext';
import api from '../api/axios';
import { UserCircle2, TrendingUp, TrendingDown, CalendarDays, Tag, MessageSquare, PlusCircle } from 'lucide-react';

const MemberReportPage = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { selectedConference } = useConference();
  const conferenceId = selectedConference?.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conferenceId || !memberId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        const res = await api.get(`/conferences/${conferenceId}/reports/members/${memberId}/behavior`);
        setData(res.data.data);
      } catch (err) {
        console.error('فشل جلب تقرير المخدوم', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [conferenceId, memberId]);

  if (loading) {
    return <div className="py-10 text-center text-gray-500">جاري تحميل تقرير المخدوم...</div>;
  }

  if (!data) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-700">لا توجد بيانات متاحة لهذا المخدوم حالياً.</div>;
  }

  const member = data.member || {};
  const totals = data.totals || {};
  const categoryBreakdown = data.categoryBreakdown || [];
  const reasonBreakdown = data.reasonBreakdown || [];
  const history = data.history || [];

  return (
    <div className="space-y-6 font-arabic">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-church-dark">
              <UserCircle2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-church-dark">تقرير المخدوم</h1>
              <p className="text-sm text-gray-500">{member.name || 'اسم غير متوفر'}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
              <p>الفريق: {member.teamName || '—'}</p>
              <p>الكود: {member.code || '—'}</p>
            </div>
            <button
              onClick={() => navigate('/add-points', { state: { preselectedMemberId: memberId, preselectedTeamId: member.teamId } })}
              className="flex items-center justify-center gap-2 rounded-2xl bg-church-dark px-4 py-3 text-sm font-bold text-white"
            >
              <PlusCircle size={18} /> إضافة نقاط لهذا المخدوم
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-green-600">
            <TrendingUp size={18} />
            <span className="text-sm font-semibold">إجمالي النقاط الإيجابية</span>
          </div>
          <p className="text-2xl font-black text-church-dark">{totals.positivePoints ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-red-600">
            <TrendingDown size={18} />
            <span className="text-sm font-semibold">إجمالي النقاط السلبية</span>
          </div>
          <p className="text-2xl font-black text-church-dark">{totals.negativePoints ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-gray-700">
            <CalendarDays size={18} />
            <span className="text-sm font-semibold">إجمالي العمليات</span>
          </div>
          <p className="text-2xl font-black text-church-dark">{totals.transactionCount ?? 0}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-church-dark">
            <Tag size={18} /> التوزيع حسب الفئة
          </h2>
          <div className="space-y-3">
            {categoryBreakdown.length > 0 ? categoryBreakdown.map((item) => (
              <div key={item.categoryName} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <span className="font-medium text-gray-700">{item.categoryName}</span>
                <span className="font-black text-church-dark">{item.totalPoints ?? 0} نقطة</span>
              </div>
            )) : <p className="text-gray-500">لا توجد بيانات للفئات.</p>}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-church-dark">
            <MessageSquare size={18} /> التوزيع حسب السبب
          </h2>
          <div className="space-y-3">
            {reasonBreakdown.length > 0 ? reasonBreakdown.map((item) => (
              <div key={item.reasonText} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <span className="font-medium text-gray-700">{item.reasonText}</span>
                <span className="font-black text-church-dark">{item.totalPoints ?? 0} نقطة</span>
              </div>
            )) : <p className="text-gray-500">لا توجد بيانات للأسباب.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-church-dark">سجل السلوك</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="p-3">التاريخ</th>
                <th className="p-3">الفئة</th>
                <th className="p-3">السبب</th>
                <th className="p-3">النقاط</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? history.map((item) => (
                <tr key={item.id} className="border-t border-gray-50">
                  <td className="p-3 text-sm text-gray-600">{item.date ? new Date(item.date).toLocaleDateString('ar-EG') : '—'}</td>
                  <td className="p-3 text-sm text-gray-600">{item.category || '—'}</td>
                  <td className="p-3 text-sm text-gray-600">{item.reason || '—'}</td>
                  <td className={`p-3 font-bold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>{item.points ?? 0}</td>
                </tr>
              )) : <tr><td colSpan="4" className="p-4 text-center text-gray-500">لا توجد أحداث مسجلة.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberReportPage;
