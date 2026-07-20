import { useEffect, useState } from 'react';
import { useConference } from '../contexts/ConferenceContext';
import api from '../api/axios';
import { BarChart3 } from 'lucide-react';

const TeamsComparisonPage = () => {
  const { selectedConference } = useConference();
  const conferenceId = selectedConference?.id;
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conferenceId) {
      setTeams([]);
      setLoading(false);
      return;
    }

    const fetchComparison = async () => {
      try {
        const res = await api.get(`/conferences/${conferenceId}/reports/teams/comparison`);
        setTeams(res.data.data.teams || []);
      } catch (err) {
        console.error('فشل جلب مقارنة الفرق', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [conferenceId]);

  const categoryNames = Array.from(
    new Set(teams.flatMap(team => (team.categoryBreakdown || []).map(item => item.categoryName)))
  );

  const getCategoryPoints = (team, categoryName) => {
    const item = (team.categoryBreakdown || []).find(x => x.categoryName === categoryName);
    return item?.totalPoints ?? 0;
  };

  const getTeamTotal = (team) => {
    if (team.totals?.totalPoints != null) return team.totals.totalPoints;
    return (team.categoryBreakdown || []).reduce((sum, item) => sum + (item.totalPoints ?? 0), 0);
  };

  if (loading) {
    return <div className="py-10 text-center text-gray-500">جاري تحميل مقارنة الفرق...</div>;
  }

  return (
    <div className="space-y-6 font-arabic">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-church-dark">تفاصيل مقارنة الفرق</h1>
            <p className="text-sm text-gray-500">اعرض نقاط الفرق حسب الفئة بطريقة مصفوفة واضحة وسهلة القراءة</p>
          </div>
        </div>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center text-gray-500">لا توجد بيانات مقارنة متاحة حالياً.</div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead>
                <tr className="bg-blue-950 text-white text-sm uppercase tracking-[0.08em]">
                  <th className="p-4 text-right">تفاصيل النقاط</th>
                  {teams.map((team) => (
                    <th key={team.teamName} className="p-4 text-center">{team.teamName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categoryNames.map((categoryName) => (
                  <tr key={categoryName} className="border-t border-slate-200 text-sm text-slate-700">
                    <td className="p-4 font-semibold">{categoryName}</td>
                    {teams.map((team) => (
                      <td key={`${team.teamName}-${categoryName}`} className="p-4 text-center font-bold text-slate-900">
                        {getCategoryPoints(team, categoryName)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-slate-200 bg-slate-50 text-sm font-bold text-slate-900">
                  <td className="p-4">الإجمالي</td>
                  {teams.map((team) => (
                    <td key={`${team.teamName}-total`} className="p-4 text-center">
                      {getTeamTotal(team)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsComparisonPage;
