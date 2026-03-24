import { useNavigate } from "react-router-dom";

type PageStateProps = {
  message: string;
  tone?: "error" | "default";
  backTo?: string;
  backLabel?: string;
};

export function PageState({
  message,
  tone = "default",
  backTo = "/recipes",
  backLabel = "Vissza a receptekhez",
}: PageStateProps) {
  const navigate = useNavigate();
  return (
    <section className="mx-auto max-w-3xl space-y-4">
      <p className={tone ? "text-red-600" : ""}>{message}</p>
      <button
        type="button"
        onClick={() => navigate(backTo)}
        className="rounded bg-orange-600 px-4 py-2 text-white"
      >
        {backLabel}
      </button>
    </section>
  );
}
