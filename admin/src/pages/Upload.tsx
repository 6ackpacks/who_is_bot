import { useState } from 'react';
import { Card, Upload, Button, message, Progress, Image } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import { uploadApi } from '../api/upload';

const { Dragger } = Upload;

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string; name: string; type: string }>>([]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await uploadApi.uploadFile(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setUploadedFiles((prev) => [
        ...prev,
        {
          url: response.url,
          name: file.name,
          type: response.contentType,
        },
      ]);

      message.success('上传成功');

      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 1000);

      return false;
    } catch (error) {
      message.error('上传失败');
      setUploading(false);
      setUploadProgress(0);
      return false;
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success('URL已复制到剪贴板');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">资源上传</h1>

      <Card title="上传文件" className="mb-4">
        <Dragger
          name="file"
          multiple={false}
          beforeUpload={handleUpload}
          showUploadList={false}
          disabled={uploading}
          accept="image/*,video/*"
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持图片（JPG、PNG、GIF、WebP，最大5MB）和视频（MP4、MOV，最大100MB）
          </p>
        </Dragger>

        {uploading && (
          <div className="mt-4">
            <Progress percent={uploadProgress} status={uploadProgress === 100 ? 'success' : 'active'} />
          </div>
        )}
      </Card>

      {uploadedFiles.length > 0 && (
        <Card title="已上传文件">
          <div className="space-y-4">
            {uploadedFiles.map((file, index) => (
              <Card key={index} size="small" className="mb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {file.type.startsWith('image/') ? (
                      <Image src={file.url} alt={file.name} width={80} height={80} style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded">
                        <span className="text-gray-500">视频</span>
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-gray-500">{file.url}</div>
                    </div>
                  </div>
                  <Button type="primary" onClick={() => copyToClipboard(file.url)}>
                    复制URL
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
