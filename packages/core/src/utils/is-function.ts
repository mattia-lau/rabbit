export const IsFunction = (argument: any): argument is Function => {
  return typeof argument === "function";
};
