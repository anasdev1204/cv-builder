from pydantic import BaseModel, Field

class CVEntryMatch(BaseModel):
    cv_entry_index: int
    matched_keywords: list[str] = Field(default_factory=list)
    matched_technical_skills: list[str] = Field(default_factory=list)
    matched_soft_skills: list[str] = Field(default_factory=list)
    matched_tools_and_technologies: list[str] = Field(default_factory=list)
    matched_qualifications: list[str] = Field(default_factory=list)
    matched_experience_requirements: list[str] = Field(default_factory=list)
    matched_domain_terms: list[str] = Field(default_factory=list)


class CVMatchResult(BaseModel):
    entries: list[CVEntryMatch] = Field(default_factory=list)

