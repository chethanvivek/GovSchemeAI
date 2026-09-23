/**
 * Generic Zod schema validation middleware.
 * Validates req.body (or query/params) and returns structured 400 Bad Request error if validation fails.
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.parse(dataToValidate);
      req[source] = parsed; // Replace with sanitized/coerced data
      next();
    } catch (err) {
      if (err.errors) {
        const errorMessages = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return res.status(400).json({
          success: false,
          message: 'Validation failed for request data',
          errors: errorMessages
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Malformed request payload'
      });
    }
  };
}

module.exports = { validate };
