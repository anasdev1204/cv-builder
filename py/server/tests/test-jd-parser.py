import json

from services.jd_parser import parse_job_description
from pathlib import Path

dir_path = Path(__file__).parent / "../test_data"
output_path = Path(__file__).parent / "../test_output"

parsed_jobs = ["job4.txt", "job1.txt"]

async def main():
    for file_path in dir_path.iterdir():
        if file_path.name in parsed_jobs:
            print(f"Skipping already parsed job description: {file_path.name}")
            continue
        if file_path.is_file() and file_path.suffix == ".txt":
            with open(file_path, "r") as f:
                jd = f.read()
                parsed_jd, input_tokens, output_tokens = await parse_job_description(jd, "gpt-5.4-mini")
                print(f"Parsed job description from {file_path.name}:")
                with open(output_path / f"{file_path.stem}_parsed.json", "w") as out_f:
                    json_data = json.loads(parsed_jd)
                    json.dump(json_data, out_f)

                with open(output_path / f"{file_path.stem}_tokens.txt", "w") as token_f:
                    token_f.write(f"Input tokens: {input_tokens}\n")
                    token_f.write(f"Output tokens: {output_tokens}\n")
                break

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())