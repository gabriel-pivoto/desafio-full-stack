type Props = {
  message: string;
};

export function ErrorBanner({ message }: Props) {
  return (
    <div className="error" style={{ padding: '0.5rem 1rem' }}>
      {message}
    </div>
  );
}
