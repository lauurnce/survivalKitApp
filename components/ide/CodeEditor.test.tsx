import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CodeEditor } from "./CodeEditor";

function editorContent(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>(".cm-content");
  if (!el) throw new Error("CodeMirror content element not rendered");
  return el;
}

describe("CodeEditor", () => {
  it("names the editor by language for assistive tech", async () => {
    const { container } = render(<CodeEditor languageId="python" value="" onChange={() => {}} />);
    await waitFor(() =>
      expect(editorContent(container)).toHaveAttribute("aria-label", "Python code editor")
    );
  });

  it("describes how to leave the editor, since Tab indents inside it", async () => {
    const { container } = render(<CodeEditor languageId="c" value="" onChange={() => {}} />);
    const content = editorContent(container);
    await waitFor(() => expect(content).toHaveAttribute("aria-describedby"));
    const hint = document.getElementById(content.getAttribute("aria-describedby")!);
    expect(hint).toHaveTextContent(/esc then tab to leave the editor/i);
  });

  it("shows the hint visibly only while the editor has focus", async () => {
    const { container } = render(<CodeEditor languageId="python" value="" onChange={() => {}} />);
    const hint = screen.getByText(/esc then tab to leave the editor/i);
    expect(hint).toHaveClass("sr-only");

    fireEvent.focus(editorContent(container));
    expect(hint).not.toHaveClass("sr-only");

    fireEvent.blur(editorContent(container));
    expect(hint).toHaveClass("sr-only");
  });
});
