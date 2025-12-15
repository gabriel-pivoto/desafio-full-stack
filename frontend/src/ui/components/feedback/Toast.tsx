import { useEffect } from 'react';

type Props = {
  message: string;
  duration?: number;
  onClose: () => void;
};

export function Toast({ message, duration = 2800, onClose }: Props) {
  useEffect(() => {
    const timeout = setTimeout(onClose, duration);
    return () => clearTimeout(timeout);
  }, [duration, onClose, message]);

  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
