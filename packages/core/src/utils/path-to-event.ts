export const pathToEvent = (path: string, method: string = "GET") => {
  return `${method.toUpperCase()}__${path}`;
};
