import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useConference } from '../contexts/ConferenceContext';
import api from '../api/axios';
import { 
  User, Users, Award, MessageSquare, 
  CheckCircle2, AlertCircle, Send 
} from 'lucide-react';

const AddPoints = () => {
  const location = useLocation();
  const { selectedConference } = useConference();
  const conferenceId = selectedConference?.id;
  const preselectedMemberId = location.state?.preselectedMemberId || '';
  const preselectedTeamId = location.state?.preselectedTeamId || '';
  
  // States للبيانات القادمة من الباك إند
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reasons, setReasons] = useState([]);

  // States للنموذج (Form)
  const [formData, setFormData] = useState({
    teamId: '',
    memberId: '',
    categoryId: '',
    reasonId: '',
    points: 0,
    source: 'MEMBER', // أو 'TEAM'
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  // 1. جلب البيانات الأساسية (الفرق والفئات) عند تحميل الصفحة
  useEffect(() => {
    if (!conferenceId) {
      setTeams([]);
      setCategories([]);
      setMembers([]);
      setReasons([]);
      return;
    }

    const fetchInitialData = async () => {
      try {
        const [teamsRes, catsRes] = await Promise.all([
          api.get(`/conferences/${conferenceId}/teams`),
          api.get(`/conferences/${conferenceId}/categories`)
        ]);
        setTeams(teamsRes.data.data.teams || []);
        setCategories(catsRes.data.data.categories || []);
      } catch (err) {
        setError('فشل في تحميل البيانات الأساسية');
      }
    };
    fetchInitialData();
  }, [conferenceId]);

  // 2. جلب المخدومين عند اختيار فريق
  useEffect(() => {
    if (formData.teamId) {
      api.get(`/teams/${formData.teamId}/members`)
        .then(res => setMembers(res.data.data.members))
        .catch(() => setError('فشل في تحميل المخدومين'));
    } else {
      setMembers([]);
    }
  }, [formData.teamId]);

  // 3. إذا جاء المستخدم من صفحة تقرير المخدوم، نملأ الفريق والمخدوم تلقائيًا
  useEffect(() => {
    if (!conferenceId) return;

    if (preselectedTeamId && teams.some(team => team.id === preselectedTeamId)) {
      setFormData(prev => ({ ...prev, teamId: preselectedTeamId, source: 'MEMBER' }));
    }
  }, [conferenceId, preselectedTeamId, teams]);

  useEffect(() => {
    if (!conferenceId) return;

    if (preselectedMemberId && members.some(member => member.id === preselectedMemberId)) {
      setFormData(prev => ({ ...prev, memberId: preselectedMemberId, source: 'MEMBER' }));
    }
  }, [conferenceId, preselectedMemberId, members]);

  // 4. تحديث الأسباب عند اختيار فئة
  useEffect(() => {
    if (formData.categoryId) {
      const selectedCat = categories.find(c => c.id === formData.categoryId);
      setReasons(selectedCat?.reasons || []);
    } else {
      setReasons([]);
    }
  }, [formData.categoryId, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!conferenceId) {
      setError('يرجى اختيار المؤتمر أولاً');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      // إرسال الطلب للباك إند
      await api.post(`/conferences/${conferenceId}/transactions`, {
        ...formData,
        memberId: formData.source === 'TEAM' ? null : formData.memberId,
        points: Number(formData.points)
      });

      setSuccessMsg('تم تسجيل النقاط بنجاح! 🎉');
      // إعادة تهيئة الأجزاء المتغيرة فقط من النموذج
      setFormData(prev => ({ ...prev, memberId: '', reasonId: '', points: 0, notes: '' }));
      
      // إخفاء رسالة النجاح بعد 3 ثوانٍ
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto font-arabic">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-church-dark flex items-center gap-2">
          <Award className="text-church-accent" />
          تسجيل نقاط جديدة
        </h1>
        <p className="text-gray-500">سجل إنجازات المخدومين أو الفرق لحظة بلحظة</p>
      </div>

      {!conferenceId && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
          <AlertCircle size={18} />
          يرجى اختيار المؤتمر من القائمة قبل تسجيل النقاط.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* نوع العملية: فردي أم فريق */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, source: 'MEMBER' })}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
              formData.source === 'MEMBER' ? 'border-church-light bg-blue-50 text-church-dark' : 'border-gray-200 bg-white'
            }`}
          >
            <User size={24} className="mb-2" />
            <span className="font-bold">نقطة لفرد</span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, source: 'TEAM' })}
            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
              formData.source === 'TEAM' ? 'border-church-light bg-blue-50 text-church-dark' : 'border-gray-200 bg-white'
            }`}
          >
            <Users size={24} className="mb-2" />
            <span className="font-bold">نقطة لفريق</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          {/* اختيار الفريق */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">الفريق</label>
            <select
              required
              className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-church-light"
              value={formData.teamId}
              onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
            >
              <option value="">اختر الفريق...</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          {/* اختيار المخدوم (يظهر فقط إذا كان المصدر MEMBER) */}
          {formData.source === 'MEMBER' && (
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">المخدوم</label>
              <select
                required={formData.source === 'MEMBER'}
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-church-light"
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              >
                <option value="">اختر المخدوم...</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          )}

          {/* الفئة والسبب */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">الفئة</label>
              <select
                required
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-church-light"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">اختر الفئة...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">السبب</label>
              <select
                required
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-church-light"
                value={formData.reasonId}
                onChange={(e) => {
                  const reason = reasons.find(r => r.id === e.target.value);
                  setFormData({ 
                    ...formData, 
                    reasonId: e.target.value,
                    points: reason ? reason.defaultPoints : 0
                  });
                }}
              >
                <option value="">اختر السبب...</option>
                {reasons.map(r => <option key={r.id} value={r.id}>{r.text} ({r.defaultPoints}ن)</option>)}
              </select>
            </div>
          </div>

          {/* النقاط والملاحظات */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold mb-2 text-gray-700">النقاط</label>
              <input
                type="number"
                className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-church-light font-bold text-center text-xl"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2 text-gray-700">ملاحظات (اختياري)</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 pr-10 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-church-light"
                  placeholder="اكتب أي ملاحظات إضافية..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
                <MessageSquare className="absolute right-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* رسائل التنبيه */}
        {error && <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 animate-pulse"><AlertCircle size={20}/> {error}</div>}
        {successMsg && <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 animate-bounce"><CheckCircle2 size={20}/> {successMsg}</div>}

        <button
          type="submit"
          disabled={loading || !conferenceId}
          className="w-full py-4 bg-church-dark text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-900 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'جاري الحفظ...' : (
            <>
              <Send size={20} />
              حفظ وتسجيل النقاط
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddPoints;