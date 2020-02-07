import * as express from "express";
import * as t from "io-ts";

import { Context } from "@azure/functions";
import { ServiceModel } from "io-functions-commons/dist/src/models/service";
import {
  AzureUserAttributesMiddleware,
  IAzureUserAttributes
} from "io-functions-commons/dist/src/utils/middlewares/azure_user_attributes";
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
  userAttrs: IAzureUserAttributes,
  param: string
) => Promise<
  | IResponseSuccessJson<{
      message: string;
    }>
  | IResponseErrorNotFound
>;

export function HttpHandler(): IHttpHandler {
  return async (ctx, userAttrs, param) => {
    return ResponseSuccessJson({
      headers: ctx.req?.headers,
      message: `Hello ${param} !`,
      user: userAttrs
    });
  };
}

export function HttpCtrl(serviceModel: ServiceModel): express.RequestHandler {
  const handler = HttpHandler();

  const middlewaresWrap = withRequestMiddlewares(
    ContextMiddleware(),
    AzureUserAttributesMiddleware(serviceModel),
    RequiredParamMiddleware("someParam", t.string)
  );

  return wrapRequestHandler(middlewaresWrap(handler));
}
