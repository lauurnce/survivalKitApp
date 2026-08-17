import { describe, it, expect } from "vitest";
import {
  REPORTS_ENV_FILE,
  parseEnvFile,
  readReportsCredentials,
} from "./reportsEnv";

describe("REPORTS_ENV_FILE", () => {
  it("names the reports-only credentials file, never .env.local", () => {
    expect(REPORTS_ENV_FILE).toBe(".env.reports.local");
  });
});

describe("parseEnvFile", () => {
  it("reads simple KEY=VALUE lines", () => {
    expect(parseEnvFile("A=1\nB=two\n")).toEqual({ A: "1", B: "two" });
  });

  it("ignores blank lines and comments", () => {
    expect(parseEnvFile("# note\n\nA=1\n  # indented\n")).toEqual({ A: "1" });
  });

  it("strips matching single or double quotes", () => {
    expect(parseEnvFile(`A="one"\nB='two'\n`)).toEqual({ A: "one", B: "two" });
  });

  it("keeps equals signs inside a value", () => {
    expect(parseEnvFile("JWT=abc=def=\n")).toEqual({ JWT: "abc=def=" });
  });

  it("trims surrounding whitespace from key and value", () => {
    expect(parseEnvFile("  A = 1 \n")).toEqual({ A: "1" });
  });

  it("drops a line with no equals sign", () => {
    expect(parseEnvFile("NOTANASSIGNMENT\nA=1\n")).toEqual({ A: "1" });
  });

  it("handles CRLF line endings", () => {
    expect(parseEnvFile("A=1\r\nB=2\r\n")).toEqual({ A: "1", B: "2" });
  });

  it("returns an empty object for empty contents", () => {
    expect(parseEnvFile("")).toEqual({});
  });
});

describe("readReportsCredentials", () => {
  const valid = {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  };

  it("returns both credentials", () => {
    expect(readReportsCredentials(valid)).toEqual({
      url: "https://example.supabase.co",
      serviceRoleKey: "service-role-key",
    });
  });

  it("names the missing variable and the file it belongs in", () => {
    // Built via the RegExp constructor rather than a /…/s literal: the "s"
    // (dotAll) flag needs ES2018, but tsconfig targets ES2017. The
    // constructor form has identical matching semantics and passes tsc.
    expect(() =>
      readReportsCredentials({ SUPABASE_SERVICE_ROLE_KEY: "k" })
    ).toThrow(new RegExp("NEXT_PUBLIC_SUPABASE_URL.*\\.env\\.reports\\.local", "s"));
  });

  it("rejects a missing service role key", () => {
    expect(() =>
      readReportsCredentials({ NEXT_PUBLIC_SUPABASE_URL: valid.NEXT_PUBLIC_SUPABASE_URL })
    ).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);
  });

  it("rejects an empty value as firmly as an absent one", () => {
    expect(() => readReportsCredentials({ ...valid, SUPABASE_SERVICE_ROLE_KEY: "  " })).toThrow(
      /SUPABASE_SERVICE_ROLE_KEY/
    );
  });

  it("refuses a non-https URL so a local database cannot be reported on", () => {
    expect(() =>
      readReportsCredentials({ ...valid, NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321" })
    ).toThrow(/https/);
  });
});
