import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConference } from '../contexts/ConferenceContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { Trophy, Plus, Palette, Users as UsersIcon, Edit2, Trash2, Save, X } from 'lucide-react';

const Teams = () => {
  const { selectedConference } = useConference();
  const conferenceId = selectedConference?.id;
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManageTeams = user?.role === 'ADMIN' || user?.role === 'LEADER';
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '#1e3a8a' });

  const fetchTeams = async () => {
    if (!conferenceId) {
      setTeams([]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/conferences/${conferenceId}/teams`);
      setTeams(res.data.data.teams || []);
    } catch (err) {
      console.error('فشل جلب الفرق');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTeams();
  }, [conferenceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!conferenceId) {
      alert('يرجى اختيار المؤتمر أولاً');
      return;
    }

    try {
      if (editingTeam) {
        await api.patch(`/teams/${editingTeam.id}`, formData);
      } else {
        await api.post(`/conferences/${conferenceId}/teams`, formData);
      }
      closeModal();
      await fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'فشل حفظ البيانات');
    }
  };

  const openModal = (team = null) => {
    if (team) {
      setEditingTeam(team);
      setFormData({ name: team.name, color: team.color });
    } else {
      setEditingTeam(null);
      setFormData({ name: '', color: '#1e3a8a' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTeam(null);
    setFormData({ name: '', color: '#1e3a8a' });
  };

  const handleViewMembers = (team) => {
    navigate('/members', { state: { selectedTeamId: team.id } });
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الفريق؟')) return;

    try {
      await api.delete(`/teams/${teamId}`);
      await fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || 'فشل حذف الفريق');
    }
  };
  if (loading) return <div className="text-center py-20">جاري تحميل الفرق...</div>;

  return (
    <div className="space-y-8 font-arabic">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-church-dark flex items-center gap-2">
            <Trophy className="text-church-accent" />
            إدارة فرق المؤتمر
          </h1>
          <p className="text-gray-500">تحكم في تقسيم المجموعات والألوان</p>
        </div>
        
        {canManageTeams && (
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-church-dark text-white px-6 py-3 rounded-xl hover:bg-blue-900 transition-all shadow-lg"
          >
            <Plus size={20} />
            <span>إضافة فريق</span>
          </button>
        )}
      </div>

      {!conferenceId && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
          يرجى اختيار المؤتمر أولاً لعرض وإدارة الفرق.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-inner"
                style={{ backgroundColor: team.color }}
              >
                <UsersIcon size={24} />
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                {team._count?.members || 0} مخدوم
              </span>
            </div>
            <h3 className="text-xl font-bold text-church-dark mb-1">{team.name}</h3>
            <p className="text-sm text-gray-400 mb-6 font-mono uppercase tracking-wider">{team.color}</p>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleViewMembers(team)}
                className="flex-1 text-sm py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-church-light hover:text-white transition-colors"
              >
                عرض المخدومين
              </button>
              <button onClick={() => openModal(team)} className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-church-dark transition-colors">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDeleteTeam(team.id)} className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-church-dark">
                {editingTeam ? 'تعديل بيانات الفريق' : 'إضافة فريق جديد'}
              </h2>
              <button type="button" onClick={closeModal} className="rounded-full p-2 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium">اسم الفريق</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-church-light"
                  placeholder="مثال: فريق النور"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Palette size={16} /> لون الفريق
                </label>
                <input
                  type="color"
                  className="h-12 w-full cursor-pointer rounded-xl border border-gray-200"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-church-dark py-3 font-bold text-white hover:bg-blue-900">
                  <Save size={18} /> حفظ
                </button>
                <button type="button" onClick={closeModal} className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-gray-600 hover:bg-gray-200">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;