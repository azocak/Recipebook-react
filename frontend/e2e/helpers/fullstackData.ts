export const FULLSTACK_E2E_PREFIX = "e2e";

function createUniqueSuffix() {
  return `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

export function createUniqueFullStackUser() {
  const suffix = createUniqueSuffix();

  return {
    username: `${FULLSTACK_E2E_PREFIX}user${suffix}`,
    email: `${FULLSTACK_E2E_PREFIX}user${suffix}@example.com`,
    password: `Napsugar!${suffix}Aa9`,
  };
}

export function createUniqueFullStackRecipe() {
  const suffix = createUniqueSuffix();

  return {
    title: `E2E Teszt Recept ${suffix}`,
    ingredients: `Teszt hozzávalók ${suffix}: liszt, víz, só, olaj és fűszerek.`,
    instructions: `Teszt elkészítési lépések ${suffix}: keverd össze, süsd meg, majd tálald frissen.`,
    cookingTime: "25",
    servings: "2",
  };
}
