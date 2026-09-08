/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Box, Button, Flex, Grid, NativeSelect, Text, TextInput } from "@mantine/core";
import { useForm, type FormErrors } from "@mantine/form";
import type { TFunction } from "i18next";


import ValidatableInput from "./components/validatable-input";
import FormBlockContainer from "./components/form-block-container";
import { type CVRaw } from "@/types";

import SectionParagraphEditor from "./editors/section-paragraph-editor";
import SectionEntriesEditor from "./editors/section-entries-editor";
import SectionListEditor from "./editors/section-list-editor";
import SectionDynamic from "./editors/section-dynamic"
import { validateEntryContent } from "./validators/entry-content";

// TODO: ADD IMAGE IN USER DATA

type CVFormProps = {
	t: TFunction;
	cv: CVRaw;
	version: string | null;
	setVersion: (version: string) => void;
	addCVVersion: (version: string) => void;
	saveCV: (cv: CVRaw) => void;
};

export default function CVForm({ t, cv, version, setVersion, addCVVersion, saveCV }: CVFormProps) {
	const [validated, setValidated] = useState(false);
	const [editing, setEditing] = useState(true);
	const [, setErrors] = useState<FormErrors | null>(null);
	const [isAddingVersion, setIsAddingVersion] = useState(false);
	const [newVersionName, setNewVersionName] = useState("");
	const [newCustomSectionKey, setNewCustomSectionKey] = useState("");

	const form = useForm<CVRaw>({
		initialValues: {
			user_data: {
				name: cv?.user_data.name ?? "",
				email: cv?.user_data.email ?? "",
				picture: cv?.user_data.picture ?? null,
				phone_number: cv?.user_data.phone_number ?? null,
				linkedin: cv?.user_data.linkedin ?? null,
				portfolio: cv?.user_data.portfolio ?? null,
				address: {
					country: cv?.user_data.address?.country ?? "",
					city: cv?.user_data.address?.city ?? "",
				},
			},
			sections: cv?.sections ?? {},
		},

		validate: {
			user_data: {
				name: (value) => (value.trim().length < 2 ? t("cv.editor.nameInput.validationError") : null),
				email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : t("cv.editor.emailInput.validationError")),
				phone_number: (value) =>
				value && !/^\+?[0-9\s\-()]{7,20}$/.test(value) ? t("cv.editor.phoneNumberInput.validationError") : null,
				linkedin: (value) =>
				value && !/^https?:\/\/(www\.)?linkedin\.com\/.+$/i.test(value)
					? t("cv.editor.linkedinInput.validationError")
					: null,
				portfolio: (value) => (value && !/^https?:\/\/.+$/i.test(value) ? t("cv.editor.portfolioInput.validationError") : null),
				address: {
				country: (value) => (value.trim().length < 2 ? t("cv.editor.countryInput.validationError") : null),
				city: (value) => (value.trim().length < 2 ? t("cv.editor.cityInput.validationError") : null),
				},
			},
			sections: {
				[version || ""]: {
					summary: {
						title: (value) => (value.trim().length < 2 ? t("cv.editor.summaryInput.titleValidationError") : null),
						content: (value) =>
						typeof value !== "string" || value.trim().length < 10
							? t("cv.editor.summaryInput.contentValidationError")
							: null,
					},
					experience: {
						title: (value) => (value.trim().length < 2 ? t("cv.editor.experienceInput.titleValidationError") : null),
						content: (value) => validateEntryContent(value, t)
					},
					education: {
						title: (value) => (value.trim().length < 2 ? t("cv.editor.educationInput.titleValidationError") : null),
						content: (value) => validateEntryContent(value, t)
					},
					languages: {
						title: (value) => (value.trim().length < 2 ? t("cv.editor.languagesInput.titleValidationError") : null),
						content: (value) =>
						!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim().length === 0)
							? t("cv.editor.listInput.contentValidationError")
							: null,
					},
					skills: {
						title: (value) => (value.trim().length < 2 ? t("cv.editor.skillsInput.titleValidationError") : null),
						content: (value) =>
						!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim().length === 0)
							? t("cv.editor.listInput.contentValidationError")
							: null,
					},
					other_sections: {

					}
				},
			},
		},
	});

	const handleValidate = () => {
		const result = form.validate();

		if (result.hasErrors) {
			setErrors(result.errors);
			setEditing(true);
		} else {
			setErrors(null);
			setEditing(false);
			setValidated(true);	
			saveCV(form.values);
		}
	};

	const handleEdit = () => {
		setEditing(true);
		setValidated(false);
	};

	const updateFormValue = (field: string, value: any) => {
		form.setFieldValue(field, value);
	};

	const addNewVersion = () => {
		if (newVersionName.trim().length > 0) {
			addCVVersion(newVersionName.trim());
			setIsAddingVersion(false);
			setNewVersionName("");
		}
	};

	const handleAddCustomSection = () => {
		if (!version || !newCustomSectionKey.trim()) return;
		const sectionKey = newCustomSectionKey.trim().toLowerCase().replace(/\s+/g, "_");

		form.setFieldValue(`sections.${version}.other_sections.${sectionKey}`, {
			title: newCustomSectionKey.trim(),
			content: "",
		});
		setNewCustomSectionKey("");
	};

	const handleRemoveCustomSection = (sectionKey: string) => {
		if (!version) return;
		console.log(`Removing custom section: sections.${version}.other_sections.${sectionKey}`);
		const currentOtherSections = { ...form.values.sections[version]?.other_sections };
		delete currentOtherSections[sectionKey];

		form.setFieldValue(`sections.${version}.other_sections`, currentOtherSections);
	};

	const customSections = version ? form.values.sections[version]?.other_sections || {} : {};

	return (
		<Box>

		<Text fw={700} size="lg" pt="md">
			{t("cv.editor.form.userDataTitle")}
		</Text>

		<FormBlockContainer
			path="user_data"
			errors={form.errors}
			t={t}
		>
			<Grid gap="md">
			<Grid.Col span={6}>
				<ValidatableInput
					placeholder={t("cv.editor.nameInput.placeholder")}
					value={form.values.user_data.name}
					onChange={(value) => updateFormValue("user_data.name", value)}
					name={"name"}
					isValid={!editing && validated && !form.errors["user_data.name"]}
					isError={editing && validated && !!form.errors["user_data.name"]}
				/>
			</Grid.Col>

			<Grid.Col span={6}>
				<ValidatableInput
					placeholder={t("cv.editor.emailInput.placeholder")}
					value={form.values.user_data.email}
					name={"email"}
					onChange={(value) => updateFormValue("user_data.email", value)}
					isValid={!editing && validated && !form.errors["user_data.email"]}
					isError={editing && validated && !!form.errors["user_data.email"]}
				/>
			</Grid.Col>

			<Grid.Col span={6}>
				<ValidatableInput
					placeholder={t("cv.editor.phoneNumberInput.placeholder")}
					value={form.values.user_data.phone_number ?? ""}
					name={"phone_number"}
					onChange={(value) => updateFormValue("user_data.phone_number", value)}
					isValid={!editing && validated && !form.errors["user_data.phone_number"]}
					isError={editing && validated && !!form.errors["user_data.phone_number"]}
				/>
			</Grid.Col>

			<Grid.Col span={6}>
				<ValidatableInput
					placeholder={t("cv.editor.linkedinInput.placeholder")}
					name={"linkedin"}
					value={form.values.user_data.linkedin ?? ""}
					onChange={(value) => updateFormValue("user_data.linkedin", value)}
					isValid={!editing && validated && !form.errors["user_data.linkedin"]}
					isError={editing && validated && !!form.errors["user_data.linkedin"]}
				/>
			</Grid.Col>

			<Grid.Col span={6}>
				<ValidatableInput
					placeholder={t("cv.editor.portfolioInput.placeholder")}
					value={form.values.user_data.portfolio ?? ""}
					name={"portfolio"}
					onChange={(value) => updateFormValue("user_data.portfolio", value)}
					isValid={!editing && validated && !form.errors["user_data.portfolio"]}
					isError={editing && validated && !!form.errors["user_data.portfolio"]}
				/>
			</Grid.Col>

			<Grid.Col span={6}>
				<ValidatableInput
					placeholder={t("cv.editor.countryInput.placeholder")}
					name={"country"}
					value={form.values.user_data.address?.country ?? ""}
					onChange={(value) => updateFormValue("user_data.address.country", value)}
					isValid={!editing && validated && !form.errors["user_data.address.country"]}
					isError={editing && validated && !!form.errors["user_data.address.country"]}
				/>
			</Grid.Col>

			<Grid.Col span={6}>
				<ValidatableInput
					placeholder={t("cv.editor.cityInput.placeholder")}
					name={"city"}
					value={form.values.user_data.address?.city ?? ""}
					onChange={(value) => updateFormValue("user_data.address.city", value)}
					isValid={!editing && validated && !form.errors["user_data.address.city"]}
					isError={editing && validated && !!form.errors["user_data.address.city"]}
				/>
			</Grid.Col>
			</Grid>
		</FormBlockContainer>

		<Text fw={700} size="lg" py="md">
			{t("cv.editor.form.cvSectionsTitle")}
		</Text>

		<Flex pos="relative" gap="md" w="100%" align="center" mb="lg">
			{isAddingVersion ? (
			<Box flex={1}>
				<ValidatableInput
				placeholder={t("cv.editor.form.newVersionInputPlaceholder")}
				value={newVersionName}
				onChange={setNewVersionName}
				name={"new_version"}
				/>
			</Box>
			) : (
			<>
				<NativeSelect
				flex={1}
				data={Object.keys(cv.sections)}
				value={version || ""}
				onChange={(event) => setVersion(event.currentTarget.value)}
				/>
			</>
			)}

			{isAddingVersion ? (
			<Flex gap="sm">
				<Button onClick={addNewVersion}>{t("cv.editor.form.validateButton")}</Button>
				<Button variant="outline" color="red" onClick={() => setIsAddingVersion(false)}>
				{t("cv.editor.form.cancelButton")}
				</Button>
			</Flex>
			) : (
			<Button onClick={() => setIsAddingVersion(true)}>{t("cv.editor.form.addVersionButton")}</Button>
			)}
		</Flex>

		{version && (
			<Box>
			{/* Paragraph Section Example */}
			<SectionParagraphEditor
				t={t}
				form={form}
				version={version}
				sectionKey="summary"
				sectionTitle={t("cv.editor.sections.summary")}
				isValid={!editing && validated && !form.errors[`{sections.${version}.summary}`]}
				isError={editing && validated && !form.errors[`{sections.${version}.summary}`]}
			/>

			{/* Structured Entries Section Examples */}
			<SectionEntriesEditor
				t={t}
				form={form}
				version={version}
				sectionKey="experience"
				sectionTitle={t("cv.editor.sections.experience")}
				isValid={!editing && validated && !form.errors[`{sections.${version}.experience}`]}
				isError={editing && validated && !form.errors[`{sections.${version}.experience}`]}
			/>

			<SectionEntriesEditor
				t={t}
				form={form}
				version={version}
				sectionKey="education"
				sectionTitle={t("cv.editor.sections.education")}
				isValid={!editing && validated && !form.errors[`{sections.${version}.education}`]}
				isError={editing && validated && !form.errors[`{sections.${version}.education}`]}
			/>

			<SectionListEditor
				t={t}
				form={form}
				version={version}
				sectionKey="languages"
				sectionTitle={t("cv.editor.sections.languages")}
				isValid={!editing && validated && !form.errors[`{sections.${version}.languages}`]}
				isError={editing && validated && !form.errors[`{sections.${version}.languages}`]}
			/>

			<SectionListEditor
				t={t}
				form={form}
				version={version}
				sectionKey="skills"
				sectionTitle={t("cv.editor.sections.skills")}
				isValid={!editing && validated && !form.errors[`{sections.${version}.skills}`]}
				isError={editing && validated && !form.errors[`{sections.${version}.skills}`]}
			/>

			<Text fw={700} size="md" mt="xl" mb="sm">
				{t("cv.editor.form.otherSectionsTitle")}
			</Text>

			{Object.keys(customSections).map((key) => (
				<SectionDynamic
					key={key}
					t={t}
					form={form}
					version={version}
					sectionKey={key}
					onRemove={() => handleRemoveCustomSection(key)}
				/>
			))}

			<Flex gap="sm" mt="md" align="center">
				<TextInput
				placeholder={t("cv.editor.form.customSectionNamePlaceholder")}
				value={newCustomSectionKey}
				onChange={(e) => setNewCustomSectionKey(e.currentTarget.value)}
				style={{ flex: 1 }}
				/>
				<Button onClick={handleAddCustomSection}>
				{t("cv.editor.form.addCustomSection")}
				</Button>
			</Flex>

						<Flex justify="center" mt="md" gap="md">
			<Button onClick={handleValidate}>{t("cv.editor.form.validateButton")}</Button>
			{validated && (
				<Button variant="outline" onClick={handleEdit}>
				{t("cv.editor.form.editButton")}
				</Button>
			)}
			</Flex>
			</Box>
		)}
    </Box>
  );
}