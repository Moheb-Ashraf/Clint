import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { SquarePlus, Calendar, Image as ImageIcon, AlignLeft, ArrowRight, Save } from 'lucide-react';

const CreateConference = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    theme: '',
    description: '',
    startDate: '',
    endDate: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // إرسال البيانات للباك إند (تمت برمجته سابقاً في Sprint 2)
      await api.post('/conferences', formData);
      // بعد النجاح، العودة لصفحة الاختيار لرؤية المؤتمر الجديد
      navigate('/select-conference');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إنشاء المؤتمر، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-church-bg p-6 font-arabic" dir="rtl">
      <div className="mx-auto max-w-2xl">
        {/* Navigation Back */}
        <button 
          onClick={() => navigate('/select-conference')}
          className="mb-6 flex items-center gap-2 text-gray-500 hover:text-church-dark transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة لاختيار المؤتمر</span>
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-church-dark p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <SquarePlus size={32} className="text-church-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">إنشاء مؤتمر جديد</h1>
                <p className="text-blue-100 text-sm">أدخل البيانات الأساسية لبدء الرحلة أو المؤتمر</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 border-r-4 border-red-500 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* اسم المؤتمر */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">اسم المؤتمر *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="w-full p-3 pr-10 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-light"
                    placeholder="مثال: مؤتمر الشباب الثانوي 2026"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <ImageIcon className="absolute right-3 top-3.5 text-gray-400" size={18} />
                </div>
              </div>

              {/* شعار المؤتمر (Theme) */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">شعار المؤتمر (Theme)</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-3 pr-10 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-light"
                    placeholder="مثال: راجعين للمذود"
                    value={formData.theme}
                    onChange={(e) => setFormData({...formData, theme: e.target.value})}
                  />
                  <ImageIcon className="absolute right-3 top-3.5 text-gray-400" size={18} />
                </div>
              </div>

              {/* الوصف */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">وصف مختصر</label>
                <div className="relative">
                  <textarea
                    rows="3"
                    className="w-full p-3 pr-10 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-light"
                    placeholder="اكتب نبذة عن أهداف المؤتمر..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                  <AlignLeft className="absolute right-3 top-3.5 text-gray-400" size={18} />
                </div>
              </div>

              {/* التواريخ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700 text-right">تاريخ البدء</label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-light"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700 text-right">تاريخ الانتهاء</label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-church-light"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-church-dark text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-900 transition-all shadow-lg disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : (
                <>
                  <Save size={20} />
                  <span>تأسيس المؤتمر الآن</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateConference;