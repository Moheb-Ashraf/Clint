import { useState, useEffect } from 'react';
import { useConference } from '../contexts/ConferenceContext';
import api from '../api/axios';
import { 
  Settings as SettingsIcon, Tag, ListPlus, 
  Info, Save, Plus, Trash2, Edit, ChevronLeft
} from 'lucide-react';

const Settings = () => {
  const { selectedConference } = useConference();
  const conferenceId = selectedConference?.id;
  const [activeTab, setActiveTab] = useState('general'); // general | categories
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(null); // للفئة المختارة حالياً لإضافة أسباب لها

  const fetchCategories = async () => {
    if (!conferenceId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/conferences/${conferenceId}/categories`);
      setCategories(res.data.data.categories || []);
    } catch (err) {
      console.error('فشل جلب الفئات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchCategories();
  }, [conferenceId]);

  if (loading) return <div className="text-center py-20 font-bold">جاري تحميل الإعدادات...</div>;

  return (
    <div className="max-w-6xl mx-auto font-arabic">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-church-dark flex items-center gap-2">
          <SettingsIcon className="text-church-accent" />
          إعدادات المؤتمر
        </h1>
        <p className="text-gray-500">تحكم في هيكل النقاط والبيانات التعريفية للمؤتمر</p>
      </div>

      {!conferenceId && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
          يرجى اختيار المؤتمر أولاً لعرض وإدارة الإعدادات.
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex gap-4 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-4 px-4 font-bold transition-all ${activeTab === 'general' ? 'border-b-2 border-church-dark text-church-dark' : 'text-gray-400'}`}
        >
          <div className="flex items-center gap-2"><Info size={18}/> البيانات العامة</div>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-4 px-4 font-bold transition-all ${activeTab === 'categories' ? 'border-b-2 border-church-dark text-church-dark' : 'text-gray-400'}`}
        >
          <div className="flex items-center gap-2"><Tag size={18}/> فئات وأسباب النقاط</div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* 1. General Settings */}
        {activeTab === 'general' && (
          <div className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">اسم المؤتمر</label>
                  <input type="text" defaultValue={selectedConference?.name || ''} className="w-full p-3 rounded-xl border border-gray-200" />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">شعار المؤتمر (Theme)</label>
                  <input type="text" defaultValue={selectedConference?.theme || ''} className="w-full p-3 rounded-xl border border-gray-200" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">الوصف</label>
                  <textarea rows="4" defaultValue={selectedConference?.description || ''} className="w-full p-3 rounded-xl border border-gray-200"></textarea>
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-church-dark text-white px-8 py-3 rounded-xl hover:bg-blue-900 transition-all font-bold">
              <Save size={18} /> حفظ التغييرات
            </button>
          </div>
        )}

        {/* 2. Categories & Reasons Settings */}
        {activeTab === 'categories' && (
          <div className="flex flex-col lg:flex-row min-h-125">
            {/* Sidebar: Categories List */}
            <div className="w-full lg:w-80 border-l border-gray-100 bg-gray-50/50 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-church-dark">الفئات</h3>
                <button className="p-1 bg-church-light text-white rounded-md hover:bg-church-dark transition-all">
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {(categories || []).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat)}
                    className={`w-full text-right p-4 rounded-xl flex items-center justify-between transition-all ${selectedCat?.id === cat.id ? 'bg-white shadow-md border-r-4 border-church-dark' : 'hover:bg-white/50 text-gray-500'}`}
                  >
                    <span className="font-bold">{cat.name}</span>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content: Reasons List */}
            <div className="flex-1 p-8">
              {selectedCat ? (
                <div>
                  <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
                    <div>
                      <h2 className="text-xl font-bold text-church-dark">أسباب النقاط لـ {selectedCat.name}</h2>
                      <p className="text-sm text-gray-400">تظهر هذه الأسباب للقادة عند تسجيل النقاط</p>
                    </div>
                    <button className="flex items-center gap-2 bg-church-accent text-church-dark px-4 py-2 rounded-lg font-bold hover:scale-105 transition-all text-sm">
                      <ListPlus size={16} /> إضافة سبب جديد
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {selectedCat.reasons?.length > 0 ? (
                      selectedCat.reasons.map(reason => (
                        <div key={reason.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className={`px-3 py-1 rounded-lg font-bold text-sm ${reason.isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {reason.isPositive ? '+' : '-'}{reason.defaultPoints}
                            </div>
                            <span className="font-medium text-gray-700">{reason.text}</span>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-gray-400 hover:text-church-light transition-all"><Edit size={16}/></button>
                            <button className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-10 text-gray-400 italic">لا توجد أسباب مضافة لهذه الفئة حالياً</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                   <ChevronLeft size={48} className="animate-pulse" />
                   <p className="font-bold">اختر فئة من القائمة الجانبية لعرض وتعديل أسبابها</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;