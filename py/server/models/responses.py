from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class AIResponse(BaseModel, Generic[T]):
    result: T
    input_tokens: int
    output_tokens: int


class ErrorResponse(BaseModel):
    detail: str