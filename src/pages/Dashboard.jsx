import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConference } from '../contexts/ConferenceContext';
import { useSocket } from '../hooks/useSocket';
import api from '../api/axios';
import { 
  Trophy, Users, Star, TrendingUp, 
  ChevronRight, Award, Zap 
} from 'lucide-react';

const Dashboard = () => {
  const { selectedConference } = useConference();
  const conferenceId = selectedConference?.id;
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // دالة جلب البيانات من الـ API
  const fetchDashboardData = async () => {
    if (!conferenceId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/conferences/${conferenceId}/dashboard`);
      setData(res.data.data);
      setIsLive(true);
      setTimeout(() => setIsLive(false), 2000);
    } catch (err) {
      console.error('فشل تحديث البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDashboardData();
  }, [conferenceId]);

  // تفعيل التحديث اللحظي عبر السوكيت
  useSocket(conferenceId, () => {
    if (conferenceId) {
      fetchDashboardData();
    }
  });

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-bounce text-church-dark font-bold">جاري تحميل النتائج...</div>
    </div>
  );

  if (!data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-4 text-gray-600 shadow-sm">
          لا يوجد مؤتمر محدد أو لا توجد بيانات متاحة حالياً.
        </div>
      </div>
    );
  }

  const { summary, ranking, topMembers } = data;

  return (
    <div className="space-y-8 font-arabic">
      {/* Header مع مؤشر Live */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-church-dark">نتائج المؤتمر</h1>
          <p className="text-gray-500">متابعة حية لترتيب الفرق والمخدومين</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isLive ? 'bg-yellow-100 border-yellow-400 text-yellow-700' : 'bg-green-100 border-green-400 text-green-700'}`}>
          <Zap size={16} className={isLive ? 'animate-ping' : ''} />
          <span className="text-sm font-bold">{isLive ? 'جاري التحديث...' : 'بث مباشر'}</span>
        </div>
      </div>

      {/* كروت الملخص (Summary) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي الفرق" value={summary.totalTeams} icon={<Trophy className="text-amber-500" />} />
        <StatCard title="إجمالي المخدومين" value={summary.totalMembers} icon={<Users className="text-blue-500" />} />
        <StatCard title="نقاط إيجابية" value={`+${summary.positivePoints}`} icon={<Star className="text-green-500" />} />
        <StatCard title="نقاط جزاء" value={`-${summary.negativePoints}`} icon={<TrendingUp className="text-red-500" rotate={180} />} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={() => navigate('/teams/comparison')}
          className="rounded-3xl border border-gray-100 bg-white p-5 text-right shadow-sm transition-all hover:border-church-light hover:shadow-md"
        >
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-church-dark">
            <Trophy size={18} className="text-amber-500" /> مقارنة الفرق
          </h3>
          <p className="text-sm text-gray-500">اعرض أداء جميع الفرق وتوزيع النقاط بينهم.</p>
        </button>

        <button
          onClick={() => navigate('/teams')}
          className="rounded-3xl border border-gray-100 bg-white p-5 text-right shadow-sm transition-all hover:border-church-light hover:shadow-md"
        >
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-church-dark">
            <Users size={18} className="text-blue-500" /> إدارة الفرق
          </h3>
          <p className="text-sm text-gray-500">انتقل إلى صفحة الفرق لإدارة الأعضاء والتفاصيل.</p>
        </button>

        <button
          onClick={() => navigate('/members')}
          className="rounded-3xl border border-gray-100 bg-white p-5 text-right shadow-sm transition-all hover:border-church-light hover:shadow-md"
        >
          <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-church-dark">
            <Award size={18} className="text-green-500" /> إدارة المخدومين
          </h3>
          <p className="text-sm text-gray-500">شاهد المخدومين وأدخل أو عدّل بياناتهم بسهولة.</p>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* جدول ترتيب الفرق (Ranking) */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2 text-church-dark">
              <Trophy size={20} className="text-church-accent" />
              ترتيب الفرق الحالي
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-right text-gray-400 text-sm">
                  <th className="p-6 font-medium">الترتيب</th>
                  <th className="p-6 font-medium">الفريق</th>
                  <th className="p-6 font-medium text-center">مجموع النقاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(ranking || []).map((team) => (
                  <tr key={team.teamName} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-6">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                        team.rank === 1 ? 'bg-amber-100 text-amber-600' : 
                        team.rank === 2 ? 'bg-slate-100 text-slate-500' :
                        team.rank === 3 ? 'bg-orange-100 text-orange-600' : 'text-gray-400'
                      }`}>
                        {team.rank}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.teamColor }}></div>
                        <span className="font-bold text-gray-700">{team.teamName}</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className="inline-block px-4 py-1 bg-church-bg text-church-dark rounded-full font-black text-lg">
                        {team.totalPoints}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* قائمة أفضل المخدومين (Top Members) */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-church-dark border-b border-gray-50 pb-4">
            <Award size={20} className="text-church-accent" />
            نجوم المؤتمر
          </h3>
          <div className="space-y-6">
            {(topMembers || []).map((member) => (
              <div key={member.memberName} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold group-hover:bg-church-dark group-hover:text-white transition-all">
                    {member.rank}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{member.memberName}</h4>
                    <p className="text-xs text-gray-400">{member.teamName}</p>
                  </div>
                </div>
                <div className="text-church-light font-black">{member.totalPoints}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// مكون فرعي للكروت
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className="p-4 bg-gray-50 rounded-2xl">{icon}</div>
    <div>
      <p className="text-sm text-gray-400 font-medium">{title}</p>
      <h4 className="text-2xl font-black text-church-dark">{value}</h4>
    </div>
  </div>
);

export default Dashboard;