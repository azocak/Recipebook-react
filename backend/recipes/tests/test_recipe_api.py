from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from recipes.models import Recipe

User = get_user_model()

RECIPES_URL = "/api/recipes/"
class RecipeApiTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            username="owner",
            email="owner@gmail.com",
            password="titkos123",
        )
        self.other_user = User.objects.create_user(
            username="other",
            email="other@gmail.com",
            password="titkos123",
        )

        self.recipe = Recipe.objects.create(
            owner=self.owner,
            title="Palacsinta",
            ingredients="Liszt, tojás, tej",
            instructions="Keverd össze és süsd ki.",
            cooking_time=20,
            servings=4,
        )

    def recipe_detail_url(self,recipe_id):
        return f"{RECIPES_URL}{recipe_id}/"
    
    def login_owner(self):
        self.client.login(username="owner", password="titkos123")
    
    def login_other_user(self):
        self.client.login(username="other", password="titkos123")

    def valid_recipe_payload(self,**overrides):
        payload={
            "title": "Gulyás",
            "ingredients": "Hús, hagyma, paprika",
            "instructions": "Főzd meg lassú tűzön.",
            "cooking_time": 60,
            "servings": 4,
        }
        payload.update(overrides)
        return payload
    
    def assert_invalid_recipe_field(self, field, value):
        self.login_owner()

        response = self.client.post(
            RECIPES_URL,
            self.valid_recipe_payload(**{field: value}),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(field, response.data)
    
    
    def test_guest_can_list_recipes(self):
        response = self.client.get(RECIPES_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_guest_cannot_create_recipe(self):
        response = self.client.post(
            RECIPES_URL,
            self.valid_recipe_payload(),
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_authenticated_user_can_create_recipe(self):
        self.login_owner()

        response = self.client.post(
            RECIPES_URL,
            self.valid_recipe_payload(),
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Recipe.objects.count(), 2)
        self.assertEqual(Recipe.objects.latest("id").owner, self.owner)

    def test_create_recipe_with_empty_title_returns_400(self):
        self.assert_invalid_recipe_field("title","")

    def test_create_recipe_with_short_title_returns_400(self):
        self.assert_invalid_recipe_field("title","ab")
    
    def test_create_recipe_with_empty_ingredients_returns_400(self):
        self.assert_invalid_recipe_field("ingredients","")

    def test_create_recipe_with_short_ingredients_returns_400(self):
        self.assert_invalid_recipe_field("ingredients","rövid")
    
    def test_create_recipe_with_empty_instructions_returns_400(self):
        self.assert_invalid_recipe_field("instructions","")

    def test_create_recipe_with_short_instructions_returns_400(self):
        self.assert_invalid_recipe_field("instructions","rövid")

    def test_create_recipe_with_too_small_cooking_time_returns_400(self):
        self.assert_invalid_recipe_field("cooking_time",0)

    def test_create_recipe_with_too_small_servings_returns_400(self):
        self.assert_invalid_recipe_field("servings",0)

    def test_create_recipe_when_ingredients_and_instructions_match_returns_400(self):
        self.login_owner()

        response = self.client.post(
            RECIPES_URL,
            self.valid_recipe_payload(
                ingredients="ugyanaz a szöveg",
                instructions="ugyanaz a szöveg",
            ),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("instructions", response.data)
        
    def test_same_user_cannot_create_recipe_with_duplicate_title(self):
        self.login_owner()

        response = self.client.post(
            RECIPES_URL,
            self.valid_recipe_payload(
                title="Palacsinta",
                ingredients="Liszt, cukor, tej",
                instructions="Keverd össze és süsd ki rendesen.",
                cooking_time=25,
                servings=4,
            ),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)
        self.assertEqual(response.data["title"][0], "Már van ilyen nevű recepted.")

    def test_other_user_can_create_recipe_with_same_title(self):
        self.login_other_user()

        response = self.client.post(
            RECIPES_URL,
            self.valid_recipe_payload(
                title="Palacsinta",
                ingredients="Liszt, cukor, tej",
                instructions="Keverd össze és süsd ki rendesen.",
                cooking_time=25,
                servings=4,
            ),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_owner_can_update_own_recipe(self):
        self.login_owner()

        response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {"title": "Amerikai palacsinta"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.recipe.refresh_from_db()
        self.assertEqual(self.recipe.title, "Amerikai palacsinta")

    def test_other_user_cannot_update_foreign_recipe(self):
        self.login_other_user()

        response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {"title": "Ellopott recept"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.recipe.refresh_from_db()
        self.assertEqual(self.recipe.title, "Palacsinta")
    
    def test_owner_can_delete_own_recipe(self):
        self.login_owner()

        response = self.client.delete(self.recipe_detail_url(self.recipe.id))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Recipe.objects.filter(id=self.recipe.id).exists())

    def test_other_user_cannot_delete_foreign_recipe(self):
        self.login_other_user()

        response = self.client.delete(self.recipe_detail_url(self.recipe.id))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Recipe.objects.filter(id=self.recipe.id).exists())