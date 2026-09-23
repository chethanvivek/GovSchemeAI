const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().trim().email({ message: 'A valid email address is required' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[0-9]|[^A-Za-z0-9]/, { message: 'Password must contain at least one number or special character' })
});

const loginSchema = z.object({
  email: z.string().trim().email({ message: 'A valid email address is required' }),
  password: z.string().min(1, { message: 'Password is required' })
});

module.exports = {
  registerSchema,
  loginSchema
};
