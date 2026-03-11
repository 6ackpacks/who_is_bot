import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Card, message, Spin, Space, Upload, Avatar } from 'antd';
import { ArrowLeftOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { userApi } from '../../api/user';
import { uploadApi } from '../../api/upload';
import { UserInfo } from '../../types';

export default function UserEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const response = await userApi.getById(id!);
      const user = response.user;
      setAvatarUrl(user.avatar || '');
      form.setFieldsValue({
        nickname: user.nickname,
        level: user.level,
        totalJudged: user.totalJudged,
        correctCount: user.correctCount,
        accuracy: user.accuracy * 100,
        streak: user.streak,
        maxStreak: user.maxStreak,
        totalBotsBusted: user.totalBotsBusted,
      });
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadApi.uploadFile(formData);
      setAvatarUrl(response.url);
      message.success('上传成功');
      return false;
    } catch (error) {
      message.error('上传失败');
      return false;
    }
  };

  const handleRecalculate = async () => {
    try {
      const response = await userApi.recalculate(id!);
      message.success('重新计算成功');
      const user = response.user;
      form.setFieldsValue({
        totalJudged: user.totalJudged,
        correctCount: user.correctCount,
        accuracy: user.accuracy * 100,
        streak: user.streak,
        maxStreak: user.maxStreak,
        totalBotsBusted: user.totalBotsBusted,
      });
    } catch (error) {
      console.error('Failed to recalculate:', error);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const data: any = {
        nickname: values.nickname,
        avatar: avatarUrl,
        level: values.level,
        totalJudged: values.totalJudged,
        correctCount: values.correctCount,
        accuracy: values.accuracy / 100,
        streak: values.streak,
        maxStreak: values.maxStreak,
        totalBotsBusted: values.totalBotsBusted,
      };

      await userApi.update(id!, data);
      message.success('更新成功');
      navigate(`/users/${id}`);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/users/${id}`)} style={{ marginRight: 16 }}>
          返回
        </Button>
        <h1 className="text-2xl font-bold">编辑用户</h1>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item label="头像">
            <Space direction="vertical" align="center">
              <Avatar size={80} src={avatarUrl} icon={<UserOutlined />} />
              <Upload
                beforeUpload={handleUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>上传头像</Button>
              </Upload>
            </Space>
          </Form.Item>

          <Form.Item
            label="昵称"
            name="nickname"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item
            label="等级"
            name="level"
            rules={[
              { required: true, message: '请输入等级' },
              { type: 'number', min: 1, max: 100, message: '等级必须在1-100之间' },
            ]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="总判定次数"
            name="totalJudged"
            rules={[{ required: true, message: '请输入总判定次数' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="正确次数"
            name="correctCount"
            rules={[{ required: true, message: '请输入正确次数' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="准确率 (%)"
            name="accuracy"
            rules={[
              { required: true, message: '请输入准确率' },
              { type: 'number', min: 0, max: 100, message: '准确率必须在0-100之间' },
            ]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="当前连胜"
            name="streak"
            rules={[{ required: true, message: '请输入当前连胜' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="最大连胜"
            name="maxStreak"
            rules={[{ required: true, message: '请输入最大连胜' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="识破AI次数"
            name="totalBotsBusted"
            rules={[{ required: true, message: '请输入识破AI次数' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存
              </Button>
              <Button onClick={() => navigate(`/users/${id}`)}>取消</Button>
              <Button onClick={handleRecalculate}>重新计算统计</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
