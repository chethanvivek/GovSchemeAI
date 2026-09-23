const { z } = require('zod');

const VALID_STATUSES = [
  'Saved',
  'Planning to Apply',
  'Documents Ready',
  'Applied',
  'Completed'
];

const addTrackerSchema = z.object({
  scheme_id: z.string().min(1, { message: 'Scheme ID is required' }),
  status: z.enum(VALID_STATUSES).optional().default('Saved'),
  notes: z.string().max(1000).optional().default('')
});

const updateTrackerSchema = z.object({
  status: z.enum(VALID_STATUSES, { message: 'Invalid application status' }),
  notes: z.string().max(1000).optional()
});

module.exports = {
  addTrackerSchema,
  updateTrackerSchema,
  VALID_STATUSES
};
