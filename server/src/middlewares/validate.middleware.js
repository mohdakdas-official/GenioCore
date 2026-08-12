const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        return next(
            new ApiError(400, "Validation Failed", result.error.issues)
        )
    }

    req.body = result.data;

    next()
}

export default validate