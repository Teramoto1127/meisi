type Props = {
  error?: string | null;
  success?: string | null;
};

export function FormMessage({ error, success }: Props) {
  if (!error && !success) return null;
  return (
    <p
      className={`rounded-md px-3 py-2 text-sm ${
        error ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
      }`}
    >
      {error ?? success}
    </p>
  );
}
