import asyncio
import os
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch

from models.jd import ParsedJD
from models.cv import CV, Address, SectionEntry, UserData
from models.requests import ParseJDRequest, MatchCVRequest, CompileCVRequest
import json

from dotenv import load_dotenv

from main import router

load_dotenv()


app = FastAPI()
app.include_router(
    router,
)

client = TestClient(app)


def sample_cv():
    return CV(
        user_data=UserData(
            name="John Doe",
            email="john@example.com",
            picture="./test_output/cv_pic.png",
            phone_number="+44 123456789",
            linkedin="linkedin.com/in/johndoe",
            portfolio="johndoe.dev",
            address=Address(
                city="London",
                country="UK",
            ),
        ),
        sections={
            "en": {
                "summary": {
                    "title": "Professional Summary",
                    "content": (
                        "Software engineer with experience building"
                        "scalable web applications and APIs."
                        "Looking for opportunities to contribute to innovative projects."
                    )
                } ,
                "experience": {
                    "title": "Professional Experience",
                    "content": [
                        SectionEntry(
                            title="Software Engineer",
                            subtitle="Company A",
                            start_date="2024",
                            end_date="2026",
                            bullet_points=[
                            "Developed Python services.",
                            "Built REST APIs using FastAPI.",
                            "Improved system performance by 35%.",
                            ],
                        ),
                        SectionEntry(
                            title="Software Developer Intern",
                            subtitle="Company B",
                            start_date="2023",
                            end_date="2024",
                            bullet_points=[
                                "Implemented frontend features.",
                                "Worked with React and TypeScript.",
                            ],
                        ),
                    ]
                },
                "education": {
                    "title": "Education",
                    "content": [
                        SectionEntry(
                            title="BSc Computer Science",
                            subtitle="University of Example",
                            start_date="2021",
                            end_date="2025",
                            bullet_points=[
                                "Graduated with First Class Honours."
                            ],
                        )
                    ]
                },
                "languages": {
                    "title": "Languages",
                    "content": ["English", "French"]
                },
                "skills": {
                    "title": "Skills",
                    "content": ["Python", "FastAPI", "React", "TypeScript"]
                },
                "other_sections": {
                    "Certifications": {
                        "title": "Certifications",
                        "content": [
                            SectionEntry(
                                title="AWS Certified Developer",
                                subtitle="Amazon Web Services",
                                start_date="2025",
                                bullet_points=[],
                            )
                        ]
                    }
                }
            }
        },
    ).model_dump()

def valid_parsed_jd():
    parsed_jd = Path(__file__).parent.parent / "test_output" / "job2_parsed.json"

    with open(parsed_jd) as f:
        return json.load(f)

def valid_api_key():
    return os.getenv("OPENAI_API_KEY", "test-api-key-123456789")

class TestHealth:
    def test_health(self):
        response = client.get("/api/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

class TestParseJD:
    @patch("main.parse_job_description", new_callable=AsyncMock)
    @patch("main.get_openai_client")
    def test_parse_jd_success(
        self,
        mock_get_client,
        mock_parse,
    ):
        parsed_jd = ParsedJD(**valid_parsed_jd())

        mock_get_client.return_value = MagicMock()
        mock_parse.return_value = parsed_jd

        response = client.post(
            "/api/job-description/parse",
            json={
                "job_description": "We are looking for a Python Software Engineer.",
                "openai_api_key": valid_api_key(),
                "model": "gpt-5.4-mini",
            },
        )

        assert response.status_code == 200
        assert response.json() == parsed_jd.model_dump()

        mock_get_client.assert_called_once_with(
            valid_api_key()
        )
        mock_parse.assert_awaited_once()

    def test_parse_jd_validation_error(self):
        response = client.post(
            "/api/job-description/parse",
            json={
                "job_description": "too short",
                "openai_api_key": valid_api_key(),
                "model": "gpt-5.4-mini",
            },
        )

        assert response.status_code == 422

    @patch("main.parse_job_description", new_callable=AsyncMock)
    @patch("main.get_openai_client")
    def test_parse_jd_timeout(
        self,
        mock_get_client,
        mock_parse,
    ):
        mock_get_client.return_value = MagicMock()
        mock_parse.side_effect = asyncio.TimeoutError

        response = client.post(
            "/api/job-description/parse",
            json={
                "job_description": "We are looking for a Python Software Engineer.",
                "openai_api_key": valid_api_key(),
                "model": "gpt-5.4-mini",
            },
        )

        assert response.status_code == 504
        assert response.json()["detail"] == (
            "The job description analysis timed out."
        )

    @patch("main.parse_job_description", new_callable=AsyncMock)
    @patch("main.get_openai_client")
    def test_parse_jd_unexpected_error(
        self,
        mock_get_client,
        mock_parse,
    ):
        mock_get_client.return_value = MagicMock()
        mock_parse.side_effect = Exception("unexpected error")

        response = client.post(
            "/api/job-description/parse",
            json={
                "job_description": "We are looking for a Python Software Engineer.",
                "openai_api_key": valid_api_key(),
                "model": "gpt-5.4-mini",
            },
        )

        assert response.status_code == 500
        assert response.json()["detail"] == (
            "An unexpected error occurred."
        )

class TestMatchCV:
    @patch("main.match_cv_entries", new_callable=AsyncMock)
    @patch("main.CVCompiler.to_entries")
    @patch("main.CVCompiler.from_json")
    @patch("main.get_openai_client")
    def test_match_cv_timeout(
        self,
        mock_get_client,
        mock_from_json,
        mock_to_entries,
        mock_match,
    ):
        mock_get_client.return_value = MagicMock()
        mock_from_json.return_value = MagicMock(spec=CV)
        mock_to_entries.return_value = []

        mock_match.side_effect = asyncio.TimeoutError

        response = client.post(
            "/api/cv/match",
            json={
                "parsed_jd": valid_parsed_jd(),
                "cv_raw": sample_cv(),
                "openai_api_key": valid_api_key(),
                "model": "gpt-5.4-mini",
            },
        )

        assert response.status_code == 504
        assert response.json()["detail"] == (
            "The CV matching operation timed out."
        )

    @patch("main.match_cv_entries", new_callable=AsyncMock)
    @patch("main.CVCompiler.to_entries")
    @patch("main.CVCompiler.from_json")
    @patch("main.get_openai_client")
    def test_match_cv_unexpected_error(
        self,
        mock_get_client,
        mock_from_json,
        mock_to_entries,
        mock_match,
    ):
        mock_get_client.return_value = MagicMock()
        mock_from_json.return_value = MagicMock(spec=CV)
        mock_to_entries.return_value = []

        mock_match.side_effect = Exception("unexpected error")

        response = client.post(
            "/api/cv/match",
            json={
                "parsed_jd": valid_parsed_jd(),
                "cv_raw": sample_cv(),
                "openai_api_key": valid_api_key(),
                "model": "gpt-5.4-mini",
            },
        )

        assert response.status_code == 500
        assert response.json()["detail"] == (
            "An unexpected error occurred."
        )

class TestCompileCV:
    @patch("main.CVCompiler.compile", new_callable=AsyncMock)
    @patch("main.CVCompiler")
    def test_compile_cv_success(
        self,
        mock_compiler_class,
        _
    ):
        mock_compiler = mock_compiler_class.return_value
        mock_compiler.compile = AsyncMock()

        mock_compiler.compile.return_value = MagicMock(
            path="generated/John_Doe.pdf",
            filename="John_Doe.pdf",
        )

        response = client.post(
            "/api/cv/compile",
            json={
                "cv_data": sample_cv(),
                "job_title": "Software Engineer",
                "template_name": "professional",
                "output_format": "pdf",
            },
        )

        assert response.status_code == 200
        mock_compiler.compile.assert_awaited_once()

    def test_compile_cv_invalid_format(self):
        response = client.post(
            "/api/cv/compile",
            json={
                "cv_data": sample_cv(),
                "job_title": "Software Engineer",
                "template_name": "professional",
                "output_format": "txt",
            },
        )

        assert response.status_code == 400
        assert "Unsupported output format" in response.json()["detail"]

    @patch("main.CVCompiler.from_json")
    def test_compile_cv_invalid_cv(
        self,
        mock_from_json,
    ):
        mock_from_json.side_effect = ValueError("Invalid CV data")

        response = client.post(
            "/api/cv/compile",
            json={
                "cv_data": sample_cv(),
                "job_title": "Software Engineer",
                "template_name": "professional",
                "output_format": "pdf",
            },
        )

        assert response.status_code == 400
        assert response.json()["detail"] == "Invalid CV data"

    @patch("main.CVCompiler.compile", new_callable=AsyncMock)
    @patch("main.CVCompiler")
    def test_compile_cv_internal_error(
        self,
        mock_compiler_class,
        mock_compile,
    ):
        mock_compile.side_effect = Exception("compiler failed")

        response = client.post(
            "/api/cv/compile",
            json={
                "cv_data": sample_cv(),
                "job_title": "Software Engineer",
                "template_name": "professional",
                "output_format": "pdf",
            },
        )

        assert response.status_code == 500
        assert response.json()["detail"] == (
            "Failed to compile the CV."
        )