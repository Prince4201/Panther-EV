export const validate = (schema) => (req, _res, next) => {
  req.body = schema.parse(req.body); // throws ZodError, handled in errorHandler
  next();
};
