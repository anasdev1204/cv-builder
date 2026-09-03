import asyncio

from fastapi import APIRouter, HTTPException, Request, status
from openai import (
    APIError,
    APITimeoutError,
    AsyncOpenAI,
    RateLimitError,
)
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware

from models.cv import CV
from models.jd import ParsedJD
from models.requests import (
    CompileCVRequest,
    MatchCVRequest,
    ParseJDRequest,
)
from models.responses import AIResponse, ErrorResponse
from services.cv_compiler import CVCompiler
from services.cv_jd_matcher import match_cv_entries
from services.jd_parser import parse_job_description

import os
from dotenv import load_dotenv
load_dotenv()


router = APIRouter(prefix="/api", tags=["CV"])
limiter = Limiter(key_func=get_remote_address)


app = FastAPI(
    title="CV Builder API",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)

app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        os.getenv("ALLOWED_HOST", "localhost")
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("ALLOWED_ORIGIN", "https://yourdomain.com"),
    ],
    allow_credentials=False,
    allow_methods=[
        "GET",
        "POST",
    ],
    allow_headers=[
        "Content-Type",
    ],
)

app.include_router(router)

def get_openai_client(api_key: str) -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=api_key,
        timeout=30.0,
        max_retries=1,
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
    response_model=AIResponse[ParsedJD],
    responses={
        429: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
        504: {"model": ErrorResponse},
    },
)
@limiter.limit("10/minute")
async def parse_jd(request: Request, body: ParseJDRequest):
    client = get_openai_client(body.openai_api_key)

    try:
        result, input_tokens, output_tokens = await asyncio.wait_for(
            parse_job_description(
                client=client,
                jd=body.job_description,
                model=body.model,
            ),
            timeout=35,
        )

        return {
            "result": result,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        }

    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The job description analysis timed out.",
        )

    except Exception as exc:
        raise handle_openai_error(exc)


@router.post(
    "/cv/match",
    response_model=AIResponse[dict],
    responses={
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        502: {"model": ErrorResponse},
        504: {"model": ErrorResponse},
    },
)
@limiter.limit("10/minute")
async def match_cv(request: Request, body: MatchCVRequest):
    try:
        cv = CVCompiler.from_json(body.cv_raw)
        cv_entries = CVCompiler.to_entries(cv)

        client = get_openai_client(body.openai_api_key)

        result, input_tokens, output_tokens = await asyncio.wait_for(
            match_cv_entries(
                client=client,
                parsed_jd=body.parsed_jd,
                cv_entries=cv_entries,
                model=body.model,
            ),
            timeout=35,
        )

        return {
            "result": result.model_dump(),
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
        }

    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="The CV matching operation timed out.",
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception as exc:
        raise handle_openai_error(exc)


@router.post(
    "/cv/compile",
    responses={
        400: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
@limiter.limit("30/minute")
async def compile_cv_endpoint(
    request: Request,
    body: CompileCVRequest,
):
    try:
        cv = CVCompiler.from_json(body.cv_data)

        compiler = CVCompiler(
            template_config=body.template_config,
        )

        return await compiler.compile(
            cv=cv,
            job_title=body.job_title,
            template=body.template_name,
            output_format=body.output_format,
            local=False,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to compile the CV.",
        )


@router.get(
    "/health",
    response_model=dict,
)
async def health():
    return {"status": "ok"}