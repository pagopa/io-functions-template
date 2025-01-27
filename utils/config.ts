/**
 * Config module
 *
 * Single point of access for the application confguration. Handles validation on required environment variables.
 * The configuration is evaluate eagerly at the first access to the module. The module exposes convenient methods to access such value.
 */

import * as t from "io-ts";

import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { CommaSeparatedListOf } from "@pagopa/ts-commons/lib/comma-separated-list";
import { IntegerFromString } from "@pagopa/ts-commons/lib/numbers";

export type AppInsightsConfig = t.TypeOf<typeof AppInsightsConfig>;
export const AppInsightsConfig = t.intersection([
  t.type({
    APPINSIGHTS_CLOUD_ROLE_NAME: NonEmptyString,
    APPLICATIONINSIGHTS_CONNECTION_STRING: NonEmptyString
  }),
  t.partial({
    APPINSIGHTS_DISABLE: NonEmptyString,
    APPINSIGHTS_EXCLUDED_DOMAINS: CommaSeparatedListOf(t.string).pipe(
      t.array(NonEmptyString)
    ),
    APPINSIGHTS_SAMPLING_PERCENTAGE: IntegerFromString
  })
]);
// global app configuration
export type IConfig = t.TypeOf<typeof IConfig>;
// eslint-disable-next-line @typescript-eslint/ban-types
export const IConfig = t.intersection([
  t.interface({
    AzureWebJobsStorage: NonEmptyString,

    COSMOSDB_KEY: NonEmptyString,
    COSMOSDB_NAME: NonEmptyString,
    COSMOSDB_URI: NonEmptyString,

    QueueStorageConnection: NonEmptyString,

    isProduction: t.boolean
  }),
  AppInsightsConfig
]);

export const envConfig = {
  ...process.env,
  isProduction: process.env.NODE_ENV === "production"
};

// No need to re-evaluate this object for each call
const errorOrConfig: t.Validation<IConfig> = IConfig.decode(envConfig);

/**
 * Read the application configuration and check for invalid values.
 * Configuration is eagerly evalued when the application starts.
 *
 * @returns either the configuration values or a list of validation errors
 */
export const getConfig = (): t.Validation<IConfig> => errorOrConfig;

/**
 * Read the application configuration and check for invalid values.
 * If the application is not valid, raises an exception.
 *
 * @returns the configuration values
 * @throws validation errors found while parsing the application configuration
 */
export const getConfigOrThrow = (): IConfig =>
  pipe(
    errorOrConfig,
    E.getOrElseW((errors: ReadonlyArray<t.ValidationError>) => {
      throw new Error(`Invalid configuration: ${readableReport(errors)}`);
    })
  );
