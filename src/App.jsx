import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ConferenceProvider } from './contexts/ConferenceContext';
import LoginPage from './pages/LoginPage';
import ConferenceSelection from './pages/ConferenceSelection';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AddPoints from './pages/AddPoints';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Teams from './pages/Teams';
import Members from './pages/Members';
import Settings from './pages/Settings';
import CreateConference from './pages/CreateConference';
import Users from './pages/Users';
import MemberReportPage from './pages/MemberReportPage';
import TeamReportPage from './pages/TeamReportPage';
import TeamsComparisonPage from './pages/TeamsComparisonPage';
import CategoryManagement from './pages/CategoryManagement';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ConferenceProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* اختيار المؤتمر - محمي بالدخول فقط */}
            <Route path="/select-conference" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ConferenceSelection />} />
            </Route>

            <Route path="/create-conference" element={
  <ProtectedRoute allowedRoles={['ADMIN']}>
    <CreateConference />
  </ProtectedRoute>
} />

            {/* لوحة التحكم والصفحات التابعة - محمية بالدخول واختيار المؤتمر */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="add-points" element={<AddPoints />} />
              <Route path="categories" element={<CategoryManagement />} /> 
              <Route path="history" element={<History />} />
              <Route path="teams" element={<Teams />} />
              <Route path="members" element={<Members />} />
              <Route path="members/:memberId/report" element={<MemberReportPage />} />
              <Route path="teams/:teamId/report" element={<TeamReportPage />} />
              <Route path="teams/comparison" element={<TeamsComparisonPage />} />
              <Route path="settings" element={<Settings />} />
              <Route path="users" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Users />
                </ProtectedRoute>
              } />

              {/* باقي الصفحات ستضاف هنا */}
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ConferenceProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;