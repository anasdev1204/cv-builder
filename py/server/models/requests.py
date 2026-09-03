from models.jd import ParsedJD
from models.template import TemplateConfig
from pydantic import BaseModel, Field, field_validator

ALLOWED_MODELS = {
    "gpt-5.4-mini",
    "gpt-5.4",
}


class ParseJDRequest(BaseModel):
    job_description: str = Field(
        ...,
        min_length=20,
        max_length=6_000,
    )
    openai_api_key: str = Field(
        ...,
        min_length=20,
        max_length=500,
    )
    model: str = Field(..., min_length=1, max_length=50)

    @field_validator("model")
    @classmethod
    def validate_model(cls, value: str) -> str:
        if value not in ALLOWED_MODELS:
            raise ValueError("Unsupported model.")
        return value


class MatchCVRequest(BaseModel):
    parsed_jd: ParsedJD
    cv_raw: dict
    openai_api_key: str = Field(
        ...,
        min_length=20,
        max_length=500,
    )
    selected_version: str = Field(..., min_length=1, max_length=50)
    chosen_model: str = Field(..., min_length=1, max_length=50)

    @field_validator("chosen_model")
    @classmethod
    def validate_model(cls, value: str) -> str:
        if value not in ALLOWED_MODELS:
            raise ValueError("Unsupported model.")
        return value


class CompileCVRequest(BaseModel):
    cv_data: dict
    job_title: str = Field(..., min_length=1, max_length=200)
    template_name: str = Field(..., min_length=1, max_length=100)
    template_config: TemplateConfig | None = None
    output_format: str = Field(..., min_length=1, max_length=10)

    @field_validator("output_format")
    @classmethod
    def validate_output_format(cls, value: str) -> str:
        value = value.lower()

        if value not in {"pdf", "docx"}:
            raise ValueError(
                "Supported output formats are 'pdf' and 'docx'."
            )

        return value