import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Spin, Image, Table, Space } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { contentApi } from '../../api/content';
import { ContentInfo, CommentInfo } from '../../types';

export default function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentInfo | null>(null);
  const [comments, setComments] = useState<CommentInfo[]>([]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await contentApi.getById(id!);
      setContent(response.content);
      setComments(response.comments);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!content) {
    return <div>内容不存在</div>;
  }

  const commentColumns = [
    {
      title: '用户',
      dataIndex: ['user', 'nickname'],
      key: 'user',
      render: (nickname: string, record: CommentInfo) => nickname || `游客 ${record.guestId}`,
    },
    {
      title: '评论内容',
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
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: CommentInfo) => (
        <Button type="link" size="small" onClick={() => navigate(`/comments/${record.id}`)}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/content')}>
            返回
          </Button>
          <h1 className="text-2xl font-bold">内容详情</h1>
        </Space>
        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/content/${id}/edit`)}>
          编辑
        </Button>
      </div>

      <Card title="基本信息" className="mb-4">
        <Descriptions column={2}>
          <Descriptions.Item label="ID">{content.id}</Descriptions.Item>
          <Descriptions.Item label="类型">
            <Tag color={content.type === 'text' ? 'blue' : content.type === 'image' ? 'green' : 'purple'}>
              {content.type === 'text' ? '文本' : content.type === 'image' ? '图片' : '视频'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="标题">{content.title}</Descriptions.Item>
          <Descriptions.Item label="来源">
            <Tag color={content.isAi ? 'orange' : 'cyan'}>{content.isAi ? 'AI' : '人类'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="模型标签">{content.modelTag}</Descriptions.Item>
          <Descriptions.Item label="提供者">{content.provider}</Descriptions.Item>
          <Descriptions.Item label="欺骗率">{content.deceptionRate}%</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dayjs(content.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="内容预览" className="mb-4">
        {content.type === 'text' && <div className="whitespace-pre-wrap">{content.text}</div>}
        {content.type === 'image' && content.url && <Image src={content.url} alt={content.title} style={{ maxWidth: '100%' }} />}
        {content.type === 'video' && content.url && (
          <video src={content.url} controls style={{ maxWidth: '100%' }} />
        )}
      </Card>

      <Card title="统计数据" className="mb-4">
        <Descriptions column={3}>
          <Descriptions.Item label="总投票数">{content.totalVotes}</Descriptions.Item>
          <Descriptions.Item label="AI 投票数">{content.aiVotes}</Descriptions.Item>
          <Descriptions.Item label="人类投票数">{content.humanVotes}</Descriptions.Item>
          <Descriptions.Item label="正确投票数">{content.correctVotes}</Descriptions.Item>
          <Descriptions.Item label="正确率">{(content.accuracy * 100).toFixed(1)}%</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="解释说明" className="mb-4">
        <div className="whitespace-pre-wrap">{content.explanation}</div>
      </Card>

      <Card title="关联评论">
        <Table
          columns={commentColumns}
          dataSource={comments}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
}
