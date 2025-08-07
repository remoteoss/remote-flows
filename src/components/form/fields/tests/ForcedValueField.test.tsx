import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { ForcedValueField } from '../ForcedValueField';

type ForcedValueFieldProps = {
  name: string;
  value: string;
  description: string;
  statement?: {
    title?: string;
    description: string;
  };
  label: string;
};

describe('ForcedValueField Component', () => {
  const defaultProps: ForcedValueFieldProps = {
    name: 'testField',
    value: 'forced-value',
    description: 'This is a test description',
    label: 'Test Label',
  };

  // Helper function to render the component with a form context
  const renderWithFormContext = (props: ForcedValueFieldProps) => {
    const TestComponent = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <ForcedValueField {...props} />
        </FormProvider>
      );
    };

    return render(<TestComponent />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when statement is not provided', () => {
    it('renders only the description', () => {
      renderWithFormContext(defaultProps);

      expect(
        screen.getByText('This is a test description'),
      ).toBeInTheDocument();
      expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
    });
  });

  describe('when statement is provided with title', () => {
    const propsWithStatement: ForcedValueFieldProps = {
      ...defaultProps,
      statement: {
        title: 'Statement Title',
        description: 'Statement Description',
      },
    };

    it('renders statement title and description', () => {
      renderWithFormContext(propsWithStatement);

      expect(screen.getByText('Statement Title')).toBeInTheDocument();
      expect(screen.getByText('Statement Description')).toBeInTheDocument();
      expect(
        screen.queryByText('This is a test description'),
      ).not.toBeInTheDocument();
    });
  });

  describe('when statement is provided but title is undefined', () => {
    const propsWithStatementNoTitle: ForcedValueFieldProps = {
      ...defaultProps,
      statement: {
        title: undefined,
        description: 'Statement Description',
      },
    };

    it('falls back to label when statement.title is undefined', () => {
      renderWithFormContext(propsWithStatementNoTitle);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Statement Description')).toBeInTheDocument();
    });
  });

  describe('when statement is provided but title is empty string', () => {
    const propsWithEmptyTitle: ForcedValueFieldProps = {
      ...defaultProps,
      statement: {
        title: '',
        description: 'Statement Description',
      },
    };

    it('falls back to label when statement.title is empty string', () => {
      renderWithFormContext(propsWithEmptyTitle);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Statement Description')).toBeInTheDocument();
    });
  });

  describe('HTML content rendering', () => {
    it('renders HTML content in statement title using dangerouslySetInnerHTML', () => {
      const propsWithHtmlTitle: ForcedValueFieldProps = {
        ...defaultProps,
        statement: {
          title: '<strong>Bold Title</strong>',
          description: 'Statement Description',
        },
      };

      renderWithFormContext(propsWithHtmlTitle);

      const titleElement = screen.getByText('Bold Title');
      expect(titleElement.tagName).toBe('STRONG');
    });

    it('renders HTML content in statement description using dangerouslySetInnerHTML', () => {
      const propsWithHtmlDescription: ForcedValueFieldProps = {
        ...defaultProps,
        statement: {
          title: 'Statement Title',
          description: '<em>Italic Description</em>',
        },
      };

      renderWithFormContext(propsWithHtmlDescription);

      const descriptionElement = screen.getByText('Italic Description');
      expect(descriptionElement.tagName).toBe('EM');
    });

    it('renders HTML content in fallback description using dangerouslySetInnerHTML', () => {
      const propsWithHtmlFallbackDescription: ForcedValueFieldProps = {
        ...defaultProps,
        description: '<u>Underlined Description</u>',
      };

      renderWithFormContext(propsWithHtmlFallbackDescription);

      const descriptionElement = screen.getByText('Underlined Description');
      expect(descriptionElement.tagName).toBe('U');
    });

    it('renders HTML content in label fallback using dangerouslySetInnerHTML', () => {
      const propsWithHtmlLabel: ForcedValueFieldProps = {
        ...defaultProps,
        label: '<span>Span Label</span>',
        statement: {
          title: '', // Empty title to trigger fallback
          description: 'Statement Description',
        },
      };

      renderWithFormContext(propsWithHtmlLabel);

      const labelElement = screen.getByText('Span Label');
      expect(labelElement.tagName).toBe('SPAN');
    });
  });

  describe('form integration', () => {
    it('sets the form value using setValue from useFormContext', () => {
      const mockSetValue = vi.fn();

      const TestComponent = () => {
        const methods = {
          ...useForm(),
          setValue: mockSetValue,
        };
        return (
          <FormProvider {...methods}>
            <ForcedValueField {...defaultProps} />
          </FormProvider>
        );
      };

      render(<TestComponent />);

      expect(mockSetValue).toHaveBeenCalledWith('testField', 'forced-value');
    });
  });

  describe('edge cases for statement title fallback', () => {
    it('handles statement with only description property', () => {
      const propsWithDescriptionOnly: ForcedValueFieldProps = {
        ...defaultProps,
        statement: {
          description: 'Only description provided',
        },
      };

      renderWithFormContext(propsWithDescriptionOnly);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getByText('Only description provided')).toBeInTheDocument();
    });

    it('prioritizes statement.title over label when title is truthy', () => {
      const propsWithBothTitleAndLabel: ForcedValueFieldProps = {
        ...defaultProps,
        label: 'Should Not Appear',
        statement: {
          title: 'Should Appear',
          description: 'Statement Description',
        },
      };

      renderWithFormContext(propsWithBothTitleAndLabel);

      expect(screen.getByText('Should Appear')).toBeInTheDocument();
      expect(screen.queryByText('Should Not Appear')).not.toBeInTheDocument();
    });
  });
});
