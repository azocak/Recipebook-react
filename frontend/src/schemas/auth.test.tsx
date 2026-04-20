import { loginSchema, registerSchema } from "./auth";

describe("loginSchema", () => {
  it("It returns an error if the username is missing", () => {
    const result = loginSchema.safeParse({
      username: "   ",
      password: "secret123",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["username"]);
      expect(result.error.issues[0]?.message).toBe(
        "A felhasználónév megadása kötelező.",
      );
    }
  });

  it("It returns an error if the password is missing", () => {
    const result = loginSchema.safeParse({
      username: "testuser",
      password: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["password"]);
      expect(result.error.issues[0]?.message).toBe(
        "A jelszó megadása kötelező.",
      );
    }
  });

  it("trim the username field", () => {
    const result = loginSchema.safeParse({
      username: "  testuser  ",
      password: "secret123",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.username).toBe("testuser");
    }
  });
});

describe("registerSchema", () => {
  it("It returns an error if the email format is incorrect", () => {
    const result = registerSchema.safeParse({
      username: "testuser",
      email: "no-email",
      password: "secret123",
      confirmation: "secret123",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["email"]);
      expect(result.error.issues[0]?.message).toBe(
        "Adj meg érvényes email címet.",
      );
    }
  });

  it("It returns an error if the confirmation is missing", () => {
    const result = registerSchema.safeParse({
      username: "testuser",
      email: "teszt@example.com",
      password: "secret123",
      confirmation: "",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmation"]);
      expect(result.error.issues[0]?.message).toBe(
        "A jelszó megerősítése kötelező.",
      );
    }
  });

  it("places the mismatch error in the confirmation field", () => {
    const result = registerSchema.safeParse({
      username: "testuser",
      email: "teszt@example.com",
      password: "secret123",
      confirmation: "masjelszo",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const confirmationIssue = result.error.issues.find(
        (issue) => issue.path[0] === "confirmation",
      );

      expect(confirmationIssue?.message).toBe("A két jelszó nem egyezik.");
    }
  });

  it("trim the username and email field", () => {
    const result = registerSchema.safeParse({
      username: "  testuser  ",
      email: "  teszt@example.com  ",
      password: "secret123",
      confirmation: "secret123",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.username).toBe("testuser");
      expect(result.data.email).toBe("teszt@example.com");
    }
  });
});
