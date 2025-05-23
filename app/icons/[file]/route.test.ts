import { describe, expect, it } from "vitest";
import { GET, generateStaticParams } from "./route";
import { PWA_ICON_SIZES } from "@/lib/retention/pwa";

const call = (file: string) => GET(new Request(`https://tryi2i.com/icons/${file}`), { params: Promise.resolve({ file }) });

describe("PWA icons", () => {
  it("prerenders the 192 and 512 icons", () => {
    expect(generateStaticParams()).toEqual([{ file: "icon-192.png" }, { file: "icon-512.png" }]);
    expect(Object.values(PWA_ICON_SIZES)).toEqual([192, 512]);
  });

  it("renders a PNG", async () => {
    const res = await call("icon-512.png");
    expect(res.headers.get("content-type")).toBe("image/png");
  });

  it("404s any other name", async () => {
    expect((await call("icon-64.png")).status).toBe(404);
  });
});
