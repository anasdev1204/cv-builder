from dotenv import load_dotenv
from openai import AsyncOpenAI
from models.jd import ParsedJD

load_dotenv()


async def parse_job_description(client: AsyncOpenAI, jd: str, model: str) -> tuple[ParsedJD, int, int]:
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
            "content": """
You are a job description analysis system.

Extract structured information from the job description in json format with the following attributes:

- job_title
- seniority
- technical_skills
- soft_skills
- tools_and_technologies
- qualifications
- experience_requirements
- domain_terms
- keywords

Technical skills are concrete technical capabilities such as:
Python, SQL, machine learning, REST APIs, cloud computing.

Soft skills are interpersonal or behavioral capabilities such as:
communication, leadership, teamwork, problem solving.

Tools and technologies are specific software, platforms, frameworks,
libraries, databases, cloud services, or other technologies.

Qualifications include degrees, certifications, licenses, or educational requirements.

Experience requirements describe required years, types, or areas of experience.

Domain terms describe industry-specific concepts relevant to the position.

Keywords are literal words or phrases from the job description that are
likely to be useful for ATS matching. Preserve their original wording.

For technical skills, soft skills, tools, qualifications, and experience:
importance must be one of:
- required
- preferred
- contextual

The output must be a valid JSON object with the specified attributes where each attribute is either null or a list of lists where the first element is the text and the second element is the importance like in EXAMPLE_OUTPUT.

EXAMPLE_OUTPUT:

{
    "job_title": "Software Engineer",
    "seniority": "Mid-level",
    "technical_skills": [
        ["Python", "required"],
        ["SQL", "preferred"]
    ],
    "soft_skills": [
        ["communication", "required"],
        ["teamwork", "preferred"]
    ],
    "tools_and_technologies": [
        ["Django", "required"],
        ["PostgreSQL", "preferred"]
    ],
    "qualifications": [
        ["Bachelor's degree in Computer Science", "required"],
        ["Master's degree in Computer Science", "preferred"]
    ],
    "experience_requirements": [
        ["3+ years of software development experience", "required"],
        ["Experience with cloud platforms", "preferred"]
    ],
    "domain_terms": [
        "e-commerce",
        "payment processing"
    ],
    "keywords": [
        "Python",
        "Django",
        "PostgreSQL",
        "REST APIs",
        "cloud computing"
    ]
}

Do not invent requirements that are not supported by the job description.
""",
        },
        {
            "role": "user",
            "content": jd,
        },
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

    return response.output_text, response.usage.input_tokens, response.usage.output_tokens