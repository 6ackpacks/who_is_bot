import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Spin, Space, Table, Popconfirm, message } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { commentApi } from '../../api/comment';
import { CommentInfo } from '../../types';

export default function CommentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState<CommentInfo | null>(null);
  const [replies, setReplies] = useState<CommentInfo[]>([]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await commentApi.getById(id!);
      setComment(response.comment);
      setReplies(response.replies);
    } catch (error) {
      console.error('Failed to load comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await commentApi.delete(id!, true);
      message.success('删除成功');
      navigate('/comments');
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!comment) {
    return <div>评论不存在</div>;
  }

  const replyColumns = [
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
      title: '回复内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '点赞数',
      dataIndex: 'likes',
      key: 'likes',
      width: 100,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/comments')}>
            返回
          </Button>
          <h1 className="text-2xl font-bold">评论详情</h1>
        </Space>
        <Popconfirm
          title="确定要删除这条评论吗？"
          description="删除后将同时删除所有回复"
          onConfirm={handleDelete}
          okText="确定"
          cancelText="取消"
        >
          <Button type="primary" danger icon={<DeleteOutlined />}>
            删除评论
          </Button>
        </Popconfirm>
      </div>

      <Card title="评论信息" className="mb-4">
        <Descriptions column={2}>
          <Descriptions.Item label="ID">{comment.id}</Descriptions.Item>
          <Descriptions.Item label="用户">
            {comment.user ? comment.user.nickname : `游客 ${comment.guestId}`}
          </Descriptions.Item>
          <Descriptions.Item label="关联内容" span={2}>
            {comment.contentTitle || comment.contentId}
          </Descriptions.Item>
          <Descriptions.Item label="点赞数">{comment.likes}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          {comment.updatedAt && (
            <Descriptions.Item label="更新时间" span={2}>
              {dayjs(comment.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="评论内容" className="mb-4">
        <div className="whitespace-pre-wrap">{comment.content}</div>
      </Card>

      {comment.parentId && (
        <Card title="父评论" className="mb-4">
          <div className="text-gray-500">这是一条回复评论，父评论ID: {comment.parentId}</div>
        </Card>
      )}

      {replies.length > 0 && (
        <Card title={`回复列表 (${replies.length})`}>
          <Table
            columns={replyColumns}
            dataSource={replies}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
}
