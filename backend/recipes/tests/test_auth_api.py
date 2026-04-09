from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

REGISTER_URL = "/api/auth/register"
LOGIN_URL = "/api/auth/login"
LOGOUT_URL = "/api/auth/logout"
ME_URL = "/api/auth/me"


class AuthApiTests(APITestCase):
    def create_user(self, **overrides):
        payload = {
            "username": "anna",
            "email": "anna@gmail.com",
            "password": "titkos123",
        }
        payload.update(overrides)

        return User.objects.create_user(**payload)

    def valid_register_payload(self, **overrides):
        payload = {
            "username": "anna",
            "email": "anna@gmail.com",
            "password": "titkos123",
            "confirmation": "titkos123",
        }
        payload.update(overrides)
        return payload

    def valid_login_payload(self, **overrides):
        payload = {
            "username": "anna",
            "password": "titkos123",
        }
        payload.update(overrides)
        return payload

    def assert_me_returns_user(self, username, email=None):
        response = self.client.get(ME_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data)
        self.assertEqual(response.data["username"], username)

        if email is not None:
            self.assertEqual(response.data["email"], email)

        return response

    def test_register_creates_user_and_returns_201(self):
        response = self.client.post(
            REGISTER_URL,
            self.valid_register_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.first().username, "anna")

    def test_register_with_mismatched_passwords_returns_400(self):
        response = self.client.post(
            REGISTER_URL,
            self.valid_register_payload(confirmation="masik123"),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("confirmation", response.data)

    def test_register_with_duplicate_username_returns_400(self):
        self.create_user()

        response = self.client.post(
            REGISTER_URL,
            self.valid_register_payload(email="anna@gmail.com"),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)

    def test_register_with_duplicate_email_returns_400(self):
        self.create_user()

        response = self.client.post(
            REGISTER_URL,
            self.valid_register_payload(username="panna"),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_register_with_trimmed_email_creates_user(self):
        response = self.client.post(
            REGISTER_URL,
            self.valid_register_payload(email="  ANNA@GMAIL.COM  "),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.first().email, "anna@gmail.com")

    def test_register_logs_in_user_session(self):
        response = self.client.post(
            REGISTER_URL,
            self.valid_register_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assert_me_returns_user("anna", "anna@gmail.com")

    def test_login_with_invalid_password_returns_400(self):
        self.create_user()

        response = self.client.post(
            LOGIN_URL,
            self.valid_login_payload(password="rosszjelszo"),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_empty_username_returns_400(self):
        response = self.client.post(
            LOGIN_URL,
            self.valid_login_payload(username=""),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("username", response.data)

    def test_login_with_empty_password_returns_400(self):
        response = self.client.post(
            LOGIN_URL,
            self.valid_login_payload(password=""),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_login_with_trimmed_username_returns_200(self):
        self.create_user()

        response = self.client.post(
            LOGIN_URL,
            self.valid_login_payload(username="  anna  "),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "anna")

    def test_login_with_valid_credentials_returns_200_and_user_data(self):
        self.create_user()

        response = self.client.post(
            LOGIN_URL,
            self.valid_login_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], "anna")
        self.assertEqual(response.data["email"], "anna@gmail.com")

    def test_login_creates_active_session(self):
        self.create_user()

        response = self.client.post(
            LOGIN_URL,
            self.valid_login_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assert_me_returns_user("anna", "anna@gmail.com")

    def test_me_returns_null_for_guest(self):
        response = self.client.get(ME_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data)

    def test_me_returns_user_for_authenticated_user(self):
        user = self.create_user()

        self.client.login(username="anna", password="titkos123")

        response = self.client.get(ME_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], user.id)
        self.assertEqual(response.data["username"], "anna")

    def test_logout_returns_204(self):
        self.create_user()

        self.client.login(username="anna", password="titkos123")

        response = self.client.post(LOGOUT_URL)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
