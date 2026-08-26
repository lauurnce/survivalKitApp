import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OutputPanel } from "./OutputPanel";
import type { RunResult } from "@/lib/ide/types";

const baseResult: RunResult = {
  stdout: "",
  stderr: "",
  exitCode: null,
  timedOut: false,
  durationMs: 12,
  table: {
    columns: ["id", "name"],
    rows: [
      [1, "Ada"],
      [2, null],
    ],
  },
};

describe("OutputPanel", () => {
  it("renders the executed script block above results", () => {
    render(
      <OutputPanel
        result={baseResult}
        running={false}
        error={null}
        executedCode="SELECT id, name FROM users;"
      />
    );
    expect(screen.getByText("Executed Script")).toBeInTheDocument();
    expect(screen.getByText("SELECT id, name FROM users;")).toBeInTheDocument();
  });

  it("omits the executed script block when no code is given", () => {
    render(<OutputPanel result={baseResult} running={false} error={null} />);
    expect(screen.queryByText("Executed Script")).not.toBeInTheDocument();
  });

  it("renders table headers and rows with a row count", () => {
    render(<OutputPanel result={baseResult} running={false} error={null} />);
    expect(screen.getByRole("columnheader", { name: "id" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "name" })).toBeInTheDocument();
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("2 rows")).toBeInTheDocument();
  });

  it("renders NULL cells specially", () => {
    render(<OutputPanel result={baseResult} running={false} error={null} />);
    expect(screen.getByText("NULL")).toHaveClass("italic");
  });

  it("shows the error state", () => {
    render(<OutputPanel result={null} running={false} error="boom" />);
    expect(screen.getByText("boom")).toBeInTheDocument();
  });

  it("renders per-statement captions and tables when statements are present", () => {
    const result: RunResult = {
      ...baseResult,
      table: undefined,
      statements: [
        { sql: "CREATE TABLE t(id);", columns: ["id"], rows: [[1]] },
        { sql: "SELECT * FROM t;", columns: ["id"], rows: [[1], [2]] },
      ],
    };
    render(<OutputPanel result={result} running={false} error={null} />);
    expect(screen.getByText("CREATE TABLE t(id);")).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader", { name: "id" })).toHaveLength(2);
    expect(screen.getByText("1 row")).toBeInTheDocument();
    expect(screen.getByText("2 rows")).toBeInTheDocument();
  });
});
