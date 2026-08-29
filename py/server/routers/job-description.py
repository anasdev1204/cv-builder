from fastapi import APIRouter

from models.requests import (
    JobDescriptionRequest,
    JobDescriptionAnalysis
)

router = APIRouter()


@router.post(
    "/analyze",
    response_model=JobDescriptionAnalysis
)
async def analyze_job_description(
    request: JobDescriptionRequest
):

    # TODO:
    # analysis = job_analyzer.analyze(
    #     request.job_description
    # )

    return JobDescriptionAnalysis(
        keywords=[],
        skills=[]
    )