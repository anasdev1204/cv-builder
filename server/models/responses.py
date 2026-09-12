from typing import Generic, TypeVar

from py.models.template import TemplateConfig
from pydantic import BaseModel

T = TypeVar("T")


class AIResponse(BaseModel, Generic[T]):
    result: T
    input_tokens: int
    output_tokens: int


class ErrorResponse(BaseModel):
    detail: str

class TemplateListResponse(BaseModel):
    templates: dict[str, TemplateConfig]
