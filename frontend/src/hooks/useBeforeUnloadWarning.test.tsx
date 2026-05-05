import { render } from "@testing-library/react";

import { useBeforeUnloadWarning } from "./useBeforeUnloadWarning";

function BeforeUnloadWarningTestComponent({
  shouldWarn,
}: {
  shouldWarn: boolean;
}) {
  useBeforeUnloadWarning(shouldWarn);

  return <p>Test component</p>;
}

function createBeforeUnloadEvent() {
  const event = new Event("beforeunload", {
    cancelable: true,
  }) as BeforeUnloadEvent;

  const preventDefault = vi.fn();

  Object.defineProperty(event, "preventDefault", {
    configurable: true,
    value: preventDefault,
  });

  return { event, preventDefault };
}

describe("useBeforeUnloadWarning", () => {
  it("does not prevent unload when warning is disabled", () => {
    render(<BeforeUnloadWarningTestComponent shouldWarn={false} />);

    const { event, preventDefault } = createBeforeUnloadEvent();

    window.dispatchEvent(event);

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("prevents unload when warning is enabled", () => {
    render(<BeforeUnloadWarningTestComponent shouldWarn />);

    const { event, preventDefault } = createBeforeUnloadEvent();

    window.dispatchEvent(event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("starts warning after shouldWarn changes from false to true", () => {
    const { rerender } = render(
      <BeforeUnloadWarningTestComponent shouldWarn={false} />,
    );

    rerender(<BeforeUnloadWarningTestComponent shouldWarn />);

    const { event, preventDefault } = createBeforeUnloadEvent();

    window.dispatchEvent(event);

    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("removes the warning after shouldWarn changes from true to false", () => {
    const { rerender } = render(
      <BeforeUnloadWarningTestComponent shouldWarn />,
    );

    rerender(<BeforeUnloadWarningTestComponent shouldWarn={false} />);

    const { event, preventDefault } = createBeforeUnloadEvent();

    window.dispatchEvent(event);

    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("removes the beforeunload listener on unmount", () => {
    const { unmount } = render(<BeforeUnloadWarningTestComponent shouldWarn />);

    unmount();

    const { event, preventDefault } = createBeforeUnloadEvent();

    window.dispatchEvent(event);

    expect(preventDefault).not.toHaveBeenCalled();
  });
});
