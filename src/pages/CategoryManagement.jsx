import { useState, useEffect } from 'react';
import { useConference } from '../contexts/ConferenceContext';
import api from '../api/axios';
import {
  Plus, Edit2, Archive, ChevronDown, ChevronUp,
  Tag, MessageSquare, X, Save, AlertCircle, CheckCircle2
} from 'lucide-react';

const CategoryManagement = () => {
  const { selectedConference } = useConference();
  const conferenceId = selectedConference?.id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // توسيع/طي الفئة لعرض الأسباب
  const [expandedId, setExpandedId] = useState(null);

  // فورم إضافة/تعديل فئة
  const [categoryForm, setCategoryForm] = useState(null); // null = مقفول، أو { id?, name, color, icon }
  // فورم إضافة/تعديل سبب
  const [reasonForm, setReasonForm] = useState(null); // { categoryId, id?, text, defaultPoints }

  useEffect(() => {
    if (!conferenceId) {
      setCategories([]);
      return;
    }
    fetchCategories();
  }, [conferenceId]);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/conferences/${conferenceId}/categories`);
      setCategories(res.data.data.categories || []);
    } catch (err) {
      setError('فشل في تحميل الفئات');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // ---- عمليات الفئات ----
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (categoryForm.id) {
        await api.patch(`/categories/${categoryForm.id}`, {
          name: categoryForm.name,
          color: categoryForm.color,
          icon: categoryForm.icon
        });
        showSuccess('تم تحديث الفئة بنجاح');
      } else {
        await api.post(`/conferences/${conferenceId}/categories`, {
          name: categoryForm.name,
          color: categoryForm.color,
          icon: categoryForm.icon
        });
        showSuccess('تم إنشاء الفئة بنجاح');
      }
      setCategoryForm(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ الفئة');
    }
  };

  const handleArchiveCategory = async (categoryId) => {
    if (!window.confirm('هل أنت متأكد من أرشفة هذه الفئة؟ لن تظهر بعد ذلك عند تسجيل النقاط.')) return;
    setError('');
    try {
      await api.patch(`/categories/${categoryId}/archive`);
      showSuccess('تم أرشفة الفئة بنجاح');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء الأرشفة');
    }
  };

  // ---- عمليات الأسباب ----
  const handleSaveReason = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (reasonForm.id) {
        await api.patch(`/reasons/${reasonForm.id}`, {
          text: reasonForm.text,
          defaultPoints: Number(reasonForm.defaultPoints)
        });
        showSuccess('تم تحديث السبب بنجاح');
      } else {
        await api.post(`/categories/${reasonForm.categoryId}/reasons`, {
          text: reasonForm.text,
          defaultPoints: Number(reasonForm.defaultPoints)
        });
        showSuccess('تم إضافة السبب بنجاح');
      }
      setReasonForm(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ السبب');
    }
  };

  if (!conferenceId) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700 font-arabic">
        <AlertCircle size={18} />
        يرجى اختيار المؤتمر أولاً.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto font-arabic">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-church-dark flex items-center gap-2">
            <Tag className="text-church-accent" />
            إدارة الفئات والأسباب
          </h1>
          <p className="text-gray-500">أضف وعدّل فئات وأسباب تسجيل النقاط الخاصة بالمؤتمر</p>
        </div>
        <button
          onClick={() => setCategoryForm({ name: '', color: '#1e3a5f', icon: 'star' })}
          className="flex items-center gap-2 px-4 py-2 bg-church-dark text-white rounded-xl font-bold hover:bg-blue-900 transition-all"
        >
          <Plus size={18} /> فئة جديدة
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
          <AlertCircle size={20} /> {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">
          <CheckCircle2 size={20} /> {successMsg}
        </div>
      )}

      {/* فورم إضافة/تعديل فئة */}
      {categoryForm && (
        <form
          onSubmit={handleSaveCategory}
          className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-church-dark">
              {categoryForm.id ? 'تعديل الفئة' : 'فئة جديدة'}
            </h3>
            <button type="button" onClick={() => setCategoryForm(null)}>
              <X size={20} className="text-gray-400" />
            </button>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">اسم الفئة</label>
            <input
              required
              type="text"
              className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-church-light"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">اللون</label>
            <input
              type="color"
              className="w-16 h-10 rounded-lg border border-gray-300"
              value={categoryForm.color}
              onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-church-dark text-white rounded-lg font-bold"
          >
            <Save size={18} /> حفظ
          </button>
        </form>
      )}

      {/* قائمة الفئات */}
      {loading ? (
        <p className="text-gray-500">جاري التحميل...</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-500">لا توجد فئات بعد. ابدأ بإضافة فئة جديدة.</p>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between p-4">
                <button
                  className="flex items-center gap-3 flex-1 text-right"
                  onClick={() => setExpandedId(expandedId === cat.id ? null : cat.id)}
                >
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color || '#cccccc' }}
                  />
                  <span className="font-bold text-church-dark">{cat.name}</span>
                  <span className="text-sm text-gray-400">
                    ({cat.reasons?.length || 0} سبب)
                  </span>
                  {expandedId === cat.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCategoryForm({ id: cat.id, name: cat.name, color: cat.color, icon: cat.icon })}
                    className="p-2 text-gray-500 hover:text-church-dark"
                    title="تعديل"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleArchiveCategory(cat.id)}
                    className="p-2 text-gray-500 hover:text-red-600"
                    title="أرشفة"
                  >
                    <Archive size={16} />
                  </button>
                </div>
              </div>

              {expandedId === cat.id && (
                <div className="border-t border-gray-100 p-4 space-y-3">
                  {cat.reasons?.map((reason) => (
                    <div
                      key={reason.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-gray-400" />
                        <span>{reason.text}</span>
                        <span className="text-sm text-church-accent font-bold">
                          ({reason.defaultPoints}ن)
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setReasonForm({
                            id: reason.id,
                            categoryId: cat.id,
                            text: reason.text,
                            defaultPoints: reason.defaultPoints
                          })
                        }
                        className="p-1 text-gray-500 hover:text-church-dark"
                        title="تعديل"
                      >
                        <Edit2 size={14} />
                      </button>
                      {/* زرار حذف السبب معطل حاليًا - الباك إند لسه معملوش deleteReason endpoint */}
                    </div>
                  ))}

                  {reasonForm?.categoryId === cat.id ? (
                    <form onSubmit={handleSaveReason} className="p-3 border border-gray-200 rounded-lg space-y-3">
                      <input
                        required
                        type="text"
                        placeholder="نص السبب"
                        className="w-full p-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-church-light"
                        value={reasonForm.text}
                        onChange={(e) => setReasonForm({ ...reasonForm, text: e.target.value })}
                      />
                      <input
                        required
                        type="number"
                        placeholder="النقاط الافتراضية"
                        className="w-full p-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-church-light"
                        value={reasonForm.defaultPoints}
                        onChange={(e) => setReasonForm({ ...reasonForm, defaultPoints: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <button type="submit" className="px-3 py-1.5 bg-church-dark text-white rounded-lg text-sm font-bold">
                          حفظ
                        </button>
                        <button
                          type="button"
                          onClick={() => setReasonForm(null)}
                          className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm"
                        >
                          إلغاء
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => setReasonForm({ categoryId: cat.id, text: '', defaultPoints: 0 })}
                      className="flex items-center gap-2 text-sm text-church-accent font-bold"
                    >
                      <Plus size={14} /> إضافة سبب
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;