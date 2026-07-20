import { useState, useEffect } from 'react';
import api from '../api/axios';
import { UserPlus, Shield, Check, Mail, Lock, Settings } from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const [newUser, setNewUser] = useState({
    name: '', email: '', password: '', role: 'LEADER', conferenceIds: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, cRes] = await Promise.all([
          api.get('/users').catch(() => ({ data: { data: { users: [] } } })),
          api.get('/conferences').catch(() => ({ data: { data: { conferences: [] } } }))
        ]);

        setUsers(uRes?.data?.data?.users || []);
        setConferences(cRes?.data?.data?.conferences || []);
      } catch (err) {
        setError('تعذر تحميل بيانات إدارة المستخدمين حالياً');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', newUser);
      alert('تم إنشاء حساب الخادم بنجاح');
      setShowModal(false);
      // إعادة جلب البيانات...
    } catch (err) {
      alert('خطأ في الإنشاء');
    }
  };

  const toggleConference = (id) => {
    setNewUser(prev => ({
      ...prev,
      conferenceIds: prev.conferenceIds.includes(id) 
        ? prev.conferenceIds.filter(c => c !== id) 
        : [...prev.conferenceIds, id]
    }));
  };

  return (
    <div className="space-y-6 font-arabic">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-church-dark">إدارة الخدام والمستخدمين</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-church-dark text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-900 transition-all"
        >
          <UserPlus size={20} /> إضافة خادم جديد
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
          {error}
        </div>
      )}

      {/* جدول المستخدمين */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="p-4">الاسم</th>
              <th className="p-4">البريد الإلكتروني</th>
              <th className="p-4">الرتبة</th>
              <th className="p-4">المؤتمرات المسندة</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-400">جاري تحميل البيانات...</td>
              </tr>
            ) : users.length > 0 ? (
              users.map(u => (
                <tr key={u.id} className="border-t border-gray-50">
                  <td className="p-4 font-bold">{u.name}</td>
                  <td className="p-4 text-gray-500">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {(u.conferences || []).map(c => (
                        <span key={c.id} className="text-[10px] bg-gray-100 p-1 rounded">{c.name}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-400">لا توجد بيانات متاحة حالياً</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal إضافة خادم */}
      {showModal && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-church-dark p-6 text-white text-center">
              <h2 className="text-xl font-bold">إنشاء حساب خادم جديد</h2>
            </div>
            <form onSubmit={handleCreateUser} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="الاسم الكامل" className="p-3 border rounded-xl" required
                  onChange={e => setNewUser({...newUser, name: e.target.value})} />
                <input type="email" placeholder="البريد الإلكتروني" className="p-3 border rounded-xl" required
                  onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <input type="password" placeholder="كلمة المرور" className="w-full p-3 border rounded-xl" required
                onChange={e => setNewUser({...newUser, password: e.target.value})} />
              
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-700">اسناد للمؤتمرات (يظهر له فقط ما تختاره هنا):</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-xl border">
                  {conferences.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleConference(c.id)}
                      className={`text-right p-2 rounded-lg text-xs flex justify-between items-center transition-all ${newUser.conferenceIds.includes(c.id) ? 'bg-church-light text-white' : 'bg-white border'}`}
                    >
                      {c.name}
                      {newUser.conferenceIds.includes(c.id) && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button type="submit" className="flex-1 bg-church-dark text-white py-3 rounded-xl font-bold">تأكيد الإنشاء</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 py-3 rounded-xl">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;