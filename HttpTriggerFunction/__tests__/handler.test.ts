/* tslint:disable: no-any */

import { httpHandler } from "../handler";

describe("HttpCtrl", () => {
  it("should return a string when the query parameter is provided", async () => {
    const response = await httpHandler()({} as any, {} as any, "param");
    expect(response.kind).toBe("IResponseSuccessJson");
  });
});
