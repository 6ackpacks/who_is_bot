import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Spin, Avatar, Space, Table } from 'antd';
import { EditOutlined, ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { userApi } from '../../api/user';
import { UserInfo } from '../../types';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [recentJudgments, setRecentJudgments] = useState<any[]>([]);
  const [recentComments, setRecentComments] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await userApi.getById(id!);
      setUser(response.user);
      setAchievements(response.achievements || []);
      setRecentJudgments(response.recentJudgments || []);
      setRecentComments(response.recentComments || []);
    } catch (error) {
      console.error('Failed to load user:', error);
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

  if (!user) {
    return <div>用户不存在</div>;
  }

  const judgmentColumns = [
    {
      title: '内容标题',
      dataIndex: ['content', 'title'],
      key: 'content',
      ellipsis: true,
    },
    {
      title: '判定结果',
      dataIndex: 'isCorrect',
      key: 'isCorrect',
      width: 100,
      render: (isCorrect: boolean) => (
        <Tag color={isCorrect ? 'green' : 'red'}>{isCorrect ? '正确' : '错误'}</Tag>
      ),
    },
    {
      title: '判定时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const commentColumns = [
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
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/users')}>
            返回
          </Button>
          <h1 className="text-2xl font-bold">用户详情</h1>
        </Space>
        <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/users/${id}/edit`)}>
          编辑
        </Button>
      </div>

      <Card title="基本信息" className="mb-4">
        <div className="flex items-start">
          <Avatar size={80} src={user.avatar} icon={<UserOutlined />} style={{ marginRight: 24 }} />
          <Descriptions column={2} style={{ flex: 1 }}>
            <Descriptions.Item label="昵称">{user.nickname}</Descriptions.Item>
            <Descriptions.Item label="UID">{user.uid}</Descriptions.Item>
            <Descriptions.Item label="OpenID">{user.openid || '-'}</Descriptions.Item>
            <Descriptions.Item label="等级">
              <Tag color="blue">Lv.{user.level}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="注册时间">
              {dayjs(user.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Card>

      <Card title="统计数据" className="mb-4">
        <Descriptions column={3}>
          <Descriptions.Item label="总判定次数">{user.totalJudged}</Descriptions.Item>
          <Descriptions.Item label="正确次数">{user.correctCount}</Descriptions.Item>
          <Descriptions.Item label="准确率">{(user.accuracy * 100).toFixed(1)}%</Descriptions.Item>
          <Descriptions.Item label="当前连胜">{user.streak}</Descriptions.Item>
          <Descriptions.Item label="最大连胜">{user.maxStreak}</Descriptions.Item>
          <Descriptions.Item label="识破AI次数">{user.totalBotsBusted}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="周统计数据" className="mb-4">
        <Descriptions column={3}>
          <Descriptions.Item label="周判定次数">{user.weeklyJudged}</Descriptions.Item>
          <Descriptions.Item label="周正确次数">{user.weeklyCorrect}</Descriptions.Item>
          <Descriptions.Item label="周准确率">{(user.weeklyAccuracy * 100).toFixed(1)}%</Descriptions.Item>
        </Descriptions>
      </Card>

      {achievements.length > 0 && (
        <Card title="成就列表" className="mb-4">
          <Space wrap>
            {achievements.map((achievement: any) => (
              <Tag key={achievement.id} color="gold">
                {achievement.name}
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      <Card title="判定历史（最近20条）" className="mb-4">
        <Table
          columns={judgmentColumns}
          dataSource={recentJudgments}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Card title="评论历史（最近20条）">
        <Table
          columns={commentColumns}
          dataSource={recentComments}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
}
