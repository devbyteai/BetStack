import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../errors/AppError.js';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export const validateRequest = (schemas: ValidationSchemas) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      if (schemas.query) {
        const validated = await schemas.query.parseAsync(req.query);
        Object.assign(req.query, validated);
      }

      if (schemas.params) {
        const validated = await schemas.params.parseAsync(req.params);
        Object.assign(req.params, validated);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        next(
          new BadRequestError(
            `Validation failed: ${formattedErrors.map((e) => e.message).join(', ')}`,
            'VALIDATION_ERROR'
          )
        );
      } else {
        next(error);
      }
    }
  };
};

// Convenience function for body-only validation
export const validateBody = (schema: ZodSchema) => {
  return validateRequest({ body: schema });
};

// Convenience function for query-only validation
export const validateQuery = (schema: ZodSchema) => {
  return validateRequest({ query: schema });
};

// Convenience function for params-only validation
export const validateParams = (schema: ZodSchema) => {
  return validateRequest({ params: schema });
};
