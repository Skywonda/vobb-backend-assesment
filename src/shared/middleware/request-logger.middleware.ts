import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.service';

export const requestLogger = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();

    const originalEnd = res.end;
    
    res.end = function(this: Response, chunk?: any, encoding?: BufferEncoding | (() => void), cb?: () => void) {
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

      //  const logInfo = {
      //   method: req.method,
      //   url: req.originalUrl || req.url,
      //   status: res.statusCode,
      //   duration: `${duration.toFixed(2)}ms`,
      //   userAgent: req.get('user-agent') || '-',
      //   ip: req.ip || req.socket.remoteAddress,
      //   contentLength: res.get('content-length') || 0,
      // };

      // logger.info(JSON.stringify(logInfo));
      
      const logMessage = `${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${duration.toFixed(2)}ms`;
      
      logger.info(logMessage);

      if (typeof encoding === 'function') {
        cb = encoding;
        encoding = undefined;
      }

      return originalEnd.call(this, chunk, encoding as BufferEncoding, cb);
    };

    next();
  };
}; 