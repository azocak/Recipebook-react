import { applyApiErrorsToForm } from "./apiErrorAdapter";

type ExampleFormValues = {
  username: string;
  password: string;
  title: string;
};

describe("applyApiErrorsToForm", () => {
  it("assigns the string-type backend error to the field", () => {
    const setError = vi.fn();

    applyApiErrorsToForm<ExampleFormValues>(
      {
        response: {
          data: {
            username: "Ez a felhasználónév már foglalt.",
          },
        },
      },
      setError as never,
      {
        allowedFields: ["username", "password"],
        fallbackMessage: "Általános hiba történt.",
      },
    );

    expect(setError).toHaveBeenCalledWith("username", {
      type: "server",
      message: "Ez a felhasználónév már foglalt.",
    });
  });

  it("assigns the string[] backend error to the field", () => {
    const setError = vi.fn();

    applyApiErrorsToForm<ExampleFormValues>(
      {
        response: {
          data: {
            password: ["A jelszó túl rövid.", "Második hiba."],
          },
        },
      },
      setError as never,
      {
        allowedFields: ["username", "password"],
        fallbackMessage: "Általános hiba történt.",
      },
    );

    expect(setError).toHaveBeenCalledWith("password", {
      type: "server",
      message: "A jelszó túl rövid.",
    });
  });

  it("sets the non_field_errors error to the root.server field", () => {
    const setError = vi.fn();

    applyApiErrorsToForm<ExampleFormValues>(
      {
        response: {
          data: {
            non_field_errors: ["Hibás felhasználónév vagy jelszó."],
          },
        },
      },
      setError as never,
      {
        allowedFields: ["username", "password"],
        fallbackMessage: "Általános hiba történt.",
      },
    );

    expect(setError).toHaveBeenCalledWith("root.server", {
      type: "server",
      message: "Hibás felhasználónév vagy jelszó.",
    });
  });

  it("the detail error is assigned to the root.server field", () => {
    const setError = vi.fn();

    applyApiErrorsToForm<ExampleFormValues>(
      {
        response: {
          data: {
            detail: "Nincs jogosultságod ehhez a művelethez.",
          },
        },
      },
      setError as never,
      {
        allowedFields: ["title"],
        fallbackMessage: "Általános hiba történt.",
      },
    );

    expect(setError).toHaveBeenCalledWith("root.server", {
      type: "server",
      message: "Nincs jogosultságod ehhez a művelethez.",
    });
  });

  it("the message sets the error in the root.server field", () => {
    const setError = vi.fn();

    applyApiErrorsToForm<ExampleFormValues>(
      {
        response: {
          data: {
            message: "A mentés nem sikerült.",
          },
        },
      },
      setError as never,
      {
        allowedFields: ["title"],
        fallbackMessage: "Általános hiba történt.",
      },
    );

    expect(setError).toHaveBeenCalledWith("root.server", {
      type: "server",
      message: "A mentés nem sikerült.",
    });
  });

  it("root.server returns a fallback error if there is no processable error", () => {
    const setError = vi.fn();

    applyApiErrorsToForm<ExampleFormValues>(
      {
        response: {
          data: {
            unknown_key: { nested: true },
          },
        },
      },
      setError as never,
      {
        allowedFields: ["title"],
        fallbackMessage: "Általános hiba történt.",
      },
    );

    expect(setError).toHaveBeenCalledWith("root.server", {
      type: "server",
      message: "Általános hiba történt.",
    });
  });
});
