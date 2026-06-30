import { NextRequest } from "next/server";
import { validateToken } from "@/server/services/auth";

export const isAuthorized = (request: NextRequest): boolean => {
  const authorization = request.headers.get("authorization");
  if (!authorization) return false;

  const token = authorization.split(" ")[1];
  if (!token) return false;

  return validateToken(token);
};
