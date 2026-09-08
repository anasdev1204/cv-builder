import { Box } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CreateNewCVSection from '@/components/cv-editor/create-new-cv';
import CVForm from './cv-form';

import type { CVRaw } from '@/types';
import { useCV } from '@/hooks/useDB/useCV';

export default function CVEditor() {
  const { data: cv, save } = useCV();

  const [currentCV, setCurrentCV] = useState<CVRaw | null>(cv);

  useEffect(() => {
    if (cv) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentCV(cv);
    }
  }, [cv, setCurrentCV]);

  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    if (currentCV) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVersion(Object.keys(currentCV.sections)[0] || null);
    }
  }, [currentCV, setVersion]);

  const initCv = useCallback(() => {
    if (!cv) {
      setCurrentCV({
        user_data: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          picture: null,
          phone_number: '+33 6 12 34 56 78',
          linkedin: 'https://linkedin.com/in/johndoe',
          portfolio: 'https://johndoe.dev',
          address: {
            country: 'France',
            city: 'Paris',
          },
        },
        sections: {
          default: {
            summary: {
              title: 'Professional Summary',
              content:
                'Software engineer with experience building scalable web applications and data-driven systems.',
            },

            experience: {
              title: 'Experience',
              content: [
                {
                  title: 'Software Engineer',
                  subtitle: 'Tech Company',
                  start_date: '2024-01-01',
                  end_date: '2026-06-01',
                  bullet_points: [
                    'Developed scalable React and TypeScript applications',
                    'Designed REST APIs using Python and FastAPI',
                    'Improved application performance by 30%',
                  ],
                },
                {
                  title: 'Web Developer Intern',
                  subtitle: 'Digital Solutions',
                  start_date: '2023-06-01',
                  end_date: '2023-09-01',
                  bullet_points: ['Built responsive web interfaces', 'Integrated third-party APIs'],
                },
              ],
            },

            education: {
              title: 'Education',
              content: [
                {
                  title: 'MSc Data Science',
                  subtitle: 'University of Example',
                  start_date: '2024-09-01',
                  end_date: '2026-06-01',
                  bullet_points: [
                    'Specialized in machine learning and statistical modelling',
                    'Completed projects involving large-scale data analysis',
                  ],
                },
                {
                  title: 'BSc Computer Science',
                  subtitle: 'University of Example',
                  start_date: '2021-09-01',
                  end_date: '2024-06-01',
                  bullet_points: ['Focused on software engineering and artificial intelligence'],
                },
              ],
            },

            skills: {
              title: 'Skills',
              content: ['programming', 'web development', 'data analysis', 'machine learning'],
            },

            languages: {
              title: 'Languages',
              content: ['English', 'French'],
            },

            other_sections: {},
          },
        },
      });
      setVersion('default');
    }
  }, [cv, setCurrentCV, setVersion]);

  const addCVVersion = (cv: CVRaw, versionName: string) => {
    setCurrentCV({
      ...cv,
      sections: {
        ...cv.sections,
        [versionName]: {
          summary: {
            title: '',
            content: '',
          },
          experience: {
            title: '',
            content: [],
          },
          education: {
            title: '',
            content: [],
          },
          skills: {
            title: '',
            content: [],
          },
          languages: {
            title: '',
            content: [],
          },
          other_sections: {},
        },
      },
    });
  };

  const saveCV = (updatedCV: CVRaw) => {
    save(updatedCV);
  };

  const { t } = useTranslation();

  return (
    <Box>
      {currentCV ? (
        <CVForm
          t={t}
          cv={currentCV}
          version={version}
          setVersion={setVersion}
          addCVVersion={addCVVersion}
          saveCV={saveCV}
        />
      ) : (
        <CreateNewCVSection t={t} initCv={initCv} />
      )}
    </Box>
  );
}
