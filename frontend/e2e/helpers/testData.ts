export type E2ERecipe = {
  id: number;
  owner: number;
  owner_username: string;
  title: string;
  ingredients: string;
  instructions: string;
  cooking_time: number;
  servings: number;
  image: null;
  image_url: null;
  created_at: string;
};

export function createRecipe(overrides: Partial<E2ERecipe> = {}): E2ERecipe {
  return {
    id: 1,
    owner: 1,
    owner_username: "e2e_user",
    title: "Almás palacsinta",
    ingredients: "20 dkg liszt\n2 db tojás\n3 dl tej\n1 reszelt alma",
    instructions: "Keverd össze a hozzávalókat, majd süsd ki a palacsintákat.",
    cooking_time: 25,
    servings: 4,
    image: null,
    image_url: null,
    created_at: "2026-05-07T12:00:00Z",
    ...overrides,
  };
}
