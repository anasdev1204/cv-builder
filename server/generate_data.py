import json

from models.cv import CV, UserData, Address, SectionEntry
from models.requests import MatchCVRequest
from services.cv_compiler import CVCompiler

# cv = CV(
#     user_data=UserData(
#         name="John Doe",
#         email="john@example.com",
#         picture="./test_output/cv_pic.png",
#         phone_number="+44 123456789",
#         linkedin="linkedin.com/in/johndoe",
#         portfolio="johndoe.dev",
#         address=Address(
#             city="London",
#             country="UK",
#         ),
#     ),
#     sections={
#         "en": {
#             "summary": {
#                 "title": "Professional Summary",
#                 "content": (
#                     "Software engineer with experience building"
#                     "scalable web applications and APIs."
#                     "Looking for opportunities to contribute to innovative projects."
#                 )
#             } ,
#             "experience": {
#                 "title": "Professional Experience",
#                 "content": [
#                     SectionEntry(
#                         title="Software Engineer",
#                         subtitle="Company A",
#                         start_date="2024",
#                         end_date="2026",
#                         bullet_points=[
#                         "Developed Python services.",
#                         "Built REST APIs using FastAPI.",
#                         "Improved system performance by 35%.",
#                         ],
#                     ),
#                     SectionEntry(
#                         title="Software Developer Intern",
#                         subtitle="Company B",
#                         start_date="2023",
#                         end_date="2024",
#                         bullet_points=[
#                             "Implemented frontend features.",
#                             "Worked with React and TypeScript.",
#                         ],
#                     ),
#                 ]
#             },
#             "education": {
#                 "title": "Education",
#                 "content": [
#                     SectionEntry(
#                         title="BSc Computer Science",
#                         subtitle="University of Example",
#                         start_date="2021",
#                         end_date="2025",
#                         bullet_points=[
#                             "Graduated with First Class Honours."
#                         ],
#                     )
#                 ]
#             },
#             "languages": {
#                 "title": "Languages",
#                 "content": ["English", "French"]
#             },
#             "skills": {
#                 "title": "Skills",
#                 "content": ["Python", "FastAPI", "React", "TypeScript"]
#             },
#             "other_sections": {
#                 "Certifications": {
#                     "title": "Certifications",
#                     "content": [
#                         SectionEntry(
#                             title="AWS Certified Developer",
#                             subtitle="Amazon Web Services",
#                             start_date="2025",
#                             bullet_points=[],
#                         )
#                     ]
#                 }
#             }
#         }
#     },
# )

# with open("test_output/cv.json", "w") as f:
#     data_dict = CVCompiler.to_json(cv)
#     f.write(
#         json.dumps(data_dict, indent=4)
#     )
