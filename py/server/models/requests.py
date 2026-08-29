from typing import Literal
from pydantic import BaseModel

from .cv import CV


class CompileCVRequest(BaseModel):
    user_id: str

    format: Literal["pdf", "docx"] = "pdf"

    template: str = "professional"

    cv: CV | None = None


class CompileCVResponse(BaseModel):
    success: bool
    format: str
    file_url: str | None = None
    file_path: str | None = None


class JobDescriptionRequest(BaseModel):
    job_description: str


class JobKeyword(BaseModel):
    keyword: str
    category: str
    importance: float
    occurrences: int = 0


class JobDescriptionAnalysis(BaseModel):
    keywords: list[JobKeyword]
    skills: list[JobKeyword]
    summary: str | None = None


class SuggestCVRequest(BaseModel):
    user_id: str
    job_analysis: JobDescriptionAnalysis


class EvaluateCVRequest(BaseModel):
    user_id: str
    job_analysis: JobDescriptionAnalysis
    cv: CV | None = None