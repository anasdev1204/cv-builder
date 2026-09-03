from fastapi import APIRouter, HTTPException, status
from openai import AsyncOpenAI, APIError, APITimeoutError, RateLimitError
import asyncio

from models.cv import CV
from models.jd import ParsedJD
from py.server.models.requests import CompileCVRequest, ErrorResponse, MatchCVRequest, ParseJDRequest
from services.cv_compiler import CVCompiler
from services.jd_parser import parse_job_description
from services.cv_jd_matcher import match_cv_entries

router = APIRouter(prefix="/api", tags=["CV"])

def get_openai_client(api_key: str) -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=api_key,
        timeout=30.0,
        max_retries=2,
    )


def handle_openai_error(exc: Exception) -> HTTPException:
    if isinstance(exc, APITimeoutError):
        return HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The OpenAI request timed out.",
        )

    if isinstance(exc, RateLimitError):
        return HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="The OpenAI API rate limit was exceeded.",
        )

    if isinstance(exc, APIError):
        return HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The OpenAI API returned an error.",
        )

    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="An unexpected error occurred.",
    )

@router.post(
    "/job-description/parse",
    response_model=ParsedJD,
    responses={
        429: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
        504: {"model": ErrorResponse},
    },
)

async def parse_jd(request: ParseJDRequest):
    client = get_openai_client(request.openai_api_key)

    try:
        return await asyncio.wait_for(
            parse_job_description(
                client=client,
                jd=request.job_description,
                model=request.model,
            ),
            timeout=35,
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The job description analysis timed out.",
        )
    except Exception as exc:
        raise handle_openai_error(exc)

@router.post(
    "/cv/match",
    response_model=dict,
    responses={
        429: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
        504: {"model": ErrorResponse},
    },
)
async def match_cv(request: MatchCVRequest):
    client = get_openai_client(request.openai_api_key)

    cv = CVCompiler.from_json(request.cv_raw)
    cv_entries = CVCompiler.to_entries(cv)

    try:
        result = await asyncio.wait_for(
            match_cv_entries(
                client=client,
                parsed_jd=request.parsed_jd,
                cv_entries=cv_entries,
                model=request.model
            ),
            timeout=35,
        )

        return result.model_dump()

    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The CV matching operation timed out.",
        )
    except Exception as exc:
        raise handle_openai_error(exc)


@router.post(
    "/cv/compile",
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def compile_cv_endpoint(request: CompileCVRequest):
    try:
        output_format = request.output_format.lower()

        if output_format not in ["pdf", "docx"]:
            raise ValueError(
                f"Unsupported output format: {request.output_format}. "
                "Supported formats are 'pdf' and 'docx'."
            )

        cv = CVCompiler.from_json(request.cv_data)

        compiler = CVCompiler(
            template_config=request.template_config,
        )

        return await compiler.compile(
            cv=cv,
            job_title=request.job_title,
            template=request.template_name,
            output_format=output_format,
            local=False,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to compile the CV.",
        )
    
@router.get("/health", response_model=dict, responses={500: {"model": ErrorResponse}})
async def health():
    return {"status": "ok"}