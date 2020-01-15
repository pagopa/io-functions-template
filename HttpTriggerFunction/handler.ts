import * as express from "express";
import * as t from "io-ts";

import { Context } from "@azure/functions";
import { ContextMiddleware } from "io-functions-commons/dist/src/utils/middlewares/context_middleware";
import { RequiredParamMiddleware } from "io-functions-commons/dist/src/utils/middlewares/required_param";
import {
  withRequestMiddlewares,
  wrapRequestHandler
} from "io-functions-commons/dist/src/utils/request_middleware";
import {
  IResponseErrorNotFound,
  IResponseSuccessJson,
  ResponseSuccessJson
} from "italia-ts-commons/lib/responses";

type IHttpHandler = (
  context: Context,
  param: string
) => Promise<
  | IResponseSuccessJson<{
      message: string;
    }>
  | IResponseErrorNotFound
>;

export function HttpHandler(): IHttpHandler {
  return async (_, param: string) => {
    return ResponseSuccessJson({ message: `Hello ${param} !` });
  };
}

export function HttpCtrl(): express.RequestHandler {
  const handler = HttpHandler();

  const middlewaresWrap = withRequestMiddlewares(
    ContextMiddleware(),
    RequiredParamMiddleware("someParam", t.string)
  );

  return wrapRequestHandler(middlewaresWrap(handler));
}
