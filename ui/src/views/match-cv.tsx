import { useState } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Textarea,
  TextInput,
  Select,
  Button,
  Stack,
  Group,
  Alert,
  Badge,
  Card,
  Accordion,
  Stepper,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconSparkles,
  IconArrowRight,
  IconArrowLeft,
} from '@tabler/icons-react';
import { useAPI } from '@/hooks/useAPI';
import type {
  ParsedJD,
  CVEntryMatch,
} from '@/types';
import { useCV } from '@/hooks/useDB/useCV';
import { parseJobDescription } from '@/api/jobDescription';
import { matchCV } from '@/api/cvmatch';

const HARDCODED_MODEL = 'gpt-5.4-mini';

export default function MatchCv() {
  // 1. Hook Data Sources
  const { data: cv } = useCV();

  // 2. API Hooks
  const {
    loading: isParsingJd,
    error: parseError,
    execute: executeParseJd,
  } = useAPI(parseJobDescription);

  const {
    loading: isMatchingCv,
    error: matchError,
    execute: executeMatchCv,
  } = useAPI(matchCV);

  // 3. Local Wizard State
  const [activeStep, setActiveStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<string>('en');

  // Response Data
  const [parsedJd, setParsedJd] = useState<ParsedJD | null>(null);
  const [tokenUsage, setTokenUsage] = useState<{ input: number; output: number } | null>(null);
  const [matches, setMatches] = useState<CVEntryMatch[] | null>(null);

  // Available CV Versions Options
  const versionOptions = cv?.sections
    ? Object.keys(cv.sections).map((ver) => ({
        value: ver,
        label: ver.toUpperCase(),
      }))
    : [];

  // Step 1 Handler: Parse JD
  const handleParseJD = async () => {
    if (!apiKey.trim() || !jobDescription.trim()) return;

    const response = await executeParseJd({
      openai_api_key: apiKey,
      job_description: jobDescription,
      model: HARDCODED_MODEL,
    });

    if (response) {
      setParsedJd(response.result);
      setTokenUsage({
        input: response.input_tokens,
        output: response.output_tokens,
      });
      setActiveStep(1); // Move to Review JD step
    }
  };

  // Step 2 Handler: Match CV
  const handleMatchCV = async () => {
    if (!parsedJd || !cv || !apiKey.trim()) return;

    const response = await executeMatchCv({
      parsed_jd: parsedJd,
      cv_raw: cv,
      openai_api_key: apiKey,
      selected_version: selectedVersion,
      chosen_model: HARDCODED_MODEL,
    });

    if (response) {
      setMatches(response.entry_matches);
      setActiveStep(2); // Move to Match Results step
    }
  };

  return (
    <Container size="md" py="xl">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Stepper active={activeStep} onStepClick={setActiveStep} allowNextStepsSelect={false}>
          {/* STEP 1: INPUTS */}
          <Stepper.Step label="Job Setup" description="API key & Job Description">
            <Stack gap="md" mt="xl">
              <Title order={3}>Target Job Setup</Title>
              <Text size="sm" c="dimmed">
                Provide your OpenAI key and the target job posting to get started.
              </Text>

              <TextInput
                label="OpenAI API Key"
                placeholder="sk-..."
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />

              <Select
                label="Select CV Version"
                data={versionOptions}
                value={selectedVersion}
                onChange={(val) => val && setSelectedVersion(val)}
                required
              />

              <Textarea
                label="Job Description"
                placeholder="Paste job posting text here..."
                minRows={8}
                maxRows={12}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />

              {parseError && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" title="Parsing Failed">
                  {parseError}
                </Alert>
              )}

              <Group justify="end" mt="md">
                <Button
                  rightSection={<IconArrowRight size={16} />}
                  onClick={handleParseJD}
                  loading={isParsingJd}
                  disabled={!apiKey || !jobDescription || !cv}
                >
                  Parse Job Description
                </Button>
              </Group>
            </Stack>
          </Stepper.Step>

          {/* STEP 2: REVIEW PARSED JD */}
          <Stepper.Step label="Review JD" description="Check extracted requirements">
            <Stack gap="md" mt="xl">
              <Group justify="space-between">
                <div>
                  <Title order={3}>Parsed Job Requirements</Title>
                  <Text size="sm" c="dimmed">
                    Review extracted information before running the matcher.
                  </Text>
                </div>
                {tokenUsage && (
                  <Badge variant="light" color="gray">
                    Tokens: {tokenUsage.input} in / {tokenUsage.output} out
                  </Badge>
                )}
              </Group>

              {parsedJd && (
                <Card padding="md" radius="md" withBorder>
                  <Stack gap="xs">
                    <Text size="sm">
                      <strong>Role Title:</strong> {parsedJd.job_title || 'N/A'}
                    </Text>
                    <Text size="xs" fw={700} c="dimmed" mt="xs">
                      EXTRACTED KEYWORDS & SKILLS
                    </Text>
                    <Group gap="xs">
                      {parsedJd.keywords?.map((keyword, idx) => (
                        <Badge key={idx} variant="light" color="blue">
                          {keyword}
                        </Badge>
                      ))}
                    </Group>
                  </Stack>
                </Card>
              )}

              {matchError && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" title="Match Failed">
                  {matchError}
                </Alert>
              )}

              <Group justify="space-between" mt="md">
                <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={() => setActiveStep(0)}>
                  Back
                </Button>
                <Button
                  color="blue"
                  leftSection={<IconSparkles size={16} />}
                  onClick={handleMatchCV}
                  loading={isMatchingCv}
                >
                  Run CV Matcher
                </Button>
              </Group>
            </Stack>
          </Stepper.Step>

          {/* STEP 3: MATCH RESULTS */}
        <Stepper.Step label="Match Results" description="Review matched skills & requirements">
            <Stack gap="md" mt="xl">
                <Group justify="space-between">
                <div>
                    <Title order={3}>Match Analysis</Title>
                    <Text size="sm" c="dimmed">
                    Breakdown of matched keywords, skills, and qualifications per CV entry.
                    </Text>
                </div>
                {matches && <Badge color="blue">{matches.length} Entries Analyzed</Badge>}
                </Group>

                {matches && (
                <Accordion variant="separated" radius="md">
                    {matches.map((match) => {
                    const totalMatches =
                        match.matched_keywords.length +
                        match.matched_technical_skills.length +
                        match.matched_soft_skills.length +
                        match.matched_tools_and_technologies.length +
                        match.matched_qualifications.length +
                        match.matched_experience_requirements.length +
                        match.matched_domain_terms.length;

                    return (
                        <Accordion.Item key={match.cv_entry_index} value={`match-${match.cv_entry_index}`}>
                        <Accordion.Control>
                            <Group justify="space-between" pr="xs">
                            <Text size="sm" fw={600}>
                                CV Entry #{match.cv_entry_index + 1}
                            </Text>
                            <Badge color={totalMatches > 0 ? 'green' : 'gray'} variant="light">
                                {totalMatches} Matches Found
                            </Badge>
                            </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                            <Stack gap="sm">
                            {/* Technical Skills */}
                            {match.matched_technical_skills.length > 0 && (
                                <div>
                                <Text size="xs" fw={700} c="dimmed" mb={4}>
                                    TECHNICAL SKILLS
                                </Text>
                                <Group gap="xs">
                                    {match.matched_technical_skills.map((skill, i) => (
                                    <Badge key={i} color="blue" variant="light">
                                        {skill}
                                    </Badge>
                                    ))}
                                </Group>
                                </div>
                            )}

                            {/* Tools & Technologies */}
                            {match.matched_tools_and_technologies.length > 0 && (
                                <div>
                                <Text size="xs" fw={700} c="dimmed" mb={4}>
                                    TOOLS & TECHNOLOGIES
                                </Text>
                                <Group gap="xs">
                                    {match.matched_tools_and_technologies.map((tool, i) => (
                                    <Badge key={i} color="cyan" variant="light">
                                        {tool}
                                    </Badge>
                                    ))}
                                </Group>
                                </div>
                            )}

                            {/* Soft Skills */}
                            {match.matched_soft_skills.length > 0 && (
                                <div>
                                <Text size="xs" fw={700} c="dimmed" mb={4}>
                                    SOFT SKILLS
                                </Text>
                                <Group gap="xs">
                                    {match.matched_soft_skills.map((skill, i) => (
                                    <Badge key={i} color="teal" variant="light">
                                        {skill}
                                    </Badge>
                                    ))}
                                </Group>
                                </div>
                            )}

                            {/* Experience Requirements & Qualifications */}
                            {(match.matched_experience_requirements.length > 0 ||
                                match.matched_qualifications.length > 0) && (
                                <div>
                                <Text size="xs" fw={700} c="dimmed" mb={4}>
                                    QUALIFICATIONS & EXPERIENCE
                                </Text>
                                <Group gap="xs">
                                    {match.matched_qualifications.map((qual, i) => (
                                    <Badge key={`q-${i}`} color="violet" variant="light">
                                        {qual}
                                    </Badge>
                                    ))}
                                    {match.matched_experience_requirements.map((exp, i) => (
                                    <Badge key={`e-${i}`} color="grape" variant="light">
                                        {exp}
                                    </Badge>
                                    ))}
                                </Group>
                                </div>
                            )}

                            {/* Domain Terms & Keywords */}
                            {(match.matched_domain_terms.length > 0 ||
                                match.matched_keywords.length > 0) && (
                                <div>
                                <Text size="xs" fw={700} c="dimmed" mb={4}>
                                    DOMAIN TERMS & KEYWORDS
                                </Text>
                                <Group gap="xs">
                                    {match.matched_domain_terms.map((term, i) => (
                                    <Badge key={`d-${i}`} color="orange" variant="light">
                                        {term}
                                    </Badge>
                                    ))}
                                    {match.matched_keywords.map((kw, i) => (
                                    <Badge key={`k-${i}`} color="gray" variant="light">
                                        {kw}
                                    </Badge>
                                    ))}
                                </Group>
                                </div>
                            )}

                            {totalMatches === 0 && (
                                <Text size="sm" c="dimmed" fs="italic">
                                No matching skills or requirements identified for this entry.
                                </Text>
                            )}
                            </Stack>
                        </Accordion.Panel>
                        </Accordion.Item>
                    );
                    })}
                </Accordion>
                )}

                <Group justify="space-between" mt="md">
                    <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={() => setActiveStep(1)}>
                        Back
                    </Button>
                <Button variant="outline" color="gray" onClick={() => setActiveStep(0)}>
                    Start New Match
                </Button>
                </Group>
            </Stack>
        </Stepper.Step>
        </Stepper>
      </Paper>
    </Container>
  );
}