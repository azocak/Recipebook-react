import { useQuery } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { renderWithQueryClient } from "./queryClient";

function QueryClientSmokeTest() {
  const { data, isLoading } = useQuery({
    queryKey: ["query-client-smoke-test"],
    queryFn: async () => "Teszt adat",
  });

  if (isLoading) {
    return <p>Betöltés...</p>;
  }

  return <p>{data}</p>;
}

describe("query client test helpers", () => {
  it("renders a component that uses useQuery", async () => {
    renderWithQueryClient(<QueryClientSmokeTest />);

    expect(await screen.findByText("Teszt adat")).toBeInTheDocument();
  });
});
