import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, InputNumber, Button, Card, message, Upload, Spin } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { contentApi } from '../../api/content';
import { uploadApi } from '../../api/upload';
import { ContentInfo } from '../../types';

const { Option } = Select;
const { TextArea } = Input;

export default function ContentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [contentType, setContentType] = useState<'text' | 'image' | 'video'>('text');
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const response = await contentApi.getById(id!);
      const content = response.content;
      setContentType(content.type);
      setFileUrl(content.url || '');
      form.setFieldsValue({
        type: content.type,
        title: content.title,
        text: content.text,
        url: content.url,
        isAi: content.isAi,
        provider: content.provider,
        deceptionRate: content.deceptionRate,
        explanation: content.explanation,
      });
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await uploadApi.uploadFile(formData);
      setFileUrl(response.url);
      form.setFieldsValue({ url: response.url });
      message.success('上传成功');
      return false;
    } catch (error) {
      message.error('上传失败');
      return false;
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const data: any = {
        type: contentType,
        title: values.title,
        isAi: values.isAi,
        provider: values.provider,
        deceptionRate: values.deceptionRate,
        explanation: values.explanation,
      };

      if (contentType === 'text') {
        data.text = values.text;
      } else {
        data.url = fileUrl || values.url;
      }

      await contentApi.update(id!, data);
      message.success('更新成功');
      navigate(`/content/${id}`);
    } catch (error) {
      console.error('Failed to update content:', error);
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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/content/${id}`)} style={{ marginRight: 16 }}>
          返回
        </Button>
        <h1 className="text-2xl font-bold">编辑内容</h1>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="内容类型"
            name="type"
            rules={[{ required: true, message: '请选择内容类型' }]}
          >
            <Select onChange={(value) => setContentType(value)}>
              <Option value="text">文本</Option>
              <Option value="image">图片</Option>
              <Option value="video">视频</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="标题"
            name="title"
            rules={[
              { required: true, message: '请输入标题' },
              { max: 100, message: '标题不能超过100个字符' },
            ]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>

          {contentType === 'text' ? (
            <Form.Item
              label="文本内容"
              name="text"
              rules={[{ required: true, message: '请输入文本内容' }]}
            >
              <TextArea rows={6} placeholder="请输入文本内容" />
            </Form.Item>
          ) : (
            <>
              <Form.Item
                label={contentType === 'image' ? '图片URL' : '视频URL'}
                name="url"
                rules={[{ required: !fileUrl, message: `请上传${contentType === 'image' ? '图片' : '视频'}` }]}
              >
                <Input placeholder="或直接输入URL" />
              </Form.Item>
              <Form.Item>
                <Upload
                  beforeUpload={handleUpload}
                  showUploadList={false}
                  accept={contentType === 'image' ? 'image/*' : 'video/*'}
                >
                  <Button icon={<UploadOutlined />}>重新上传</Button>
                </Upload>
                {fileUrl && <div className="mt-2 text-green-600">当前文件: {fileUrl}</div>}
              </Form.Item>
            </>
          )}

          <Form.Item
            label="来源"
            name="isAi"
            rules={[{ required: true, message: '请选择来源' }]}
          >
            <Select>
              <Option value={true}>AI</Option>
              <Option value={false}>人类</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="创作来源"
            name="provider"
            rules={[{ required: true, message: '请输入创作来源' }]}
          >
            <Input placeholder="如: Midjourney、Stable Diffusion、真实摄影" />
          </Form.Item>

          <Form.Item
            label="欺骗率"
            name="deceptionRate"
            rules={[
              { required: true, message: '请输入欺骗率' },
              { type: 'number', min: 0, max: 100, message: '欺骗率必须在0-100之间' },
            ]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="解释说明"
            name="explanation"
            rules={[{ required: true, message: '请输入解释说明' }]}
          >
            <TextArea rows={4} placeholder="请输入解释说明" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
              保存
            </Button>
            <Button onClick={() => navigate(`/content/${id}`)}>取消</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
