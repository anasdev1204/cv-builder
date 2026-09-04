export type ParsedJD = {
    job_title: string | null;
    seniority: string | null;
    technical_skills: string[][] | null;
    soft_skills: string[][] | null;
    tools_and_technologies: string[][] | null;
    qualifications: string[][] | null;
    experience_requirements: string[][] | null;
    domain_terms: string[] | null;
    keywords: string[] | null;
}

interface MarginsConfig {
  top: number;
  bottom: number;
  left: number;
  right: number;
}
interface PageConfig {
  margins: MarginsConfig;
}
interface FontConfig {
  family: string;
  size: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string;
  character_spacing: number;
}
interface NameConfig extends FontConfig {
  size: number;
  bold: boolean;
}
interface ContactConfig extends FontConfig {
  size: number;
  separator: string;
}
interface JobTitleConfig extends FontConfig {
  size: number;
  bold: boolean;
}
type Alignment = "left" | "center" | "right";
interface HeaderConfig {
  alignment: Alignment;

  name: NameConfig;
  contact: ContactConfig;
  job_title: JobTitleConfig;

  show_picture: boolean;
  picture_size: number;

  space_before: number;
  space_after: number;

  show_divider: boolean;
  divider_thickness: number;
  divider_color: string;
}
interface HeadingConfig {
  size: number;
  bold: boolean;
  italic: boolean;
  uppercase: boolean;
  underline: boolean;
  color: string;

  space_before: number;
  space_after: number;

  show_divider: boolean;
  divider_thickness: number;
  divider_color: string;
}
type DateFormat = "year" | "month_year" | "full_date";
interface DateConfig extends FontConfig {
  size: number;
  bold: boolean;
  italic: boolean;
  color: string;

  separator: string;
  format: DateFormat;

  space_before: number;
  space_after: number;

  show_start_date: boolean;
  show_end_date: boolean;

  current_label: string;
}
interface BulletConfig {
  symbol: string;

  size: number;
  indent: number;
  hanging_indent: number | null;

  space_before: number;
  space_after: number;

  line_spacing: number;

  alignment: "left" | "justify";
}
type EntryLayout = "stacked" | "compact" | "inline";
interface EntryConfig {
  layout: EntryLayout;

  space_before: number;
  space_after: number;

  title: FontConfig;
  subtitle: FontConfig;

  subtitle_separator: string;

  dates: DateConfig;
  bullets: BulletConfig;

  show_dates: boolean;
  show_bullets: boolean;
  show_subtitle: boolean;

  title_position: Alignment;
  date_position: "left" | "right";
}
interface ListConfig {
  separator: string;
  size: number;
  font: FontConfig;

  space_before: number;
  space_after: number;

  alignment: Alignment;
}
type SectionRenderer =
  | "paragraph"
  | "entries"
  | "inline_list";
interface SectionRendererConfig {
  renderer: SectionRenderer;

  entry: EntryConfig | null;

  separator: string | null;

  show_heading: boolean;

  space_before: number | null;
  space_after: number | null;
}
interface SectionConfig {
  heading: HeadingConfig;

  space_before: number;
  space_after: number;

  renderer: SectionRendererConfig;
}

export type TemplateConfig ={
  page: PageConfig;
  font: FontConfig;
  header: HeaderConfig;
  section: SectionConfig;
  entry: EntryConfig;
  list: ListConfig;
  sections: Record<string, SectionRendererConfig>;
}

export type CVEntryMatch = {
  cv_entry_index: number;
  matched_keywords: string[];
  matched_technical_skills: string[];
  matched_soft_skills: string[];
  matched_tools_and_technologies: string[];
  matched_qualifications: string[];
  matched_experience_requirements: string[];
  matched_domain_terms: string[];
}

interface Address {
  country: string;
  city: string;
}
interface UserData {
  name: string;
  email: string;
  picture?: string | null;
  phone_number?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  address?: Address | null;
  other_details: Record<string, unknown>;
}
interface SectionEntry {
  title: string;
  subtitle: string;
  start_date?: string | null;
  end_date?: string | null;
  bullet_points: string[];
}
interface SectionMeta {
  title: string;
  content: string | SectionEntry[] | string[];
}
interface CvSections {
  summary: SectionMeta;
  experience: SectionMeta;
  education: SectionMeta;
  languages: SectionMeta;
  skills: SectionMeta;
  other_sections: Record<string, SectionMeta>;
}

export type CVRaw = {
  user_data: UserData;
  sections: Record<string, CvSections>;
}