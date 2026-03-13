import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Tag, Button, Spin, Image, Table, Space,
  Radio, InputNumber, Form, message, Divider, Tooltip,
} from 'antd';
import { EditOutlined, ArrowLeftOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { contentApi } from '../../api/content';
import { ContentInfo, CommentInfo } from '../../types';

export default function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentInfo | null>(null);
  const [comments, setComments] = useState<CommentInfo[]>([]);

  // Stats source form state
  const [statsForm] = Form.useForm();
  const [statsSource, setStatsSource] = useState<'manual' | 'real'>('real');
  const [statsLoading, setStatsLoading] = useState(false);
  // Local state mirrors for the save payload
  const [localManualAiPercent, setLocalManualAiPercent] = useState<number | null>(null);
  const [localManualHumanPercent, setLocalManualHumanPercent] = useState<number | null>(null);

  // Participant count override state
  const [localManualTotalVotes, setLocalManualTotalVotes] = useState<number | null>(null);
  const [totalVotesLoading, setTotalVotesLoading] = useState(false);

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

      // Populate stats form from loaded content
      const c = response.content;
      const source = c.statsSource ?? 'real';
      setStatsSource(source);
      const aiPct = c.manualAiPercent ?? null;
      const humanPct = c.manualHumanPercent ?? null;
      setLocalManualAiPercent(aiPct);
      setLocalManualHumanPercent(humanPct);
      setLocalManualTotalVotes(c.manualTotalVotes ?? null);
      statsForm.setFieldsValue({
        statsSource: source,
        manualAiPercent: aiPct ?? undefined,
        manualHumanPercent: humanPct ?? undefined,
      });
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatsSourceSave = async () => {
    try {
      const values = await statsForm.validateFields();
      setStatsLoading(true);

      const localStatsSource = values.statsSource as 'manual' | 'real';
      const updated = await contentApi.updateStats(id!, {
        statsSource: localStatsSource,
        manualAiPercent: localManualAiPercent,
        manualHumanPercent: localManualHumanPercent,
      });
      // updateStats returns the content object directly
      setContent(prev => prev ? { ...prev, ...updated } : prev);
      setStatsSource(localStatsSource);
      message.success('数据来源已更新');
    } catch (error: any) {
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (!error?.errorFields) {
        message.error('保存失败，请重试');
      }
    } finally {
      setStatsLoading(false);
    }
  };

  const handleTotalVotesSave = async () => {
    setTotalVotesLoading(true);
    try {
      const updated = await contentApi.updateStats(id!, {
        manualTotalVotes: localManualTotalVotes,
      });
      setContent(prev => prev ? { ...prev, ...updated } : prev);
      message.success('参与人数已更新');
    } catch (error: any) {
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('保存失败，请重试');
      }
    } finally {
      setTotalVotesLoading(false);
    }
  };

  const handleTotalVotesClear = async () => {
    setTotalVotesLoading(true);
    try {
      const updated = await contentApi.updateStats(id!, {
        manualTotalVotes: null,
      });
      setContent(prev => prev ? { ...prev, ...updated } : prev);
      setLocalManualTotalVotes(null);
      message.success('已清除，将显示真实参与人数');
    } catch (error: any) {
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('清除失败，请重试');
      }
    } finally {
      setTotalVotesLoading(false);
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

  const realAiPct = content.totalVotes > 0
    ? Math.round((content.aiVotes / content.totalVotes) * 100)
    : 50;
  const realHumanPct = content.totalVotes > 0
    ? Math.round((content.humanVotes / content.totalVotes) * 100)
    : 50;

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

        <Divider orientation="left">
          全网判断展示来源
          <Tooltip title="控制小程序「全网判断」统计条显示的数据来源：真实数据来自实际投票，预设数据由管理员手动指定">
            <InfoCircleOutlined style={{ marginLeft: 6, color: '#8c8c8c', cursor: 'help' }} />
          </Tooltip>
        </Divider>

        <Form form={statsForm} layout="inline" style={{ rowGap: 12 }}>
          <Form.Item name="statsSource" label="数据来源">
            <Radio.Group
              onChange={(e) => setStatsSource(e.target.value)}
            >
              <Radio value="real">真实数据</Radio>
              <Radio value="manual">预设数据</Radio>
            </Radio.Group>
          </Form.Item>

          {statsSource === 'real' && (
            <div style={{ width: '100%', marginTop: 8, color: '#595959' }}>
              当前真实数据：AI 判定 <strong>{realAiPct}%</strong>，真人判定 <strong>{realHumanPct}%</strong>
              （基于 {content.totalVotes} 票）
            </div>
          )}

          {statsSource === 'manual' && (
            <div style={{ width: '100%', marginTop: 8 }}>
              <Space wrap align="start">
                <Form.Item
                  name="manualAiPercent"
                  label="AI 判定 %"
                  rules={[
                    { required: true, message: '请输入 AI 占比' },
                    { type: 'number', min: 0, max: 100, message: '范围 0–100' },
                  ]}
                >
                  <InputNumber
                    min={0} max={100} precision={1} style={{ width: 120 }} addonAfter="%"
                    onChange={(val) => setLocalManualAiPercent(val as number | null)}
                  />
                </Form.Item>
                <Form.Item
                  name="manualHumanPercent"
                  label="真人判定 %"
                  rules={[
                    { required: true, message: '请输入真人占比' },
                    { type: 'number', min: 0, max: 100, message: '范围 0–100' },
                  ]}
                >
                  <InputNumber
                    min={0} max={100} precision={1} style={{ width: 120 }} addonAfter="%"
                    onChange={(val) => setLocalManualHumanPercent(val as number | null)}
                  />
                </Form.Item>
              </Space>
              <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: -8 }}>两者之和应为 100</div>
            </div>
          )}

          <div style={{ width: '100%', marginTop: 12 }}>
            <Space>
              <Button type="primary" loading={statsLoading} onClick={handleStatsSourceSave}>
                保存来源设置
              </Button>
              <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                当前展示：AI {content.displayAiPercent ?? realAiPct}% / 真人 {content.displayHumanPercent ?? realHumanPct}%
                {content.statsSource === 'manual' && <Tag color="orange" style={{ marginLeft: 6 }}>预设</Tag>}
                {content.statsSource === 'real' && <Tag color="green" style={{ marginLeft: 6 }}>真实</Tag>}
              </span>
            </Space>
          </div>
        </Form>

        <Divider orientation="left">
          参与人数设置
          <Tooltip title="设置后小程序显示的参与人数将使用此值，留空则显示真实投票人数">
            <InfoCircleOutlined style={{ marginLeft: 6, color: '#8c8c8c', cursor: 'help' }} />
          </Tooltip>
        </Divider>

        <Space wrap align="center" style={{ marginBottom: 8 }}>
          <InputNumber
            min={0}
            step={1}
            precision={0}
            value={localManualTotalVotes ?? undefined}
            placeholder="留空显示真实人数"
            style={{ width: 180 }}
            addonAfter="人"
            onChange={(val) => setLocalManualTotalVotes(val as number | null)}
          />
          <Button type="primary" loading={totalVotesLoading} onClick={handleTotalVotesSave}>
            保存参与人数
          </Button>
          <Button loading={totalVotesLoading} onClick={handleTotalVotesClear}>
            清除（显示真实）
          </Button>
        </Space>
        <div style={{ color: '#8c8c8c', fontSize: 12 }}>
          提示：留空则显示真实参与人数（当前真实：{content.totalVotes} 人）
          {content.displayTotalVotes !== undefined && (
            <span style={{ marginLeft: 8 }}>· 当前展示：{content.displayTotalVotes} 人</span>
          )}
        </div>
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
