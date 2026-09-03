from pathlib import Path
from tempfile import TemporaryDirectory
import subprocess
from turtle import st
from fastapi.responses import FileResponse

from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION

from models.cv import CV, CvSections, SectionEntry, SectionMeta, UserData

from pathlib import Path

import yaml

from models.template import (
    TemplateConfig,
    SectionRendererConfig,
    EntryConfig
)


class TemplateLoader:

    def __init__(self, config_directory: str = "configs"):
        self.config_directory = Path(config_directory)

    def load(self, template: str) -> TemplateConfig:

        path = self.config_directory / f"{template}.yaml"

        if not path.exists():
            raise ValueError(
                f"Template '{template}' not found: {path}"
            )

        with path.open("r", encoding="utf-8") as file:
            data = yaml.safe_load(file) or {}

        try:
            return TemplateConfig.model_validate(data)
        except Exception as e:
            raise ValueError(
                f"Invalid configuration for template '{template}': {e}"
            ) from e


class CVCompiler:
    def __init__(
        self,
        output_directory: str = "test_output",
        config_directory: str = "configs",
        template_config: TemplateConfig | None = None,
    ):
        self.output_directory = Path(output_directory)
        self.output_directory.mkdir(
            parents=True,
            exist_ok=True
        )

        self.template_loader = TemplateLoader(
            config_directory
        )

        self.template_config = template_config

    async def compile(
        self,
        cv: CV,
        template: str = "professional",
        output_format: str = "pdf",
        selected_version: str = "en",
        job_title: str = "Unknown",
        local: bool = True,
    ):
        docx_path = self._compile_docx(
            cv=cv,
            job_title=job_title,
            template=template,
            selected_version=selected_version,
        )

        if output_format == "docx":
            output_path = docx_path

        elif output_format == "pdf":
            output_path = self._convert_to_pdf(docx_path)

        else:
            raise ValueError(
                f"Unsupported format: {output_format}"
            )

        if local:
            return str(output_path)

        return self._compile_doc_url(output_path)

    def _compile_docx(
        self,
        cv: CV,
        job_title: str,
        template: str,
        selected_version: str,
    ) -> Path:
        
        if self.template_config is not None:
            config = self.template_config
        else:
            config = self.template_loader.load(template)

        document = Document()

        user_data = cv.user_data

        if selected_version not in cv.sections:
            raise ValueError(
                f"Selected version '{selected_version}' not found."
            )

        cv_version = cv.sections[selected_version]

        self._configure_page(
            document,
            config,
        )

        self._configure_styles(
            document,
            config,
        )

        self._add_header(
            document,
            user_data,
            job_title,
            config,
        )

        self._render_all_sections(
            document,
            cv_version,
            config,
        )

        output_path = (
            self.output_directory
            / f"{self._safe_filename(user_data.name)}.docx"
        )

        document.save(output_path)

        return output_path

    def _configure_page(
        self,
        document: Document,
        config: TemplateConfig,
    ):

        margins = config.page.margins

        section = document.sections[0]

        section.top_margin = Inches(margins.top)
        section.bottom_margin = Inches(margins.bottom)
        section.left_margin = Inches(margins.left)
        section.right_margin = Inches(margins.right)

    def _configure_styles(
        self,
        document: Document,
        config: TemplateConfig,
    ):

        normal = document.styles["Normal"]

        normal.font.name = config.font.family
        normal.font.size = Pt(config.font.size)

        normal.font.bold = config.font.bold
        normal.font.italic = config.font.italic

    def _add_header(
        self,
        document: Document,
        user_data: UserData,
        job_title: str,
        config: TemplateConfig,
    ):

        alignment_map = {
            "left": WD_ALIGN_PARAGRAPH.LEFT,
            "center": WD_ALIGN_PARAGRAPH.CENTER,
            "right": WD_ALIGN_PARAGRAPH.RIGHT,
        }

        alignment = alignment_map[
            config.header.alignment
        ]

        if user_data.picture:
            try:
                document.add_picture(
                    user_data.picture,
                    width=Inches(1.0)
                )
                last_paragraph = document.paragraphs[-1] 
                last_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            except Exception as e:
                print(f"Error adding picture: {e}")


        paragraph = document.add_paragraph()

        paragraph.alignment = alignment

        name_config = config.header.name

        name = paragraph.add_run(user_data.name)

        name.bold = name_config.bold
        name.italic = name_config.italic
        name.font.size = Pt(name_config.size)

        job_title_paragraph = document.add_paragraph(job_title)

        job_title_paragraph.alignment = alignment
        
        job_title_paragraph_run = job_title_paragraph.runs[0]
        job_title_paragraph_run.bold = config.header.name.bold
        job_title_paragraph_run.italic = config.header.name.italic
        job_title_paragraph_run.font.size = Pt(config.header.name.size)

        contact = []

        if user_data.email:
            contact.append(user_data.email)

        if user_data.phone_number:
            contact.append(user_data.phone_number)

        if user_data.address:
            contact.append(
                f"{user_data.address.city}, "
                f"{user_data.address.country}"
            )

        if user_data.linkedin:
            contact.append(user_data.linkedin)

        if user_data.portfolio:
            contact.append(user_data.portfolio)

        if contact:

            paragraph = document.add_paragraph()

            paragraph.alignment = alignment

            contact_config = config.header.contact

            run = paragraph.add_run(
                contact_config.separator.join(contact)
            )

            run.bold = contact_config.bold
            run.italic = contact_config.italic
            run.font.size = Pt(contact_config.size)

    def _render_all_sections(
        self,
        document: Document,
        cv_sections: CvSections,
        config: TemplateConfig,
    ):

        sections = cv_sections

        for section_name, data in sections.__dict__.items():
            if data is None:
                continue

            if isinstance(data, SectionMeta):
                title = data.title
                content = data.content 

                if not content:
                    continue

                section_config = config.sections.get(
                    section_name
                )

                if section_config is None:
                    section_config = SectionRendererConfig(
                        renderer=self._infer_renderer(
                            content
                        )
                    )

                self._render_section(
                    document,
                    title,
                    content,
                    section_config,
                    config,
                )

            elif isinstance(data, dict):
                for _, sub_data in data.items():
                    if not sub_data:
                        continue

                    title = sub_data.title
                    content = sub_data.content

                    section_config = SectionRendererConfig(
                        renderer=self._infer_renderer(
                            content
                        )
                    )

                    self._render_section(
                        document,
                        title,
                        content,
                        section_config,
                        config,
                    )

    def _infer_renderer(self, content) -> str:
        if isinstance(content, str):
            return "paragraph"

        if isinstance(content, list):

            if not content:
                return "paragraph"

            if isinstance(content[0], SectionEntry):
                return "entries"

            if isinstance(content[0], str):
                return "inline_list"

        raise ValueError(
            f"Cannot determine renderer for content type: "
            f"{type(content)}"
        )

    def _render_section(
        self,
        document: Document,
        title: str,
        content: str | list[SectionEntry] | list[str],
        section_config: SectionRendererConfig,
        config: TemplateConfig,
    ):

        renderer = section_config.renderer

        if renderer == "paragraph":

            self._add_str(
                document,
                title,
                content,
                config,
            )

        elif renderer == "entries":

            entry_config = (
                section_config.entry
                or config.entry
            )

            self._add_bp(
                document,
                title,
                content,
                config,
                entry_config,
            )

        elif renderer == "inline_list":

            self._add_list_str(
                document,
                title,
                content,
                config,
            )

        else:

            raise ValueError(
                f"Unknown renderer: {renderer}"
            )
    
    def _add_str(
        self,
        document: Document,
        title: str,
        content: str,
        config: TemplateConfig,
    ):

        self._add_heading(
            document,
            title,
            config,
        )

        paragraph = document.add_paragraph(content)

        paragraph.paragraph_format.space_before = Pt(
            config.section.space_before
        )

        paragraph.paragraph_format.space_after = Pt(
            config.section.space_after
        )

    def _add_bp(
        self,
        document: Document,
        title: str,
        content: list[SectionEntry],
        config: TemplateConfig,
        entry_config: EntryConfig,
    ):

        self._add_heading(
            document,
            title,
            config,
        )

        for entry in content:

            self._add_entry(
                document,
                entry,
                entry_config,
            )

    def _add_list_str(
        self,
        document: Document,
        title: str,
        content: list[str],
        config: TemplateConfig,
    ):

        if not content:
            return

        self._add_heading(
            document,
            title,
            config,
        )

        paragraph = document.add_paragraph()

        paragraph.paragraph_format.space_before = Pt(
            config.section.space_before
        )

        paragraph.paragraph_format.space_after = Pt(
            config.section.space_after
        )

        run = paragraph.add_run(
            config.list.separator.join(content)
        )

        run.font.size = Pt(
            config.list.size
        )

    def _add_heading(
        self,
        document: Document,
        title: str,
        config: TemplateConfig,
    ):

        heading = config.section.heading

        paragraph = document.add_paragraph()

        paragraph.paragraph_format.space_before = Pt(
            heading.space_before
        )

        paragraph.paragraph_format.space_after = Pt(
            heading.space_after
        )

        if heading.uppercase:
            title = title.upper()

        run = paragraph.add_run(title)

        run.bold = heading.bold
        run.italic = heading.italic
        run.underline = heading.underline

        run.font.size = Pt(heading.size)

    def _add_entry(
        self,
        document: Document,
        entry: SectionEntry,
        config: EntryConfig,
    ):

        paragraph = document.add_paragraph()

        paragraph.paragraph_format.space_before = Pt(
            config.space_before
        )

        title_config = config.title

        title = paragraph.add_run(entry.title)

        title.bold = title_config.bold
        title.italic = title_config.italic
        title.font.size = Pt(title_config.size)

        if entry.subtitle:

            subtitle_config = config.subtitle

            subtitle = paragraph.add_run(
                f"{config.subtitle_separator}"
                f"{entry.subtitle}"
            )

            subtitle.bold = subtitle_config.bold
            subtitle.italic = subtitle_config.italic
            subtitle.font.size = Pt(
                subtitle_config.size
            )

        if config.show_dates:

            dates = []

            if entry.start_date:
                dates.append(entry.start_date)

            if entry.end_date:
                dates.append(entry.end_date)

            if dates:

                date_config = config.dates

                paragraph = document.add_paragraph()

                paragraph.paragraph_format.space_before = Pt(
                    date_config.space_before
                )

                paragraph.paragraph_format.space_after = Pt(
                    date_config.space_after
                )

                run = paragraph.add_run(
                    date_config.separator.join(dates)
                )

                run.bold = date_config.bold
                run.italic = date_config.italic
                run.font.size = Pt(
                    date_config.size
                )

        if config.show_bullets:

            bullet_config = config.bullets

            for bullet in entry.bullet_points:

                paragraph = document.add_paragraph(
                    style="List Bullet"
                )

                paragraph.paragraph_format.left_indent = (
                    Inches(bullet_config.indent)
                )

                if bullet_config.hanging_indent is not None:

                    paragraph.paragraph_format.first_line_indent = (
                        Inches(-bullet_config.hanging_indent)
                    )

                paragraph.paragraph_format.space_before = Pt(
                    bullet_config.space_before
                )

                paragraph.paragraph_format.space_after = Pt(
                    bullet_config.space_after
                )

                run = paragraph.add_run(bullet)

                run.font.size = Pt(
                    bullet_config.size
                )

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

    def _compile_doc_url(self, path: Path) -> FileResponse:
        if not path.exists():
            raise FileNotFoundError(f"Compiled file not found: {path}")

        return FileResponse(
            path=path,
            filename=path.name,
            media_type=(
                "application/pdf"
                if path.suffix.lower() == ".pdf"
                else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ),
        )

    @staticmethod
    def to_entries(cv: CV, selected_version: str) -> list[str]:
        entries = []

        for version, sections in cv.sections.items():
            if selected_version and version != selected_version:
                continue

            for section_name, data in sections.__dict__.items():
                if data is None:
                    continue

                if isinstance(data, SectionMeta):
                    content = data.content

                    if isinstance(content, str):
                        entries.append(content)

                    elif isinstance(content, list):
                        for item in content:
                            if isinstance(item, SectionEntry):
                                entries.extend(item.bullet_points)
                            elif isinstance(item, str):
                                entries.append(item)

                elif isinstance(data, dict):
                    for _, sub_data in data.items():
                        if not sub_data:
                            continue

                        content = sub_data.content

                        if isinstance(content, str):
                            entries.append(content)

                        elif isinstance(content, list):
                            for item in content:
                                if isinstance(item, SectionEntry):
                                    entries.extend(item.bullet_points)
                                elif isinstance(item, str):
                                    entries.append(item)

        return entries

    @staticmethod
    def to_json(sc: CV) -> dict:
        return sc.model_dump()
        
    @staticmethod
    def from_json(json_data: dict) -> CV:
        return CV.model_validate(json_data)
    
    @staticmethod
    def _safe_filename(
        name: str
    ) -> str:

        return "".join(
            c for c in name
            if c.isalnum() or c in " _-"
        ).strip()