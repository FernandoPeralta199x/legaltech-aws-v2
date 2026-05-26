import unittest

from fastapi.testclient import TestClient

from src.main import create_app


class AppCorsTest(unittest.TestCase):
    def test_local_frontend_origin_is_allowed_for_api_preflight(self):
        client = TestClient(create_app())

        response = client.options(
            "/api/v1/clients",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.headers["access-control-allow-origin"],
            "http://localhost:3000",
        )
        self.assertIn(
            "authorization",
            response.headers["access-control-allow-headers"].lower(),
        )
