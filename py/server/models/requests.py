from pydantic import BaseModel, Field
from models.cv import CV
from models.jd import ParsedJD
from models.template import TemplateConfig

class ParseJDRequest(BaseModel):
    job_description: str = Field(..., min_length=20, max_length=50_000)
    openai_api_key: str = Field(..., min_length=20)
    model: str = Field(..., min_length=1, max_length=100)


class MatchCVRequest(BaseModel):
    parsed_jd: ParsedJD
    cv_raw: dict
    openai_api_key: str = Field(..., min_length=20)
    model: str = Field(..., min_length=1, max_length=100)


class CompileCVRequest(BaseModel):
    cv_data: dict
    job_title: str = Field(..., min_length=1, max_length=100)
    template_name: str = Field(..., min_length=1, max_length=100)
    template_config: TemplateConfig | None = None
    output_format: str = Field(..., min_length=1, max_length=20)

class ErrorResponse(BaseModel):
    detail: str