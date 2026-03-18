from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from recipes.models import Recipe

User = get_user_model()


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

    def test_guest_can_list_recipes(self):
        response = self.client.get("/api/recipes/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_guest_cannot_create_recipe(self):
        response = self.client.post(
            "/api/recipes/",
            {
                "title": "Gulyás",
                "ingredients": "Hús, hagyma",
                "instructions": "Főzd meg.",
                "cooking_time": 60,
                "servings": 4,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_authenticated_user_can_create_recipe(self):
        self.client.login(username="owner", password="titkos123")

        response = self.client.post(
            "/api/recipes/",
            {
                "title": "Gulyás",
                "ingredients": "Hús, hagyma",
                "instructions": "Főzd meg.",
                "cooking_time": 60,
                "servings": 4,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Recipe.objects.count(), 2)
        self.assertEqual(Recipe.objects.latest("id").owner, self.owner)

    def test_owner_can_update_own_recipe(self):
        self.client.login(username="owner", password="titkos123")

        response = self.client.patch(
            f"/api/recipes/{self.recipe.id}/",
            {"title": "Amerikai palacsinta"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.recipe.refresh_from_db()
        self.assertEqual(self.recipe.title, "Amerikai palacsinta")

    def test_other_user_cannot_update_foreign_recipe(self):
        self.client.login(username="other", password="titkos123")

        response = self.client.patch(
            f"/api/recipes/{self.recipe.id}/",
            {"title": "Ellopott recept"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.recipe.refresh_from_db()
        self.assertEqual(self.recipe.title, "Palacsinta")