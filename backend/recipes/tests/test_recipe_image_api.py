from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from recipes.models import Recipe

User = get_user_model()

RECIPES_URL = "/api/recipes/"


class RecipeImageApiTests(APITestCase):
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

    def recipe_detail_url(self, recipe_id):
        return f"{RECIPES_URL}{recipe_id}/"

    def login_owner(self):
        self.client.login(username="owner", password="titkos123")

    def login_other_user(self):
        self.client.login(username="other", password="titkos123")

    def valid_recipe_payload(self, **overrides):
        payload = {
            "title": "Gulyás",
            "ingredients": "Hús, hagyma, paprika",
            "instructions": "Főzd meg lassú tűzön.",
            "cooking_time": 60,
            "servings": 4,
        }
        payload.update(overrides)
        return payload

    def test_recipe_detail_contains_image_fields(self):
        response = self.client.get(self.recipe_detail_url(self.recipe.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("image", response.data)
        self.assertIn("image_url", response.data)

    def test_recipe_detail_returns_null_image_url_when_no_image(self):
        response = self.client.get(self.recipe_detail_url(self.recipe.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data["image"])
        self.assertIsNone(response.data["image_url"])

    def test_recipe_list_contains_image_fields(self):
        response = self.client.get(RECIPES_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertIn("image", response.data[0])
        self.assertIn("image_url", response.data[0])

    def test_owner_can_create_recipe_without_image(self):
        self.login_owner()

        response = self.client.post(
            RECIPES_URL,
            self.valid_recipe_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Recipe.objects.count(), 2)
        self.assertIsNone(response.data["image"])
        self.assertIsNone(response.data["image_url"])

    def test_owner_can_patch_recipe_without_image_fields(self):
        self.login_owner()

        response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {"title": "Amerikai palacsinta"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.recipe.refresh_from_db()
        self.assertEqual(self.recipe.title, "Amerikai palacsinta")
        self.assertFalse(bool(self.recipe.image))

    def test_owner_can_patch_recipe_with_remove_image_false(self):
        self.login_owner()

        response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {"remove_image": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.recipe.refresh_from_db()
        self.assertFalse(bool(self.recipe.image))

    def test_owner_can_patch_recipe_with_remove_image_true_when_no_image_exists(self):
        self.login_owner()

        response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {"remove_image": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.recipe.refresh_from_db()
        self.assertFalse(bool(self.recipe.image))

    def test_other_user_cannot_patch_foreign_recipe_image_state(self):
        self.login_other_user()

        response = self.client.patch(
            self.recipe_detail_url(self.recipe.id),
            {"remove_image": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_guest_cannot_create_recipe_even_with_image_ready_payload_shape(self):
        response = self.client.post(
            RECIPES_URL,
            self.valid_recipe_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)