const { z } = require('zod');

// Schema for each individual recommendation item produced by Gemini
const recommendationItemSchema = z.object({
  scheme_id: z.string(),
  match_score: z.number().int().min(0).max(100),
  explanation: z.string(),
  matched_criteria: z.array(z.string()).default([]),
  unmet_criteria: z.array(z.string()).default([]),
  missing_info_needed: z.array(z.string()).default([]),
  document_checklist: z.array(z.string()).default([])
});

// Schema for the full list of recommendations
const recommendationsArraySchema = z.array(recommendationItemSchema);

// Schema for AI Chat input
const aiChatInputSchema = z.object({
  message: z.string().trim().min(1, { message: 'Message cannot be empty' }).max(2000),
  scheme_id: z.string().optional()
});

module.exports = {
  recommendationItemSchema,
  recommendationsArraySchema,
  aiChatInputSchema
};
