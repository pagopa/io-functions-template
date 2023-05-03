/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an HTTP starter function.
 *
 * Before running this sample, please:
 * - create a Durable activity function (default name is "Hello")
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your
 *    function app in Kudu
 */

import {
  IOrchestrationFunctionContext,
  Task
} from "durable-functions/lib/src/classes";

import * as df from "durable-functions";
import * as t from "io-ts";

import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";

const orchestrator = df.orchestrator(function*(
  context: IOrchestrationFunctionContext
): IterableIterator<Task> {
  return [
    pipe(
      t.string.decode(
        yield context.df.callActivity("ActivityFunction", "Tokyo")
      ),
      E.getOrElse(() => "")
    ),
    pipe(
      t.string.decode(
        yield context.df.callActivity("ActivityFunction", "Seattle")
      ),
      E.getOrElse(() => "")
    ),
    pipe(
      t.string.decode(
        yield context.df.callActivity("ActivityFunction", "London")
      ),
      E.getOrElse(() => "")
    )
  ];
  // eslint-disable-next-line , @typescript-eslint/no-explicit-any
} as any);

export default orchestrator;
