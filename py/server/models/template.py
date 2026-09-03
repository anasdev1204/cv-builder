from typing import Literal

from pydantic import BaseModel, Field


class MarginsConfig(BaseModel):
    top: float = 0.55
    bottom: float = 0.55
    left: float = 0.65
    right: float = 0.65


class PageConfig(BaseModel):
    margins: MarginsConfig = Field(default_factory=MarginsConfig)


class FontConfig(BaseModel):
    family: str = "Arial"
    size: float = 9.5
    bold: bool = False
    italic: bool = False
    underline: bool = False
    color: str = "#000000"
    character_spacing: float = 0


class NameConfig(FontConfig):
    size: float = 20
    bold: bool = True


class ContactConfig(FontConfig):
    size: float = 9
    separator: str = " | "

class JobTitleConfig(FontConfig):
    size: float = 10.5
    bold: bool = True

    
class HeaderConfig(BaseModel):
    alignment: Literal["left", "center", "right"] = "center"

    name: NameConfig = Field(default_factory=NameConfig)
    contact: ContactConfig = Field(default_factory=ContactConfig)
    job_title: JobTitleConfig = Field(default_factory=JobTitleConfig)

    show_picture: bool = False
    picture_size: float = 1.0

    space_before: float = 0
    space_after: float = 8

    show_divider: bool = False
    divider_thickness: float = 0.5
    divider_color: str = "#000000"


class HeadingConfig(BaseModel):
    size: float = 10.5
    bold: bool = True
    italic: bool = False
    uppercase: bool = False
    underline: bool = False
    color: str = "#000000"

    space_before: float = 6
    space_after: float = 3

    show_divider: bool = False
    divider_thickness: float = 0.5
    divider_color: str = "#000000"


class DateConfig(FontConfig):
    size: float = 8.5
    bold: bool = False
    italic: bool = True
    color: str = "#000000"

    separator: str = " – "

    format: Literal[
        "year",
        "month_year",
        "full_date",
    ] = "year"

    space_before: float = 0
    space_after: float = 1

    show_start_date: bool = True
    show_end_date: bool = True

    current_label: str = "Present"


class BulletConfig(BaseModel):
    symbol: str = "•"

    size: float = 9.5
    indent: float = 0.2
    hanging_indent: float | None = None

    space_before: float = 0
    space_after: float = 3

    line_spacing: float = 1.0

    alignment: Literal["left", "justify"] = "left"

class EntryConfig(BaseModel):
    layout: Literal["stacked", "compact", "inline"] = "stacked"

    space_before: float = 3
    space_after: float = 5

    title: FontConfig = Field(
        default_factory=lambda: FontConfig(
            size=9.5,
            bold=True,
        )
    )

    subtitle: FontConfig = Field(
        default_factory=lambda: FontConfig(
            size=9.5,
        )
    )

    subtitle_separator: str = " — "

    dates: DateConfig = Field(default_factory=DateConfig)

    bullets: BulletConfig = Field(default_factory=BulletConfig)

    show_dates: bool = True
    show_bullets: bool = True

    show_subtitle: bool = True

    title_position: Literal["left", "center", "right"] = "left"
    date_position: Literal["left", "right"] = "right"


class ListConfig(BaseModel):
    separator: str = " • "
    size: float = 9.5
    font: FontConfig = Field(default_factory=FontConfig)

    space_before: float = 0
    space_after: float = 3

    alignment: Literal["left", "center", "right"] = "left"

class SectionRendererConfig(BaseModel):
    renderer: Literal[
        "paragraph",
        "entries",
        "inline_list",
    ]

    entry: EntryConfig | None = None

    separator: str | None = None

    show_heading: bool = True

    space_before: float | None = None
    space_after: float | None = None


class SectionConfig(BaseModel):
    heading: HeadingConfig = Field(default_factory=HeadingConfig)

    space_before: float = 0
    space_after: float = 5

    renderer: SectionRendererConfig


class TemplateConfig(BaseModel):
    page: PageConfig = Field(default_factory=PageConfig)

    font: FontConfig = Field(default_factory=FontConfig)

    header: HeaderConfig = Field(default_factory=HeaderConfig)

    section: SectionConfig = Field(default_factory=SectionConfig)

    entry: EntryConfig = Field(default_factory=EntryConfig)

    list: ListConfig = Field(default_factory=ListConfig)

    sections: dict[str, SectionRendererConfig] = Field(
        default_factory=dict
    )