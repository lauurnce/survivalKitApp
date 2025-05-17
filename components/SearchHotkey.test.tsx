import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { SearchHotkey } from "./SearchHotkey";

const push = vi.fn();
let pathname = "/year";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => pathname,
}));

afterEach(() => {
  cleanup();
  push.mockReset();
  document.body.innerHTML = "";
});

describe("SearchHotkey", () => {
  it("opens /search on '/' from another page", () => {
    pathname = "/year";
    render(<SearchHotkey />);
    fireEvent.keyDown(document.body, { key: "/" });
    expect(push).toHaveBeenCalledWith("/search");
  });

  it("ignores '/' typed into a field", () => {
    pathname = "/year";
    render(<><SearchHotkey /><input aria-label="email" /></>);
    const field = document.querySelector("input")!;
    fireEvent.keyDown(field, { key: "/" });
    expect(push).not.toHaveBeenCalled();
  });

  it("on /search, focuses and selects the search box instead of navigating (QA FL-13)", () => {
    pathname = "/search";
    render(<><SearchHotkey /><input data-search-input defaultValue="arrays" /><button>x</button></>);
    const input = document.querySelector<HTMLInputElement>("[data-search-input]")!;
    document.querySelector("button")!.focus();

    fireEvent.keyDown(document.body, { key: "/" });

    expect(push).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe("arrays".length);
  });

  it("on /search, Ctrl+K also refocuses the box", () => {
    pathname = "/search";
    render(<><SearchHotkey /><input data-search-input /></>);
    fireEvent.keyDown(document.body, { key: "k", ctrlKey: true });
    expect(document.activeElement).toBe(document.querySelector("[data-search-input]"));
  });
});
