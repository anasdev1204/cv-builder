from dotenv import load_dotenv
from openai import AsyncOpenAI

from models.cv import CV
from models.jd import ParsedJD
from models.cvmatch import CVMatchResult

load_dotenv()

async def match_cv_entries(
    client: AsyncOpenAI,
    parsed_jd: ParsedJD,
    cv_entries: list[str],
    model: str
) -> tuple[CVMatchResult, int, int]:

    prompt = f"""
You are an ATS-style CV matching system.

Given a parsed job description and a list of CV entries, identify which
requirements and keywords are supported by each CV entry.

For each CV entry, return the indices and exact text of the JD requirements
that are supported by that entry in a json nested list of lists where for an entry that supports multiple requirements, the inner list contains all the indices of the requirements that are supported by that entry in the following format:

[
  [
    "technical_skills.0",
    "soft_skills.2"
  ],
  [
    "tools_and_technologies.1"
  ]
]

Matching rules:
- Exact textual matches should be recognized.
- Recognize grammatical variations such as:
  "database development" ↔ "developed databases"
- Recognize common morphological variations such as:
  "develop" ↔ "developed" ↔ "development"
- Do not infer a skill merely because it is conceptually related.
- Do not assume a technology was used unless the CV entry supports it.
- Prefer conservative matching over speculative matching.
- A CV entry may match multiple requirements.
- Do not create requirements that are not present in the parsed JD.

Parsed JD:
{parsed_jd}

CV entries:
{chr(10).join(f"{i}: {entry}" for i, entry in enumerate(cv_entries))}
"""

    response = await client.responses.create(
        model=model,
        text={
            "format": {
                "type": "json_object"
            },
            "verbosity": "medium"
        },
        input=[
            {
                "role": "system",
                "content": prompt
            }
        ],
        reasoning={
            "effort": "low",
            "mode": "standard",
            "summary": "auto"
        },
    )

    message = next((item for item in response.output if item.type == "message"), None)
    message_content = message.content[0] if message and message.content else None

    if (
        response.status == "incomplete"
        and response.incomplete_details.reason == "max_output_tokens"
    ):
        raise RuntimeError("The response was truncated before the JSON completed.")

    if message_content and message_content.type == "refusal":
        print(message_content.refusal)

    if (
        response.status == "incomplete"
        and response.incomplete_details.reason == "content_filter"
    ):
        raise RuntimeError("The response was interrupted by the content filter.")

    result = CVMatchResult.model_validate_json(response.output_text)
    return result, response.usage.input_tokens, response.usage.output_tokens