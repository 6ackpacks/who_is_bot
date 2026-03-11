import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Input, Select, Space, Tag, Avatar } from 'antd';
import { EyeOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { userApi } from '../../api/user';
import { UserInfo } from '../../types';

const { Search } = Input;
const { Option } = Select;

export default function UserList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({ level: undefined, search: '' });

  useEffect(() => {
    loadData();
  }, [page, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await userApi.getList({ page, limit, ...filters });
      setData(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (avatar: string) => (
        <Avatar src={avatar} icon={<UserOutlined />} />
      ),
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 150,
    },
    {
      title: 'UID',
      dataIndex: 'uid',
      key: 'uid',
      width: 120,
      ellipsis: true,
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: number) => <Tag color="blue">Lv.{level}</Tag>,
    },
    {
      title: '总判定次数',
      dataIndex: 'totalJudged',
      key: 'totalJudged',
      width: 120,
      sorter: (a: UserInfo, b: UserInfo) => a.totalJudged - b.totalJudged,
    },
    {
      title: '准确率',
      dataIndex: 'accuracy',
      key: 'accuracy',
      width: 100,
      render: (accuracy: number) => `${(accuracy * 100).toFixed(1)}%`,
      sorter: (a: UserInfo, b: UserInfo) => a.accuracy - b.accuracy,
    },
    {
      title: '连胜次数',
      dataIndex: 'streak',
      key: 'streak',
      width: 100,
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a: UserInfo, b: UserInfo) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: UserInfo) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/users/${record.id}`)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/users/${record.id}/edit`)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">用户管理</h1>
      </div>

      <Space className="mb-4" wrap>
        <Select
          placeholder="选择等级"
          style={{ width: 120 }}
          allowClear
          value={filters.level}
          onChange={(value) => setFilters({ ...filters, level: value })}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
            <Option key={level} value={level}>
              等级 {level}
            </Option>
          ))}
        </Select>
        <Search
          placeholder="搜索昵称、UID或OpenID"
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
