import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AssessmentQuiz from "./pages/AssessmentQuiz";
import Settings from "./pages/Settings";
import Curriculum from "./pages/Curriculum";
import { Profile } from "./pages/Placeholders";
import LearningPath from "./pages/LearningPath";
import LessonView from "./pages/LessonView";
import { AssessmentHistoryPage } from "./pages/History";
import VoiceLearning from "./pages/VoiceLearning";
import Achievements from "./pages/Achievements";
import LearningReports from "./pages/LearningReports";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import About from "./pages/About";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/assessment" element={<AssessmentQuiz />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/voice" element={<VoiceLearning />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/reports" element={<LearningReports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/curriculum" element={<Curriculum />} />
              <Route path="/learning-path" element={<LearningPath />} />
              <Route path="/lesson/:id" element={<LessonView />} />
              <Route path="/history" element={<AssessmentHistoryPage />} />
              <Route path="/settings" element={<Settings />} />
              {/* Redirect to dashboard as default protected route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
