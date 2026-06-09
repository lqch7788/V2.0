/**
 * 请求验证中间件
 * 使用 Zod 验证 API 输入，防止恶意输入
 */

import { ZodError } from 'zod';

/**
 * 验证中间件工厂函数
 * @param schema Zod 验证 schema
 * @returns Express 中间件
 */
export function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.flatten(),
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * 查询参数验证中间件
 * @param schema Zod 验证 schema
 * @returns Express 中间件
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Query validation failed',
          details: error.flatten(),
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * URL 参数验证中间件
 * @param schema Zod 验证 schema
 * @returns Express 中间件
 */
export function validateParams(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Params validation failed',
          details: error.flatten(),
        });
      } else {
        next(error);
      }
    }
  };
}
