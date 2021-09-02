import * as express from "express";
import { wrapRequestHandler } from "@pagopa/io-functions-commons/dist/src/utils/request_middleware";
import {
  checkApplicationHealth,
  checkAzureCosmosDbHealth,
  checkAzureStorageHealth,
  HealthCheck,
  ProblemSource
} from "@pagopa/io-functions-commons/dist/src/utils/healthcheck";
import {
  IResponseErrorInternal,
  IResponseSuccessJson,
  ResponseErrorInternal,
  ResponseSuccessJson
} from "@pagopa/ts-commons/lib/responses";
import * as packageJson from "../package.json";

import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";

import { envConfig, IConfig } from "../utils/config";

interface IInfo {
  readonly name: string;
  readonly version: string;
}

type InfoHandler = () => Promise<
  IResponseSuccessJson<IInfo> | IResponseErrorInternal
>;

export const InfoHandler = (
  checkApplicationHealth: (
    config: unknown
  ) => HealthCheck<ProblemSource, true>
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
    checkApplicationHealth(IConfig, [
      c => checkAzureCosmosDbHealth(c.COSMOSDB_URI, c.COSMOSDB_KEY),
      c => checkAzureStorageHealth(c.QueueStorageConnection)
    ])
  );

  return wrapRequestHandler(handler);
};
