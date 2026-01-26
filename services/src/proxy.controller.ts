import { Controller, Get, Query, Res, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import * as https from 'https';
import * as http from 'http';

@Controller('proxy')
export class ProxyController {
  @Get('video')
  async proxyVideo(@Query('url') url: string, @Res() res: Response) {
    if (!url) {
      throw new HttpException('URL parameter is required', HttpStatus.BAD_REQUEST);
    }

    // Validate URL to prevent SSRF attacks
    try {
      const parsedUrl = new URL(url);

      // Only allow specific domains (OSS domains)
      const allowedDomains = [
        'who-is-the-bot-assets.oss-cn-hangzhou.aliyuncs.com',
        'aliyuncs.com',
        // Add other trusted domains here
      ];

      const isAllowed = allowedDomains.some(domain =>
        parsedUrl.hostname.endsWith(domain)
      );

      if (!isAllowed) {
        throw new HttpException('Domain not allowed', HttpStatus.FORBIDDEN);
      }

      // Choose http or https based on protocol
      const client = parsedUrl.protocol === 'https:' ? https : http;

      // Make request to the original URL
      client.get(url, (proxyRes) => {
        // Set appropriate headers for video streaming
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'video/mp4');
        res.setHeader('Accept-Ranges', 'bytes');

        // Remove the problematic x-oss-force-download header
        // and set proper content-disposition for inline viewing
        res.setHeader('Content-Disposition', 'inline');

        if (proxyRes.headers['content-length']) {
          res.setHeader('Content-Length', proxyRes.headers['content-length']);
        }

        // Enable CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Range');

        // Pipe the video stream to response
        proxyRes.pipe(res);
      }).on('error', (err) => {
        console.error('Proxy error:', err);
        throw new HttpException('Failed to fetch video', HttpStatus.INTERNAL_SERVER_ERROR);
      });

    } catch (error) {
      console.error('URL parsing error:', error);
      throw new HttpException('Invalid URL', HttpStatus.BAD_REQUEST);
    }
  }
}
