import { test, expect } from "bun:test";
import { normalizeApiUrl, DEFAULT_API_URL } from "../src/utils/apiUrl";

test("normalizeApiUrl menambah /api, membuang garis miring akhir, dan memakai bawaan bila kosong", () => {
  expect(normalizeApiUrl("https://be.vercel.app")).toBe("https://be.vercel.app/api");
  expect(normalizeApiUrl("https://be.vercel.app/")).toBe("https://be.vercel.app/api");
  expect(normalizeApiUrl("https://be.vercel.app/api/")).toBe("https://be.vercel.app/api");
  expect(normalizeApiUrl("  ")).toBe(DEFAULT_API_URL);
  expect(normalizeApiUrl(undefined)).toBe(DEFAULT_API_URL);
});
