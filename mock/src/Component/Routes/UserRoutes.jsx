import React from "react";
import { Route, Routes } from "react-router-dom";
import Registraion from "../Auth/Registraion";
import ProtectedRoute from "../Auth/ProtectedRoute";
import ExamPage from "../User/Pages/ExamPage";
import SubjectPage from "../User/Pages/SubjectPage";
import ResultPage from "../User/Pages/ResultPage";
import Login from "../Auth/Login";
import Home from "../User/Pages/Home";
import TopicPage from "../User/Pages/TopicPage";
import MockTestPage from "../MockTest/MockTest";
import ProgressPage from "../User/Pages/ProgressPage";
import HistoryPage from "../User/Pages/HistoryPage";
import LandingPage from "../User/Pages/LandingPage";
import GroupExamList from "../Group/GroupExamList";
import GroupLobby from "../Group/GroupLobby";
import GroupMockTest from "../Group/GroupMockTest";
import Leaderboard from "../Group/Leaderboard ";
import RealExamPreviewPage from "../RealExam/RealExamPreviewPage";
import RealExamsPage from "../RealExam/RealExamsPage";
import RealExamRankingPage from "../RealExam/RealExamRankingPage";
import AssignmentList from "../Assignment/AssignmentList";
import SettingsPage from "../../Settings/SettingsPage";
import SmartStudyPlanner from "../User/StudyPlanner/SmartStudyPlanner";
import BlindAccessibleExam from "../MockTest/Blindaccessibleexam";
import GamificationDashboard from "../Game/Gamificationdashboard";
import ReviewDashboard from "../Reviewdashboard/Reviewdashboard";
import ExamQuestGame from "../Game/ExamQuestGame";
import AdaptiveLearning from "../User/Pages/AdaptiveLearning";
import EngagementAnalytics from "../User/Pages/EngagementAnalytics";
import WellbeingPage from "../User/Pages/WellbeingPage";
import GoogleFitDashboard from "../User/Pages/GoogleFitDashboard";
import RecommendationEngine from "../User/Pages/RecommendationEngine";


const UserRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Registraion />} />
      <Route path="/game" element={<ExamQuestGame />} />
      <Route path="/blind-exam/:topicId" element={<BlindAccessibleExam />} />
      <Route path="/achievements" element={<GamificationDashboard />} />

      <Route path="/review" element={<ReviewDashboard />} />
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/exam/:examId" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
      <Route path="/subject/:subjectId" element={<ProtectedRoute><TopicPage /></ProtectedRoute>} />

      <Route path="/test/:topicId" element={<ProtectedRoute><MockTestPage /></ProtectedRoute>} />
      <Route path="/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />

      {/* Group exam routes */}
      <Route path="/group-exams" element={<ProtectedRoute><GroupExamList /></ProtectedRoute>} />
      <Route path="/group-exams/:id" element={<ProtectedRoute><GroupLobby /></ProtectedRoute>} />
      <Route path="/group-exams/:id/start" element={<ProtectedRoute><GroupMockTest /></ProtectedRoute>} />
      <Route path="/group-exams/:id/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

      {/* Real exam routes */}
      <Route path="/real-exams" element={<ProtectedRoute><RealExamsPage /></ProtectedRoute>} />
      <Route path="/real-exam-ranking" element={<ProtectedRoute><RealExamRankingPage /></ProtectedRoute>} />
      <Route path="/real-exam/:examId" element={<ProtectedRoute><RealExamPreviewPage /></ProtectedRoute>} />
      <Route path="/real-exam/start/:examId" element={<ProtectedRoute><MockTestPage mode="REAL" /></ProtectedRoute>} />

      {/* Assignments */}
      <Route path="/assignments" element={<ProtectedRoute><AssignmentList /></ProtectedRoute>} />

      {/* Task 3+5+6: Settings page */}
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/study-planner" element={<ProtectedRoute><SmartStudyPlanner /></ProtectedRoute>} />

      {/* 4 Major New Features */}
      <Route path="/adaptive-learning" element={<ProtectedRoute><AdaptiveLearning /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><EngagementAnalytics /></ProtectedRoute>} />
      <Route path="/wellbeing" element={<ProtectedRoute><WellbeingPage /></ProtectedRoute>} />
      <Route path="/google-fit" element={<ProtectedRoute><GoogleFitDashboard /></ProtectedRoute>} />
      <Route path="/recommendations" element={<ProtectedRoute><RecommendationEngine /></ProtectedRoute>} />

    </Routes>
  );
};

export default UserRoutes;