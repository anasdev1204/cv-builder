from fastapi import APIRouter, HTTPException

from models.cv import CV
from models.requests import (
    CompileCVRequest,
    CompileCVResponse,
    SuggestCVRequest,
    EvaluateCVRequest,
)

from services.storage import CVStorage
from services.cv_compiler import CVCompiler


router = APIRouter()

storage = CVStorage()
compiler = CVCompiler()


@router.get("/{user_id}", response_model=CV)
async def get_cv(user_id: str):

    cv = await storage.get_cv(user_id)

    if cv is None:
        raise HTTPException(
            status_code=404,
            detail="CV not found"
        )

    return cv


@router.put("/{user_id}", response_model=CV)
async def update_cv(
    user_id: str,
    cv: CV
):

    await storage.save_cv(user_id, cv)

    return cv


@router.post(
    "/compile",
    response_model=CompileCVResponse
)
async def compile_cv(
    request: CompileCVRequest
):

    # If CV wasn't explicitly supplied,
    # load it from storage.
    cv = request.cv

    if cv is None:
        cv = await storage.get_cv(request.user_id)

        if cv is None:
            raise HTTPException(
                status_code=404,
                detail="CV not found"
            )

    output_path = await compiler.compile(
        cv=cv,
        template=request.template,
        output_format=request.format
    )

    return CompileCVResponse(
        success=True,
        format=request.format,
        file_path=output_path
    )


@router.post("/suggest")
async def suggest_cv(
    request: SuggestCVRequest
):

    cv = await storage.get_cv(request.user_id)

    if cv is None:
        raise HTTPException(
            status_code=404,
            detail="CV not found"
        )

    # TODO:
    # suggestion_service.generate(...)

    return {
        "status": "not_implemented"
    }


@router.post("/evaluate")
async def evaluate_cv(
    request: EvaluateCVRequest
):

    cv = request.cv

    if cv is None:
        cv = await storage.get_cv(request.user_id)

    if cv is None:
        raise HTTPException(
            status_code=404,
            detail="CV not found"
        )

    # TODO:
    # evaluator.evaluate(...)

    return {
        "status": "not_implemented"
    }