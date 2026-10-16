import { $TSFixMe } from '@/scripts/types';
import { JSONSchemaFormFields } from '@/src/components/form/JSONSchemaForm';
import { DailyScheduleContainer } from '@/src/flows/Onboarding/components/DailySchedule/DailyScheduleContainer';
import { germanyDailyScheduleMetadata } from '@/src/flows/Onboarding/components/DailySchedule/tests/fixtures';
import {
  DailyScheduleContainerProps,
  DailyScheduleEditBag,
} from '@/src/flows/Onboarding/components/DailySchedule/types';
import { TestProviders } from '@/src/tests/testHelpers';
import { act, render } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';

let editBag: DailyScheduleEditBag;

const CapturingField = (props: Omit<DailyScheduleContainerProps, 'render'>) => (
  <DailyScheduleContainer
    {...(props as $TSFixMe as DailyScheduleContainerProps)}
    render={(renderProps) => {
      editBag = renderProps.editBag;
      return null;
    }}
  />
);

const renderEditBag = (dailySchedule?: Record<string, unknown>) => {
  const field = {
    name: 'daily_schedule',
    label: 'Daily schedule',
    Component: CapturingField,
    metadata: germanyDailyScheduleMetadata,
  };

  const TestComponent = () => {
    const methods = useForm({
      defaultValues: { daily_schedule: dailySchedule },
    });

    return (
      <TestProviders>
        <FormProvider {...methods}>
          <JSONSchemaFormFields fields={[field]} />
        </FormProvider>
      </TestProviders>
    );
  };

  render(<TestComponent />);
};

const mondayOnlySchedule = {
  selected_days: ['monday'],
  schedule: {
    monday: {
      start_time: '10:00',
      end_time: '14:00',
      break_duration_minutes: 15,
    },
  },
};

describe('DailyScheduleEditState change flags', () => {
  it('reports no unsaved changes when nothing is saved and the form is untouched', () => {
    renderEditBag(undefined);

    expect(editBag.state.hasUnsavedChanges).toBe(false);
    expect(editBag.state.hasDifferencesFromCountryDefault).toBe(false);
    expect(editBag.state.isDirty).toBe(false);
  });

  it('reports no unsaved changes for a saved custom schedule, while still differing from the country default', () => {
    renderEditBag(mondayOnlySchedule);

    expect(editBag.state.hasUnsavedChanges).toBe(false);
    expect(editBag.state.hasDifferencesFromCountryDefault).toBe(true);
    expect(editBag.state.isDirty).toBe(true);
  });

  it('flags unsaved changes once a saved schedule is edited, and clears them when the edit is reverted', () => {
    renderEditBag(mondayOnlySchedule);

    act(() => editBag.actions.updateRow(0, 'start_time', '11:00'));
    expect(editBag.state.hasUnsavedChanges).toBe(true);

    act(() => editBag.actions.updateRow(0, 'start_time', '10:00'));
    expect(editBag.state.hasUnsavedChanges).toBe(false);
  });

  it('flags unsaved changes when a day is toggled on the default schedule', () => {
    renderEditBag(undefined);

    act(() => editBag.actions.toggleDay(4));

    expect(editBag.state.hasUnsavedChanges).toBe(true);
    expect(editBag.state.hasDifferencesFromCountryDefault).toBe(true);
  });

  it('clears unsaved changes after close() discards the edits', () => {
    renderEditBag(mondayOnlySchedule);

    act(() => editBag.actions.updateRow(0, 'end_time', '15:00'));
    expect(editBag.state.hasUnsavedChanges).toBe(true);

    act(() => editBag.actions.close());
    expect(editBag.state.hasUnsavedChanges).toBe(false);
  });

  it('matches the country default after reset(), but now differs from the saved schedule', () => {
    renderEditBag(mondayOnlySchedule);

    act(() => editBag.actions.reset());

    expect(editBag.state.hasDifferencesFromCountryDefault).toBe(false);
    expect(editBag.state.isDirty).toBe(false);
    expect(editBag.state.hasUnsavedChanges).toBe(true);
  });
});
