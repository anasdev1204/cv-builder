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


class NameConfig(BaseModel):
    size: float = 20
    bold: bool = True
    italic: bool = False


class ContactConfig(BaseModel):
    size: float = 9
    bold: bool = False
    italic: bool = False
    separator: str = " | "


class HeaderConfig(BaseModel):
    alignment: Literal["left", "center", "right"] = "center"
    name: NameConfig = Field(default_factory=NameConfig)
    contact: ContactConfig = Field(default_factory=ContactConfig)


class HeadingConfig(BaseModel):
    size: float = 10.5
    bold: bool = True
    italic: bool = False
    uppercase: bool = False
    underline: bool = False

    space_before: float = 6
    space_after: float = 3


class SectionConfig(BaseModel):
    heading: HeadingConfig = Field(default_factory=HeadingConfig)

    space_before: float = 0
    space_after: float = 5


class DateConfig(BaseModel):
    size: float = 8.5
    bold: bool = False
    italic: bool = True
    separator: str = " – "

    space_before: float = 0
    space_after: float = 1


class BulletConfig(BaseModel):
    size: float = 9.5
    indent: float = 0.2
    hanging_indent: float | None = None

    space_before: float = 0
    space_after: float = 3


class EntryConfig(BaseModel):
    layout: Literal["stacked", "compact"] = "stacked"

    space_before: float = 3

    title: FontConfig = Field(
        default_factory=lambda: FontConfig(
            family="Arial",
            size=9.5,
            bold=True,
        )
    )

    subtitle: FontConfig = Field(
        default_factory=lambda: FontConfig(
            family="Arial",
            size=9.5,
        )
    )

    subtitle_separator: str = " — "

    dates: DateConfig = Field(default_factory=DateConfig)

    bullets: BulletConfig = Field(default_factory=BulletConfig)

    show_dates: bool = True
    show_bullets: bool = True


class ListConfig(BaseModel):
    separator: str = " • "
    size: float = 9.5


class SectionRendererConfig(BaseModel):
    renderer: Literal[
        "paragraph",
        "entries",
        "inline_list",
    ]

    # Allows individual sections to override the general entry config
    entry: EntryConfig | None = None

    separator: str | None = None


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