from typing import Any
from pydantic import BaseModel, Field


class Address(BaseModel):
    country: str
    city: str


class user_data(BaseModel):
    name: str
    email: str
    picture: str | None = None
    phone_number: str | None = None
    linkedin: str | None = None
    portfolio: str | None = None
    address: Address | None = None
    other_details: dict[str, Any] = Field(default_factory=dict)


class SectionEntry(BaseModel):
    title: str
    subtitle: str
    start_date: str | None = None
    end_date: str | None = None
    bullet_points: list[str] = Field(default_factory=list)

class SectionMeta(BaseModel):
    title: str 
    content: str | list[SectionEntry] | list[str]

class CvSections(BaseModel):
    summary: SectionMeta
    experience: SectionMeta
    education: SectionMeta
    languages: SectionMeta
    skills: SectionMeta
    other_sections: dict[str, SectionMeta] = Field(
        default_factory=dict
    )

class CV(BaseModel):
    user_data: user_data
    sections: dict[str, CvSections] = Field(default_factory=dict)