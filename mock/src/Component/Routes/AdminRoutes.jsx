import React from 'react'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../Auth/ProtectedRoute'
import AdminDashboard from '../Admin/AdminDashboard'
import ExamManager from '../Admin/ExamManager'
import SubjectManager from '../Admin/SubjectManager'
import TopicManager from '../Admin/TopicManager'
import QuestionManager from '../Admin/QuestionManager'

const AdminRoutes = () => {
  return (
    <Routes>
    <Route
      path="/admin"
      element={
        <ProtectedRoute role="ADMIN">
   
            <AdminDashboard />
      
        </ProtectedRoute>
      }
    />

    <Route path="/admin/exams" element={<ExamManager />} />
    <Route path="/admin/subjects" element={<SubjectManager />} />
    <Route path="/admin/topics" element={<TopicManager />} />
    <Route path="/admin/questions" element={<QuestionManager />} />
  </Routes>
  )
}

export default AdminRoutes
