from typing import Any
from pydantic import BaseModel, Field


class Address(BaseModel):
    country: str
    city: str


class UserData(BaseModel):
    name: str
    email: str
    phoneNumber: str | None = None
    linkedin: str | None = None
    portfolio: str | None = None
    address: Address | None = None
    otherDetails: dict[str, Any] = Field(default_factory=dict)


class SectionEntry(BaseModel):
    title: str
    subtitle: str
    startDate: str | None = None
    endDate: str | None = None
    bulletPoints: list[str] = Field(default_factory=list)

class CvSections(BaseModel):
    summary: str | None = None
    experience: dict[str, list[SectionEntry]] = Field(default_factory=dict)
    education: dict[str, list[SectionEntry]] = Field(default_factory=dict)
    languages: list[str] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)
    otherSections: dict[str, dict[str, list[SectionEntry]]] = Field(
        default_factory=dict
    )


class CV(BaseModel):
    userData: UserData
    sections: CvSections