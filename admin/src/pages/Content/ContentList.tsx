import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Select, Space, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { contentApi } from '../../api/content';
import { ContentInfo } from '../../types';

const { Search } = Input;
const { Option } = Select;

export default function ContentList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ContentInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({ type: '', isAi: undefined, search: '' });

  useEffect(() => {
    loadData();
  }, [page, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await contentApi.getList({ page, limit, ...filters });
      setData(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await contentApi.delete(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/content/export`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      message.error('导出失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          text: { text: '文本', color: 'blue' },
          image: { text: '图片', color: 'green' },
          video: { text: '视频', color: 'purple' },
        };
        return <Tag color={typeMap[type]?.color}>{typeMap[type]?.text}</Tag>;
      },
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '来源',
      dataIndex: 'isAi',
      key: 'isAi',
      width: 80,
      render: (isAi: boolean) => (
        <Tag color={isAi ? 'orange' : 'cyan'}>{isAi ? 'AI' : '人类'}</Tag>
      ),
    },
    {
      title: '模型标签',
      dataIndex: 'modelTag',
      key: 'modelTag',
      width: 120,
    },
    {
      title: '总投票数',
      dataIndex: 'totalVotes',
      key: 'totalVotes',
      width: 100,
      sorter: (a: ContentInfo, b: ContentInfo) => a.totalVotes - b.totalVotes,
    },
    {
      title: '正确率',
      dataIndex: 'accuracy',
      key: 'accuracy',
      width: 100,
      render: (accuracy: number) => `${(accuracy * 100).toFixed(1)}%`,
      sorter: (a: ContentInfo, b: ContentInfo) => a.accuracy - b.accuracy,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a: ContentInfo, b: ContentInfo) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: ContentInfo) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/content/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/content/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条内容吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">内容管理</h1>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出数据
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/content/create')}>
            创建内容
          </Button>
        </Space>
      </div>

      <Space className="mb-4" wrap>
        <Select
          placeholder="选择类型"
          style={{ width: 120 }}
          allowClear
          value={filters.type || undefined}
          onChange={(value) => setFilters({ ...filters, type: value || '' })}
        >
          <Option value="text">文本</Option>
          <Option value="image">图片</Option>
          <Option value="video">视频</Option>
        </Select>
        <Select
          placeholder="选择来源"
          style={{ width: 120 }}
          allowClear
          value={filters.isAi}
          onChange={(value) => setFilters({ ...filters, isAi: value })}
        >
          <Option value={true}>AI</Option>
          <Option value={false}>人类</Option>
        </Select>
        <Search
          placeholder="搜索标题或ID"
          style={{ width: 300 }}
          onSearch={(value) => setFilters({ ...filters, search: value })}
          allowClear
        />
      </Space>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          onChange: setPage,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
}
