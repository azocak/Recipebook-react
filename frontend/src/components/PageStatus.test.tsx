import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PageStatus } from "./PageStatus";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("PageStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title with description in default variant", () => {
    render(
      <PageStatus
        title="Betöltés kész"
        description="Az oldal sikeresen betöltődött."
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Betöltés kész" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Az oldal sikeresen betöltődött."),
    ).toBeInTheDocument();
  });

  it("renders without description when it is not provided", () => {
    const { container } = render(<PageStatus title="Nincs leírás" />);

    expect(
      screen.getByRole("heading", { name: "Nincs leírás" }),
    ).toBeInTheDocument();

    expect(container.querySelector("p")).not.toBeInTheDocument();
  });

  it("applies the error variant styling to the title", () => {
    render(
      <PageStatus
        title="Hiba történt"
        description="Valami nem sikerült."
        variant="error"
      />,
    );

    expect(screen.getByRole("heading", { name: "Hiba történt" })).toHaveClass(
      "text-red-600",
    );
  });

  it("applies the success variant styling to the title", () => {
    render(
      <PageStatus
        title="Sikeres művelet"
        description="A mentés sikerült."
        variant="success"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Sikeres művelet" }),
    ).toHaveClass("text-green-600");
  });

  it("renders and calls the action button when actionLabel and onAction are provided", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <PageStatus
        title="Újrapróbálás"
        description="Próbáld meg újra."
        actionLabel="Újrapróbálom"
        onAction={onAction}
      />,
    );

    const actionButton = screen.getByRole("button", {
      name: "Újrapróbálom",
    });

    expect(actionButton).toBeInTheDocument();

    await user.click(actionButton);

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("renders the back button with the default label and navigates when clicked", async () => {
    const user = userEvent.setup();

    render(
      <PageStatus
        title="Visszalépés"
        description="Menj vissza az előző oldalra."
        backTo="/recipes"
      />,
    );

    const backButton = screen.getByRole("button", { name: "Vissza" });

    expect(backButton).toBeInTheDocument();

    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/recipes");
  });

  it("renders the back button with a custom label", async () => {
    const user = userEvent.setup();

    render(
      <PageStatus
        title="Saját visszagomb"
        description="Egyedi címke."
        backTo="/login"
        backLabel="Ugrás a belépéshez"
      />,
    );

    const backButton = screen.getByRole("button", {
      name: "Ugrás a belépéshez",
    });

    expect(backButton).toBeInTheDocument();

    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("renders both action and back buttons when both configurations are provided", () => {
    const onAction = vi.fn();

    render(
      <PageStatus
        title="Két gomb"
        description="Mindkét akció elérhető."
        actionLabel="Mentés újra"
        onAction={onAction}
        backTo="/recipes"
        backLabel="Vissza a receptekhez"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Mentés újra" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Vissza a receptekhez" }),
    ).toBeInTheDocument();
  });

  it("does not render an action area when neither action nor back navigation is provided", () => {
    render(
      <PageStatus title="Csak státusz" description="Nincs további művelet." />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("does not render the action button when actionLabel is missing", () => {
    const onAction = vi.fn();

    render(
      <PageStatus
        title="Hiányzó actionLabel"
        description="A callback önmagában nem elég."
        onAction={onAction}
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
