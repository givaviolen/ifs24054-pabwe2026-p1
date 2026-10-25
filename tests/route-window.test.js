// @vitest-environment happy-dom
import { test, expect } from "bun:test";
import { hashToPath, parsePath } from "../src/utils/route";

test("hashToPath & parsePath memakai window.location bila argumen tidak diberikan", () => {
  window.location.hash = "#/peta";
  expect(hashToPath()).toBe("/peta");
  window.history.pushState({}, "", "/daftar");
  expect(parsePath().name).toBe("list");
});