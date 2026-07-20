import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConference } from '../contexts/ConferenceContext';
import api from '../api/axios';
import { Users as MembersIcon, UserPlus, Search, Phone, Fingerprint, Edit3, Trash2, X, PlusCircle } from 'lucide-react';

const Members = () => {
  const { selectedConference } = useConference();
  const navigate = useNavigate();
  const location = useLocation();
  const conferenceId = selectedConference?.id;
  const preferredTeamId = location.state?.selectedTeamId;
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', phone: '', gender: 'MALE' });

  // جلب الفرق أولاً للفلترة
  useEffect(() => {
    if (!conferenceId) {
      setTeams([]);
      setMembers([]);
      setSelectedTeamId('');
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get(`/conferences/${conferenceId}/teams`)
      .then(res => {
        const fetchedTeams = res.data.data.teams || [];
        setTeams(fetchedTeams);
        if (fetchedTeams.length > 0) {
          const nextTeamId = preferredTeamId && fetchedTeams.some(team => team.id === preferredTeamId)
            ? preferredTeamId
            : fetchedTeams[0].id;
          setSelectedTeamId(nextTeamId);
        } else {
          setSelectedTeamId('');
          setMembers([]);
        }
      })
      .catch(() => {
        setTeams([]);
        setMembers([]);
      })
      .finally(() => setLoading(false));
  }, [conferenceId, preferredTeamId]);

  // جلب المخدومين عند تغيير الفريق المختار
  useEffect(() => {
    if (!conferenceId || !selectedTeamId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    api.get(`/teams/${selectedTeamId}/members`)
      .then(res => setMembers(res.data.data.members || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [conferenceId, selectedTeamId]);

  const filteredMembers = (members || []).filter(m => 
    (m.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.code || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTeamId) {
      alert('يرجى اختيار فريق أولاً');
      return;
    }

    try {
      if (editingMember) {
        await api.patch(`/members/${editingMember.id}`, formData);
      } else {
        await api.post(`/teams/${selectedTeamId}/members`, formData);
      }
      closeModal();
      api.get(`/teams/${selectedTeamId}/members`)
        .then(res => setMembers(res.data.data.members || []))
        .catch(() => setMembers([]));
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ في الحفظ');
    }
  };

  const openModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name || '',
        code: member.code || '',
        phone: member.phone || '',
        gender: member.gender || 'MALE'
      });
    } else {
      setEditingMember(null);
      setFormData({ name: '', code: '', phone: '', gender: 'MALE' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setFormData({ name: '', code: '', phone: '', gender: 'MALE' });
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المخدوم؟')) return;

    try {
      await api.delete(`/members/${memberId}`);
      const res = await api.get(`/teams/${selectedTeamId}/members`);
      setMembers(res.data.data.members || []);
    } catch (err) {
      alert(err.response?.data?.message || 'فشل حذف المخدوم');
    }
  };

  const handleOpenMemberReport = (memberId) => {
    navigate(`/members/${memberId}/report`);
  };

  return (
    <div className="space-y-6 font-arabic">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-church-dark flex items-center gap-2">
            <MembersIcon className="text-church-accent" />
            إدارة المخدومين
          </h1>
          <p className="text-gray-500">توزيع المخدومين على الفرق وبياناتهم</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-2 bg-church-light text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all shadow-md font-bold">
          <UserPlus size={20} />
          <span>إضافة مخدوم جديد</span>
        </button>
      </div>

      {!conferenceId && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
          يرجى اختيار المؤتمر أولاً لعرض المخدومين.
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        {/* فلتر الفرق */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {teams.map(team => (
            <button
              key={team.id}
              onClick={() => setSelectedTeamId(team.id)}
              className={`whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all border ${
                selectedTeamId === team.id 
                ? 'bg-church-dark text-white border-church-dark shadow-md' 
                : 'bg-white text-gray-500 border-gray-200 hover:border-church-light'
              }`}
            >
              {team.name}
            </button>
          ))}
        </div>
        
        {/* بحث */}
        <div className="relative flex-1 md:max-w-xs md:mr-auto">
          <input 
            type="text"
            placeholder="بحث بالاسم أو الكود..."
            className="w-full p-2.5 pr-10 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-light"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-3 top-3 text-gray-400" size={18} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="col-span-full text-center py-10 text-gray-400">جاري التحميل...</p>
        ) : filteredMembers.length > 0 ? (
          filteredMembers.map(member => (
            <div key={member.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-4 hover:border-church-light transition-all shadow-sm">
              <button
                onClick={() => handleOpenMemberReport(member.id)}
                className="flex flex-1 items-center gap-4 text-right"
              >
                <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-church-dark">
                {member.photo ? (
                  <img src={member.photo} alt={member.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  <MembersIcon size={24} className="opacity-40" />
                )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{member.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] flex items-center gap-1 text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                      <Fingerprint size={10} /> {member.code || 'بدون كود'}
                    </span>
                    {member.phone && (
                      <span className="text-[10px] flex items-center gap-1 text-gray-400">
                        <Phone size={10} /> {member.phone}
                      </span>
                    )}
                  </div>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/add-points', { state: { preselectedMemberId: member.id, preselectedTeamId: selectedTeamId } })}
                  className="rounded-full p-2 text-gray-300 transition-all hover:bg-green-50 hover:text-green-600"
                  title="إضافة نقاط لهذا المخدوم"
                >
                  <PlusCircle size={16} />
                </button>
                <button onClick={() => openModal(member)} className="rounded-full p-2 text-gray-300 transition-all hover:bg-gray-50 hover:text-church-dark">
                  <Edit3 size={16} />
                </button>
                <button onClick={() => handleDelete(member.id)} className="rounded-full p-2 text-gray-300 transition-all hover:bg-red-50 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400">لا يوجد مخدومين في هذا الفريق حالياً</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
            <div className="rounded-t-3xl bg-church-dark p-6 text-center text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{editingMember ? 'تعديل بيانات مخدوم' : 'إضافة مخدوم للفريق'}</h2>
                <button type="button" onClick={closeModal} className="rounded-full p-2 hover:bg-white/10">
                  <X size={18} />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 p-8">
              <input
                type="text"
                placeholder="الاسم الكامل"
                required
                className="w-full rounded-xl border p-3"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="الكود (QR)"
                  className="w-full rounded-xl border p-3"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="رقم الهاتف"
                  className="w-full rounded-xl border p-3"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <select
                className="w-full rounded-xl border p-3"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="MALE">ذكر</option>
                <option value="FEMALE">أنثى</option>
              </select>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 rounded-xl bg-church-dark py-3 font-bold text-white">
                  حفظ البيانات
                </button>
                <button type="button" onClick={closeModal} className="flex-1 rounded-xl bg-gray-100 py-3">
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

export default Members;