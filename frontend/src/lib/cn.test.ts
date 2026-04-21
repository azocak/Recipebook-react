import { cn } from "./cn";

describe("cn", () => {
  it("concatenates the normal class names and omits the falsy values", () => {
    expect(cn("rounded-2xl", "border", false, undefined, null, "p-4")).toBe(
      "rounded-2xl border p-4",
    );
  });

  it("retains the later Tailwind utility in case of a conflict", () => {
    expect(cn("px-2", "py-2", "px-4", "text-slate-500", "text-slate-700")).toBe(
      "py-2 px-4 text-slate-700",
    );
  });

  it("handles both object- and array-based input", () => {
    expect(
      cn(
        ["rounded-xl", "bg-white"],
        {
          "border-slate-200": true,
          "border-red-200": false,
        },
        "shadow-sm",
      ),
    ).toBe("rounded-xl bg-white border-slate-200 shadow-sm");
  });
});
