import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useConference } from '../contexts/ConferenceContext';
import api from '../api/axios';
import { Trophy, Users, Tag, MessageSquare, CalendarDays } from 'lucide-react';

const TeamReportPage = () => {
  const { teamId } = useParams();
  const { selectedConference } = useConference();
  const conferenceId = selectedConference?.id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conferenceId || !teamId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchReport = async () => {
      try {
        const res = await api.get(`/conferences/${conferenceId}/reports/teams/${teamId}/summary`);
        setData(res.data.data);
      } catch (err) {
        console.error('فشل جلب تقرير الفريق', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [conferenceId, teamId]);

  if (loading) {
    return <div className="py-10 text-center text-gray-500">جاري تحميل تقرير الفريق...</div>;
  }

  if (!data) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-700">لا توجد بيانات متاحة لهذا الفريق حالياً.</div>;
  }

  const team = data.team || {};
  const totals = data.totals || {};
  const categoryBreakdown = data.categoryBreakdown || [];
  const memberBreakdown = data.memberBreakdown || [];
  const history = data.history || [];

  return (
    <div className="space-y-6 font-arabic">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-church-dark">تقرير الفريق</h1>
            <p className="text-sm text-gray-500">{team.name || 'اسم غير متوفر'}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <p>اللون: {team.color || '—'}</p>
            <p>عدد الأعضاء: {memberBreakdown.length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-amber-600">
            <Trophy size={18} />
            <span className="text-sm font-semibold">إجمالي النقاط</span>
          </div>
          <p className="text-2xl font-black text-church-dark">{totals.totalPoints ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-green-600">
            <Trophy size={18} />
            <span className="text-sm font-semibold">النقاط الإيجابية</span>
          </div>
          <p className="text-2xl font-black text-church-dark">{totals.positivePoints ?? 0}</p>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-red-600">
            <Trophy size={18} />
            <span className="text-sm font-semibold">النقاط السلبية</span>
          </div>
          <p className="text-2xl font-black text-church-dark">{totals.negativePoints ?? 0}</p>
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
            <Users size={18} /> أداء الأعضاء
          </h2>
          <div className="space-y-3">
            {memberBreakdown.length > 0 ? memberBreakdown.map((item) => (
              <div key={item.memberId} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <span className="font-medium text-gray-700">{item.memberName}</span>
                <span className="font-black text-church-dark">{item.totalPoints ?? 0} نقطة</span>
              </div>
            )) : <p className="text-gray-500">لا يوجد أعضاء مسجلين في هذا الفريق.</p>}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-church-dark">
          <CalendarDays size={18} /> سجل الفريق
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="p-3">التاريخ</th>
                <th className="p-3">المخدوم</th>
                <th className="p-3">السبب</th>
                <th className="p-3">النقاط</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? history.map((item) => (
                <tr key={item.id} className="border-t border-gray-50">
                  <td className="p-3 text-sm text-gray-600">{item.date ? new Date(item.date).toLocaleDateString('ar-EG') : '—'}</td>
                  <td className="p-3 text-sm text-gray-600">{item.memberName || '—'}</td>
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

export default TeamReportPage;
