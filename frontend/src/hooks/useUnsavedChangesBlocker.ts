import { useCallback } from "react";
import { type BlockerFunction, useBlocker } from "react-router-dom";

export type UseUnsavedChangesBlockerResult = {
  isBlocked: boolean;
  confirmNavigation: () => void;
  cancelNavigation: () => void;
};

export function useUnsavedChangesBlocker(
  shouldBlock: boolean,
): UseUnsavedChangesBlockerResult {
  const shouldBlockNavigation = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) => {
      if (!shouldBlock) {
        return false;
      }

      return (
        currentLocation.pathname !== nextLocation.pathname ||
        currentLocation.search !== nextLocation.search ||
        currentLocation.hash !== nextLocation.hash
      );
    },
    [shouldBlock],
  );

  const blocker = useBlocker(shouldBlockNavigation);

  const confirmNavigation = useCallback(() => {
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
  }, [blocker]);

  const cancelNavigation = useCallback(() => {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
  }, [blocker]);

  return {
    isBlocked: blocker.state === "blocked",
    confirmNavigation,
    cancelNavigation,
  };
}
