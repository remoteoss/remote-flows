import { render, screen } from '@testing-library/react';
import { ForcedValueFieldDefault } from '../ForcedValueFieldDefault';
import { ForcedValueDataProps } from '@/src/types/fields';
import { $TSFixMe } from '@/src/types/remoteFlows';

vi.mock('@/src/components/shared/zendesk-drawer/ZendeskTriggerButton', () => ({
  ZendeskTriggerButton: ({ zendeskId, children, className }: $TSFixMe) => (
    <button className={className} data-testid={`zendesk-button-${zendeskId}`}>
      {children}
    </button>
  ),
}));

describe('ForcedValueFieldDefault Component', () => {
  const defaultFieldData: ForcedValueDataProps = {
    name: 'testField',
    value: 'forced-value',
    title: 'Test Label',
    description: 'This is a test description',
  };

  it('renders the resolved title and description', () => {
    render(<ForcedValueFieldDefault fieldData={defaultFieldData} />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('renders HTML content in the title using dangerouslySetInnerHTML', () => {
    render(
      <ForcedValueFieldDefault
        fieldData={{
          ...defaultFieldData,
          title: '<strong>Bold Title</strong>',
        }}
      />,
    );

    const titleElement = screen.getByText('Bold Title');
    expect(titleElement.tagName).toBe('STRONG');
  });

  it('renders the help center link from meta', () => {
    render(
      <ForcedValueFieldDefault
        fieldData={{
          ...defaultFieldData,
          meta: {
            helpCenter: {
              callToAction: 'Learn more',
              id: 12345,
              content: '<p>Details</p>',
              title: 'Details',
            },
          },
        }}
      />,
    );

    expect(screen.getByText('Learn more')).toBeInTheDocument();
  });
});
