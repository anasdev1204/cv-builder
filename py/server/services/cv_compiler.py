from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess

from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION

from models.cv import CV, CvSections, SectionEntry, SectionMeta, user_data


class CVCompiler:

    margins = [
        0.55,  # top
        0.55,  # bottom
        0.65,  # left
        0.65   # right
    ]

    font="Arial"
    font_size=9.5
    space_after=2

    name_font_size=20

    date_font_size=8.5
    date_space_before=0
    date_space_after=1

    bp_indent=0.2
    bp_font_size=9.5
    bp_space_before=3
    bp_space_after=3

    p_space_before=0
    p_space_after=5


    def __init__(
        self,
        output_directory: str = "generated"
    ):
        self.output_directory = Path(output_directory)
        self.output_directory.mkdir(
            parents=True,
            exist_ok=True
        )

    async def compile(
        self,
        cv: CV,
        template: str = "professional",
        output_format: str = "pdf",
        selected_version: str = "en"
    ) -> str:

        docx_path = self._compile_docx(
            cv=cv,
            template=template,
            selected_version=selected_version
        )

        if output_format == "docx":
            return str(docx_path)

        if output_format == "pdf":
            return self._convert_to_pdf(docx_path)

        raise ValueError(
            f"Unsupported format: {output_format}"
        )

    # TODO: USE TEMPLATES
    def _compile_docx(
        self,
        cv: CV,
        template: str,
        selected_version: str
    ) -> Path:

        document = Document()

        user_data = cv.user_data
        cv_sections = cv.sections

        if not selected_version in cv.sections:
            raise ValueError(
                f"Selected version '{selected_version}' not found in CV sections."
            )
        
        cv_version = cv_sections[selected_version]

        if not isinstance(cv_version, CvSections):
            raise ValueError(
                f"Selected version '{selected_version}' is not a valid CvSections instance."
            )

        self._configure_page(
            document
        )
        self._configure_styles(
            document,
        )

        self._add_header(
            document,
            user_data
        )

        if not isinstance(cv_version.summary, SectionMeta):
            raise ValueError(
                f"Summary for version '{selected_version}' is not a valid SectionMeta instance."
            )

        if not cv_version.summary.content or not isinstance(cv_version.summary.content, str):
            raise ValueError(
                f"Summary content for version '{selected_version}' is missing or not a string."
            )

        self._add_str(
            document,
            cv_version.summary.title,
            cv_version.summary.content
        )

        if not isinstance(cv_version.experience, SectionMeta):
            raise ValueError(
                f"Experience for version '{selected_version}' is not a valid SectionMeta instance."
            )

        if not cv_version.experience.content or not isinstance(cv_version.experience.content, list):
            raise ValueError(
                f"Experience content for version '{selected_version}' is missing or not a list."
            )
        
        self._add_bp(
            document,
            title=cv_version.experience.title,
            content=cv_version.experience.content
        )

        if not isinstance(cv_version.education, SectionMeta):
            raise ValueError(
                f"Education for version '{selected_version}' is not a valid SectionMeta instance."
            )

        if not cv_version.education.content or not isinstance(cv_version.education.content, list):
            raise ValueError(
                f"Education content for version '{selected_version}' is missing or not a list."
            )

        self._add_bp(
            document,
            title=cv_version.education.title,
            content=cv_version.education.content
        )

        if not isinstance(cv_version.skills, SectionMeta):
            raise ValueError(
                f"Skills for version '{selected_version}' is not a valid SectionMeta instance."
            )

        if not cv_version.skills.content or not isinstance(cv_version.skills.content, list):
            raise ValueError(
                f"Skills content for version '{selected_version}' is missing or not a list."
            )

        self._add_list_str(
            document,
            title=cv_version.skills.title,
            content=cv_version.skills.content
        )

        if not isinstance(cv_version.languages, SectionMeta):
            raise ValueError(
                f"Languages for version '{selected_version}' is not a valid SectionMeta instance."
            )

        if not cv_version.languages.content or not isinstance(cv_version.languages.content, list):
            raise ValueError(
                f"Languages content for version '{selected_version}' is missing or not a list."
            )

        self._add_list_str(
            document,
            title=cv_version.languages.title,
            content=cv_version.languages.content
        )

        for _, section in cv_version.other_sections.items():
            if not isinstance(section, SectionMeta):
                raise ValueError(
                    f"Other section is not a valid SectionMeta instance."
                )

            if not section.content or not isinstance(section.content, (str, list)):
                raise ValueError(
                    f"Other section content is missing or not a string/list."
                )

            if isinstance(section.content, str):
                self._add_str(
                    document,
                    title=section.title,
                    content=section.content
                )
            elif isinstance(section.content, list):
                first_item = section.content[0]
                if isinstance(first_item, SectionEntry):
                    self._add_bp(
                        document,
                        title=section.title,
                        content=section.content
                    )
                elif isinstance(first_item, str):
                    self._add_list_str(
                        document,
                        title=section.title,
                        content=section.content
                    )


        output_path = (
            self.output_directory /
            f"{self._safe_filename(cv.user_data.name)}.docx"
        )

        document.save(output_path)

        return output_path

    def _configure_page(
        self,
        document: Document,
    ):

        if len(self.margins) != 4:
            raise ValueError(
                "Margins must be a list of four values: [top, bottom, left, right]"
            )
        
        top_margin, bottom_margin, left_margin, right_margin = self.margins

        section = document.sections[0]

        section.top_margin = Inches(top_margin)
        section.bottom_margin = Inches(bottom_margin)
        section.left_margin = Inches(left_margin)
        section.right_margin = Inches(right_margin)

    def _configure_styles(
        self,
        document: Document,
    ):

        styles = document.styles

        normal = styles["Normal"]

        normal.font.name = self.font
        normal.font.size = Pt(self.font_size)

        normal.paragraph_format.space_after = Pt(self.space_after)

    def _add_header(
        self,
        document: Document,
        user_data: user_data
    ):

        paragraph = document.add_paragraph()

        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

        name = paragraph.add_run(user_data.name)

        name.bold = True
        name.font.size = Pt(self.name_font_size)

        contact = []

        if user_data.email:
            contact.append(user_data.email)

        if user_data.phone_number:
            contact.append(user_data.phone_number)

        if user_data.address:
            location = (
                f"{user_data.address.city}, "
                f"{user_data.address.country}"
            )

            contact.append(location)

        if user_data.linkedin:
            contact.append(user_data.linkedin)

        if user_data.portfolio:
            contact.append(user_data.portfolio)

        if contact:

            paragraph = document.add_paragraph()

            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

            paragraph.add_run(
                " | ".join(contact)
            )

    def _add_str(
        self,
        document: Document,
        title: str,
        content: str,
    ):
        
        self._add_heading(
            document,
            title
        )

        paragraph = document.add_paragraph(
            content
        )

        paragraph.paragraph_format.space_after = Pt(self.p_space_after)

    def _add_bp(
        self,
        document: Document,
        title: str,
        content: list[SectionEntry]
    ):
        self._add_heading(
            document,
            title
        )

        for e in content:
            self._add_entry(
                document,
                e
            )

    def _add_list_str(
        self,
        document: Document,
        title: str,
        content: list[str]
    ):

        if not content:
            return

        self._add_heading(
            document,
            title
        )

        paragraph = document.add_paragraph()

        paragraph.add_run(
            " • ".join(content)
        )

    def _add_heading(
        self,
        document: Document,
        title: str
    ):

        paragraph = document.add_paragraph()

        paragraph.paragraph_format.space_before = Pt(6)
        paragraph.paragraph_format.space_after = Pt(3)

        run = paragraph.add_run(title)

        run.bold = True
        run.font.size = Pt(10.5)

    def _add_entry(
        self,
        document: Document,
        entry: SectionEntry
    ):

        paragraph = document.add_paragraph()

        paragraph.paragraph_format.space_before = Pt(self.bp_space_before)

        title = paragraph.add_run(
            entry.title
        )
        title.bold = True

        if entry.subtitle:
            paragraph.add_run(
                f" — {entry.subtitle}"
            )

        dates = []

        if entry.start_date:
            dates.append(entry.start_date)

        if entry.end_date:
            dates.append(entry.end_date)

        if dates:
            date_paragraph = document.add_paragraph()
            date_paragraph.paragraph_format.space_before = Pt(self.date_space_before)
            date_paragraph.paragraph_format.space_after = Pt(self.date_space_after)
            run = date_paragraph.add_run(
                " – ".join(dates)
            )
            run.italic = True
            run.font.size = Pt(self.date_font_size)

        for bullet in entry.bullet_points:

            paragraph = document.add_paragraph(
                style="List Bullet"
            )

            paragraph.paragraph_format.left_indent = Inches(self.bp_indent)
            paragraph.paragraph_format.space_after = Pt(self.bp_space_after)

            run = paragraph.add_run(bullet)
            run.font.size = Pt(self.bp_font_size)

    def _convert_to_pdf(
        self,
        docx_path: Path
    ) -> str:

        output_directory = docx_path.parent

        subprocess.run(
            [
                "libreoffice",
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                str(output_directory),
                str(docx_path)
            ],
            check=True
        )

        pdf_path = docx_path.with_suffix(".pdf")

        return str(pdf_path)

    @staticmethod
    def _safe_filename(
        name: str
    ) -> str:

        return "".join(
            c for c in name
            if c.isalnum() or c in " _-"
        ).strip()