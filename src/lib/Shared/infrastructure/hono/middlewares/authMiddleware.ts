import { env } from "@/lib/Shared/infrastructure/config/env";
import type { MiddlewareHandler } from "hono";

import * as HttpStatusCodes from "@/lib/Shared/common/HttpStatusCodes";
import * as HttpStatusPhrases from "@/lib/Shared/common/HttpStatusPhrases";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const apiKey =  "key";//c.req.header("x-api-key");

  if (!apiKey || apiKey !== env?.API_KEY) {
    return c.json(
      { message: HttpStatusPhrases.UNAUTHORIZED },
      HttpStatusCodes.UNAUTHORIZED,
    );
  }

  await next();
};
