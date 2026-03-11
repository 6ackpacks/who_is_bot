import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Breadcrumb } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  CommentOutlined,
  CloudUploadOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/content', icon: <FileTextOutlined />, label: '内容管理' },
  { key: '/users', icon: <UserOutlined />, label: '用户管理' },
  { key: '/comments', icon: <CommentOutlined />, label: '评论管理' },
  { key: '/upload', icon: <CloudUploadOutlined />, label: '资源上传' },
];

const breadcrumbNameMap: Record<string, string> = {
  '/': '仪表盘',
  '/content': '内容管理',
  '/content/create': '创建内容',
  '/users': '用户管理',
  '/comments': '评论管理',
  '/upload': '资源上传',
};

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const pathSnippets = location.pathname.split('/').filter((i) => i);
  const breadcrumbItems = [
    { title: '首页', href: '/' },
    ...pathSnippets.map((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      return {
        title: breadcrumbNameMap[url] || url,
      };
    }),
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} style={{ background: '#fff' }}>
        <div className="flex items-center justify-center h-16 border-b" style={{ borderColor: '#E8E6DC' }}>
          <h1 className="text-xl font-bold" style={{ color: '#D97757' }}>
            {collapsed ? '人机' : '谁是人机'}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="flex items-center">
            {collapsed ? (
              <MenuUnfoldOutlined className="text-xl cursor-pointer" onClick={() => setCollapsed(false)} />
            ) : (
              <MenuFoldOutlined className="text-xl cursor-pointer" onClick={() => setCollapsed(true)} />
            )}
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center cursor-pointer">
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#D97757' }} />
              <span className="ml-2">{admin?.username}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Breadcrumb items={breadcrumbItems} style={{ marginBottom: '16px' }} />
          <div style={{ padding: 24, background: '#fff', borderRadius: '8px', minHeight: 'calc(100vh - 140px)' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
