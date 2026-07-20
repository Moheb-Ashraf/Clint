import { createContext, useState, useContext, useEffect } from 'react';

const ConferenceContext = createContext();

export const ConferenceProvider = ({ children }) => {
  const [selectedConference, setSelectedConference] = useState(() => {
    // محاولة استعادة المؤتمر المختار من التخزين المحلي عند تحديث الصفحة
    const saved = localStorage.getItem('activeConference');
    return saved ? JSON.parse(saved) : null;
  });

  const selectConference = (conference) => {
    setSelectedConference(conference);
    localStorage.setItem('activeConference', JSON.stringify(conference));
  };

  const clearConference = () => {
    setSelectedConference(null);
    localStorage.removeItem('activeConference');
  };

  return (
    <ConferenceContext.Provider value={{ selectedConference, selectConference, clearConference }}>
      {children}
    </ConferenceContext.Provider>
  );
};

export const useConference = () => useContext(ConferenceContext);