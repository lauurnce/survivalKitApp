import { describe, it, expect } from "vitest";
import { LANGUAGES, getLanguage } from "./languages";

describe("language registry", () => {
  it("defines exactly python, sql, java, c", () => {
    expect(Object.keys(LANGUAGES).sort()).toEqual(["c", "java", "python", "sql"]);
  });

  it("marks python and sql as browser runtimes", () => {
    expect(LANGUAGES.python.runtime).toBe("browser");
    expect(LANGUAGES.sql.runtime).toBe("browser");
  });

  it("marks java and c as server runtimes with piston config", () => {
    expect(LANGUAGES.java.runtime).toBe("server");
    expect(LANGUAGES.c.runtime).toBe("server");
    expect(LANGUAGES.java.piston?.language).toBe("java");
    expect(LANGUAGES.c.piston?.language).toBe("c");
  });

  it("getLanguage returns the language for a valid id", () => {
    expect(getLanguage("python").label).toBe("Python");
  });

  it("getLanguage throws for an unknown id", () => {
    // @ts-expect-error testing runtime guard
    expect(() => getLanguage("ruby")).toThrow();
  });

  it("every language ships non-empty starter code", () => {
    for (const lang of Object.values(LANGUAGES)) {
      expect(lang.starter.trim().length).toBeGreaterThan(0);
    }
  });
});
