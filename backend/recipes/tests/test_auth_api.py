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

  def test_register_with_mismatched_passwords_returns_400(self):
    response = self.client.post(
      "/api/auth/register",
       {
         "username": "anna",
         "email": "anna@gmail.com",
         "password": "titkos123",
         "confirmation": "masik123",
       },
       format="json",
    )

    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    self.assertIn("confirmation", response.data)

  def test_register_with_duplicate_username_returns_400(self):
    User.objects.create_user(
      username="anna",
      email="anna@gmail.com",
      password="titkos123",
    )

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

    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    self.assertIn("username", response.data)

  def test_register_with_duplicate_email_returns_400(self):
    User.objects.create_user(
      username="anna",
      email="anna@gmail.com",
      password="titkos123",
    )

    response = self.client.post(
      "/api/auth/register",
      {
        "username": "panna",
        "email": "anna@gmail.com",
        "password": "titkos123",
        "confirmation": "titkos123",
      },
      format="json",
    )

    self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    self.assertIn("email", response.data)

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

  def test_login_with_valid_credentials_returns_200_and_user_data(self):
    User.objects.create_user(
      username="anna",
      email="anna@gmail.com",
      password="titkos123",
    )

    response = self.client.post(
      "/api/auth/login",
      {
        "username": "anna",
        "password": "titkos123",
      },
      format="json",
    )

    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.assertEqual(response.data["username"], "anna")
    self.assertEqual(response.data["email"], "anna@gmail.com")


  def test_me_returns_null_for_guest(self): 
    response = self.client.get("/api/auth/me")

    self.assertEqual(response.status_code,status.HTTP_200_OK)
    self.assertIsNone(response.data)

  def test_me_returns_user_for_authenticated_user(self):
    user = User.objects.create_user(
      username="anna",
      email="anna@gmail.com",
      password="titkos123",
    )

    self.client.login(username="anna", password="titkos123")

    response= self.client.get("/api/auth/me")

    self.assertEqual(response.status_code, status.HTTP_200_OK)
    self.assertEqual(response.data["id"], user.id)
    self.assertEqual(response.data["username"], "anna")
  

  def test_logout_returns_204(self):
    User.objects.create_user(
      username="anna",
      email="anna@gmail.com",
      password="titkos123",
    )

    self.client.login(username="anna", password="titkos123")

    response = self.client.post("/api/auth/logout")

    self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


  