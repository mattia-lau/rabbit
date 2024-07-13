export class NotFoundError extends Error {
  statusCode = 404;

  constructor() {
    super("Not Found");
  }
}
