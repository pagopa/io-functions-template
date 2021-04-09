import { fromLeft, taskEither } from "fp-ts/lib/TaskEither";
import { HealthCheck, HealthProblem } from "../../utils/healthcheck";
import { infoHandler } from "../handler";

afterEach(() => {
  jest.clearAllMocks();
});

describe("infoHandler", () => {
  it("should return an internal error if the application is not healthy", async () => {
    const healthCheck: HealthCheck = fromLeft([
      "failure 1" as HealthProblem<"Config">,
      "failure 2" as HealthProblem<"Config">
    ]);
    const handler = infoHandler(healthCheck);

    const response = await handler();

    expect(response.kind).toBe("IResponseErrorInternal");
  });

  it("should return a success if the application is healthy", async () => {
    const healthCheck: HealthCheck = taskEither.of(true);
    const handler = infoHandler(healthCheck);

    const response = await handler();

    expect(response.kind).toBe("IResponseSuccessJson");
  });
});
