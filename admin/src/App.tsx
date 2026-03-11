import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContentList from './pages/Content/ContentList';
import ContentCreate from './pages/Content/ContentCreate';
import ContentDetail from './pages/Content/ContentDetail';
import ContentEdit from './pages/Content/ContentEdit';
import UserList from './pages/Users/UserList';
import UserDetail from './pages/Users/UserDetail';
import UserEdit from './pages/Users/UserEdit';
import CommentList from './pages/Comments/CommentList';
import CommentDetail from './pages/Comments/CommentDetail';
import UploadPage from './pages/Upload';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="content" element={<ContentList />} />
          <Route path="content/create" element={<ContentCreate />} />
          <Route path="content/:id" element={<ContentDetail />} />
          <Route path="content/:id/edit" element={<ContentEdit />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/:id" element={<UserDetail />} />
          <Route path="users/:id/edit" element={<UserEdit />} />
          <Route path="comments" element={<CommentList />} />
          <Route path="comments/:id" element={<CommentDetail />} />
          <Route path="upload" element={<UploadPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
