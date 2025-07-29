import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClassList from '../../features/watcher/components/ClassList';
import ClassDetail from '../../features/watcher/components/ClassDetail';
import AssignmentDetail from '../../features/watcher/components/AssignmentDetail';
import AssignmentMonitoring from '../../features/watcher/components/AssignmentMonitoring';

const WatcherPage = () => {
  return (
    <Routes>
      <Route path="/" element={<ClassList />} />
      <Route path="/class/:courseId" element={<ClassDetail />} />
      <Route path="/class/:courseId/assignment/:assignmentId" element={<AssignmentDetail />} />
      <Route path="/class/:courseId/assignment/:assignmentId/monitoring/:userId" element={<AssignmentMonitoring />} />
    </Routes>
  );
};

export default WatcherPage; 