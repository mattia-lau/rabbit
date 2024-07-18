import { parse } from "node:querystring";

export const bodyParser = async (req: Request) => {
  const contentType = req.headers.get("content-type");

  if (contentType === "application/json") return req.json();
  if (contentType === "application/graphql") return req.text();
  if (contentType === "application/x-www-form-urlencoded")
    return parse(await req.text());
  if (contentType?.startsWith("multipart/form-data")) return req.formData();

  return req.text();
};
