from pydantic import BaseModel, Field

class Requirement(BaseModel):
    text: str
    category: str
    importance: str


class ParsedJD(BaseModel):
    job_title: str | None = None
    seniority: str | None = None
    technical_skills: list[Requirement] = Field(default_factory=list)
    soft_skills: list[Requirement] = Field(default_factory=list)
    tools_and_technologies: list[Requirement] = Field(default_factory=list)
    qualifications: list[Requirement] = Field(default_factory=list)
    experience_requirements: list[Requirement] = Field(default_factory=list)
    domain_terms: list[str] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)

