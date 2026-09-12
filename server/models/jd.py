from pydantic import BaseModel, Field


class ParsedJD(BaseModel):
    job_title: str | None = None
    seniority: str | None = None
    technical_skills: list[list[str]] | None = Field(default_factory=list)
    soft_skills: list[list[str]] | None= Field(default_factory=list)
    tools_and_technologies: list[list[str]] | None = Field(default_factory=list)
    qualifications: list[list[str]] | None = Field(default_factory=list)
    experience_requirements: list[list[str]] | None = Field(default_factory=list)
    domain_terms: list[str] | None = Field(default_factory=list)
    keywords: list[str] | None = Field(default_factory=list)

