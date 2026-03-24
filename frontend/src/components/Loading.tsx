type LoadingProps = {
  message?: string;
};

export function Loading({ message = "Betöltés..." }: LoadingProps) {
  return <p className="mt-10 text-center">{message}</p>;
}
