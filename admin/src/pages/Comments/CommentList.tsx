import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Space, Popconfirm, message } from 'antd';
import { EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { commentApi } from '../../api/comment';
import { CommentInfo } from '../../types';

const { Search } = Input;

export default function CommentList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CommentInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({ contentId: '', userId: '', search: '' });

  useEffect(() => {
    loadData();
  }, [page, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await commentApi.getList({ page, limit, ...filters });
      setData(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await commentApi.delete(id, true);
      message.success('删除成功');
      loadData();
    } catch (error) {
      console.error('Failed to delete comment:', error);
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
      title: '用户',
      key: 'user',
      width: 150,
      render: (_: any, record: CommentInfo) => {
        if (record.user) {
          return record.user.nickname;
        }
        return `游客 ${record.guestId}`;
      },
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '关联内容',
      dataIndex: 'contentTitle',
      key: 'contentTitle',
      width: 200,
      ellipsis: true,
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      key: 'likes',
      width: 100,
      sorter: (a: CommentInfo, b: CommentInfo) => a.likes - b.likes,
    },
    {
      title: '回复数',
      dataIndex: 'replyCount',
      key: 'replyCount',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a: CommentInfo, b: CommentInfo) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: CommentInfo) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/comments/${record.id}`)}
          >
            查看
          </Button>
          <Popconfirm
            title="确定要删除这条评论吗？"
            description="删除后将同时删除所有回复"
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
        <h1 className="text-2xl font-bold">评论管理</h1>
      </div>

      <Space className="mb-4" wrap>
        <Input
          placeholder="内容ID"
          style={{ width: 200 }}
          value={filters.contentId}
          onChange={(e) => setFilters({ ...filters, contentId: e.target.value })}
          allowClear
        />
        <Input
          placeholder="用户ID"
          style={{ width: 200 }}
          value={filters.userId}
          onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
          allowClear
        />
        <Search
          placeholder="搜索评论内容"
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
