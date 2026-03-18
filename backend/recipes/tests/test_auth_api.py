from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

class AuthApiTests(APITestCase):
  def test_register_creates_user_and_returns_201(self):
    response = self.client.post(
      "/api/auth/register",
      {
        "username": "anna",
        "email": "anna@example.com",
        "password": "titkos123",
        "confirmation": "titkos123",
      },
      format="json",
    )

    self.assertEqual(response.status_code,status.HTTP_201_CREATED)
    self.assertEqual(User.objects.count(), 1)
    self.assertEqual(User.objects.first().username, "anna")

  def test_login_with_invalid_password_returns_400(self):
    User.objects.create_user(
      username="anna",
      email="anna@gmail.com",
      password="titkos123",
    )

    response = self.client.post(
      "/api/auth/login",
      {
        "username": "anna",
        "password" : "rosszjelszo",
      },
      format="json",
    )

    self.assertEqual(response.status_code,status.HTTP_400_BAD_REQUEST)

  def test_me_returns_null_for_guest(self): 
    response = self.client.get("/api/auth/me")

    self.assertEqual(response.status_code,status.HTTP_200_OK)
    self.assertIsNone(response.data)

  