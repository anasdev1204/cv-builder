import json

from services.cv_compiler import CVCompiler
from services.cv_jd_matcher import match_cv_entries
from pathlib import Path


output_path = Path(__file__).parent / "../test_output"

parsed_jd = Path(__file__).parent / "../test_output/job2_parsed.json"
high_match_cv_path = Path(__file__).parent / "../test_output/high_match_cv.json" # High match
low_match_cv_path = Path(__file__).parent / "../test_output/low_match_cv.json" # Low match

async def main():
    with open(parsed_jd, "r") as f:
        parsed_jd_data = json.load(f)

    with open(high_match_cv_path, "r") as f:
        high_match_cv_data = CVCompiler.from_json(json.load(f))

    with open(low_match_cv_path, "r") as f:
        low_match_cv_data = CVCompiler.from_json(json.load(f))

    high_match_result, high_match_input_tokens, high_match_output_tokens = await match_cv_entries(parsed_jd_data, CVCompiler.to_entries(high_match_cv_data, "en"), "gpt-5.4-mini")
    low_match_result, low_match_input_tokens, low_match_output_tokens = await match_cv_entries(parsed_jd_data, CVCompiler.to_entries(low_match_cv_data, "en"), "gpt-5.4-mini")

    with open(output_path / "high_match_result.json", "w") as f:
        json.dump(high_match_result, f, indent=4)

    with open(output_path / "high_match_tokens.txt", "w") as f: 
        f.write(f"Input tokens: {high_match_input_tokens}\n")
        f.write(f"Output tokens: {high_match_output_tokens}\n")

    with open(output_path / "low_match_result.json", "w") as f:
        json.dump(low_match_result, f, indent=4)

    with open(output_path / "low_match_tokens.txt", "w") as f:
        f.write(f"Input tokens: {low_match_input_tokens}\n")
        f.write(f"Output tokens: {low_match_output_tokens}\n")

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())