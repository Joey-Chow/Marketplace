/**
 * Standard API response utility
 */
class ApiResponse {
  constructor(statusCode, data, message = "Success", success = true) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success;
  }

  static success(res, data, message = "Success", statusCode = 200) {
    return res
      .status(statusCode)
      .json(new ApiResponse(statusCode, data, message));
  }

  static error(
    res,
    message = "Internal Server Error",
    statusCode = 500,
    data = null
  ) {
    return res
      .status(statusCode)
      .json(new ApiResponse(statusCode, data, message, false));
  }

  static created(res, data, message = "Created successfully") {
    return res.status(201).json(new ApiResponse(201, data, message));
  }

  static badRequest(res, message = "Bad Request", data = null) {
    return res.status(400).json(new ApiResponse(400, data, message, false));
  }

  static unauthorized(res, message = "Unauthorized") {
    return res.status(401).json(new ApiResponse(401, null, message, false));
  }

  static forbidden(res, message = "Forbidden") {
    return res.status(403).json(new ApiResponse(403, null, message, false));
  }

  static notFound(res, message = "Not Found") {
    return res.status(404).json(new ApiResponse(404, null, message, false));
  }

  static conflict(res, message = "Conflict") {
    return res.status(409).json(new ApiResponse(409, null, message, false));
  }

  static validationError(res, errors) {
    return res
      .status(422)
      .json(new ApiResponse(422, errors, "Validation Error", false));
  }
}

module.exports = ApiResponse;
