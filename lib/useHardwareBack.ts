import { useEffect } from 'react';
import { backButtonStore } from './backButtonStore';

/**
 * Registers the phone's Back button while `isActive`.
 *
 * The handler may return `false` to leave the event unconsumed (e.g. a flow
 * step where Back has nowhere sensible to go yet), in which case the global
 * listener falls through to its normal behaviour instead of dead-ending.
 */
export function useHardwareBack(isActive: boolean, onBack: () => boolean | void) {
  useEffect(() => {
    if (!isActive) return;

    const handler = () => onBack() !== false;

    backButtonStore.push(handler);
    return () => {
      backButtonStore.pop(handler);
    };
  }, [isActive, onBack]);
}
