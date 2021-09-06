/* eslint-disable @typescript-eslint/explicit-function-return-type */

import * as express from "express";
import { wrapRequestHandler } from "@pagopa/io-functions-commons/dist/src/utils/request_middleware";
import * as healthcheck from "@pagopa/io-functions-commons/dist/src/utils/healthcheck";
import {
  IResponseErrorInternal,
  IResponseSuccessJson,
  ResponseErrorInternal,
  ResponseSuccessJson
} from "@pagopa/ts-commons/lib/responses";

import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as packageJson from "../package.json";

import { envConfig, IConfig } from "../utils/config";

interface IInfo {
  readonly name: string;
  readonly version: string;
}

type InfoHandler = () => Promise<
  IResponseSuccessJson<IInfo> | IResponseErrorInternal
>;

type HealthChecker = (
  config: unknown
) => healthcheck.HealthCheck<healthcheck.ProblemSource, true>;

export const InfoHandler = (
  checkApplicationHealth: HealthChecker
): InfoHandler => (): Promise<
  IResponseSuccessJson<IInfo> | IResponseErrorInternal
> =>
  pipe(
    envConfig,
    checkApplicationHealth,
    TE.map(_ =>
      ResponseSuccessJson({
        name: packageJson.name,
        version: packageJson.version
      })
    ),
    TE.mapLeft(problems => ResponseErrorInternal(problems.join("\n\n"))),
    TE.toUnion
  )();

export const Info = (): express.RequestHandler => {
  const handler = InfoHandler(
    healthcheck.checkApplicationHealth(IConfig, [
      c => healthcheck.checkAzureCosmosDbHealth(c.COSMOSDB_URI, c.COSMOSDB_KEY),
      c => healthcheck.checkAzureStorageHealth(c.QueueStorageConnection)
    ])
  );

  return wrapRequestHandler(handler);
};
