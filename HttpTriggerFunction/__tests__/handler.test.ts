/* tslint:disable: no-any */

import { HttpHandler } from "../handler";

describe("HttpCtrl", () => {
  it("should return a string when the query parameter is provided", async () => {
    const httpHandler = HttpHandler();
    const response = await httpHandler({} as any, "param");
    expect(response.kind).toBe("IResponseSuccessJson");
  });
});
