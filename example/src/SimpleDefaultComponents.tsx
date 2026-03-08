import { useEffect, useState } from 'react';
import {
  Components,
  FieldComponentProps,
  WorkScheduleComponentProps,
  StatementComponentProps,
  FieldSetToggleComponentProps,
  ButtonComponentProps,
  ZendeskDrawerComponentProps,
  DrawerComponentProps,
  TableComponentProps,
  PDFPreviewComponentProps,
  DAYS_OF_THE_WEEK,
  calculateHours,
  DailySchedule,
} from '@remoteoss/remote-flows';

// $TSFixMe equivalent
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type $TSFixMe = any;

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

const DAY_ABBREVS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

function MultiSelectField({
  field,
  fieldData,
  fieldState,
}: FieldComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected: string[] = Array.isArray(field.value) ? field.value : [];
  const options: { value: string; label: string }[] = fieldData.options ?? [];

  const toggleOption = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    field.onChange(next);
  };

  return (
    <div>
      <label style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>
        {fieldData.label as string}
      </label>
      <div
        style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}
      >
        {selected.map((val) => {
          const opt = options.find((o) => o.value === val);
          return opt ? (
            <span
              key={val}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                background: '#e5e7eb',
                borderRadius: 4,
                padding: '2px 6px',
                fontSize: 13,
              }}
            >
              {opt.label}
              <button
                aria-label={`remove ${opt.label}`}
                onClick={() =>
                  field.onChange(selected.filter((v) => v !== val))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter')
                    field.onChange(selected.filter((v) => v !== val));
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 2px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </span>
          ) : null;
        })}
      </div>
      <div
        role='combobox'
        aria-expanded={isOpen}
        aria-haspopup='listbox'
        onClick={() => setIsOpen((o) => !o)}
        style={{
          border: '1px solid #d1d5db',
          borderRadius: 6,
          padding: '6px 10px',
          cursor: 'pointer',
          background: '#fff',
          userSelect: 'none',
        }}
      >
        Select...
      </div>
      {isOpen && (
        <ul
          role='listbox'
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            border: '1px solid #d1d5db',
            borderRadius: 6,
            background: '#fff',
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          {options.length === 0 ? (
            <li style={{ padding: '8px 10px', color: '#6b7280' }}>
              No item found.
            </li>
          ) : (
            options.map((opt) => (
              <li
                key={opt.value}
                role='option'
                aria-selected={selected.includes(opt.value)}
                onClick={() => toggleOption(opt.value)}
                style={{
                  padding: '8px 10px',
                  cursor: 'pointer',
                  background: selected.includes(opt.value)
                    ? '#eff6ff'
                    : undefined,
                }}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
      {fieldData.description && (
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
          {fieldData.description as string}
        </p>
      )}
      {fieldState.error && (
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#dc2626' }}>
          {fieldState.error.message}
        </p>
      )}
    </div>
  );
}

function WorkScheduleField({ fieldData }: WorkScheduleComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeErrors, setTimeErrors] = useState<string[]>([]);
  const [localSchedule, setLocalSchedule] = useState<DailySchedule[]>(() =>
    DAYS_OF_THE_WEEK.map((day) => {
      const existing = fieldData.currentSchedule?.find(
        (d) => d.day.toLowerCase() === day,
      );
      return (
        existing ?? {
          day: day.charAt(0).toUpperCase() + day.slice(1),
          checked: false,
          start_time: '',
          end_time: '',
          hours: 0,
          break_duration_minutes: '0',
        }
      );
    }),
  );

  const handleCheckboxChange = (idx: number, checked: boolean) => {
    const next = localSchedule.map((d, i) =>
      i === idx ? { ...d, checked } : d,
    );
    setLocalSchedule(next.map((d) => ({ ...d, hours: calculateHours(d) })));
  };

  const handleTimeChange = (
    idx: number,
    field: 'start_time' | 'end_time',
    value: string,
  ) => {
    setLocalSchedule((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)),
    );
  };

  const handleSave = () => {
    const errors: string[] = [];
    localSchedule.forEach((day) => {
      if (day.checked) {
        if (!TIME_REGEX.test(day.start_time))
          errors.push('Invalid time format (HH:mm)');
        if (!TIME_REGEX.test(day.end_time))
          errors.push('Invalid time format (HH:mm)');
      }
    });
    if (errors.length > 0) {
      setTimeErrors(errors);
      return;
    }
    setTimeErrors([]);
    fieldData.onSubmit(localSchedule);
    setIsOpen(false);
  };

  const { totalWorkHours } = fieldData.defaultFormattedValue;

  return (
    <div>
      <p style={{ fontWeight: 600, margin: '0 0 2px' }}>Work hours</p>
      <p style={{ margin: '0 0 8px', color: '#6b7280', fontSize: 14 }}>
        {'Total of '}
        {totalWorkHours}
        {' hours per week'}
      </p>
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        style={{
          padding: '6px 14px',
          borderRadius: 6,
          border: '1px solid #d1d5db',
          cursor: 'pointer',
        }}
      >
        Edit Schedule
      </button>
      {isOpen && (
        <div
          style={{
            marginTop: 12,
            padding: 16,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
          }}
        >
          <h2 style={{ margin: '0 0 12px', fontSize: 16 }}>
            Edit employee working hours
          </h2>
          {localSchedule.map((day, idx) => (
            <div
              key={day.day}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <input
                type='checkbox'
                id={`ws-${day.day}`}
                checked={day.checked}
                onChange={(e) => handleCheckboxChange(idx, e.target.checked)}
              />
              <label
                htmlFor={`ws-${day.day}`}
                style={{ width: 36, fontWeight: 500 }}
              >
                {DAY_ABBREVS[day.day.toLowerCase()]}
              </label>
              {day.checked && (
                <>
                  <input
                    type='text'
                    value={day.start_time}
                    onChange={(e) =>
                      handleTimeChange(idx, 'start_time', e.target.value)
                    }
                    style={{
                      border: '1px solid #d1d5db',
                      borderRadius: 4,
                      padding: '4px 8px',
                      width: 80,
                    }}
                  />
                  <input
                    type='text'
                    value={day.end_time}
                    onChange={(e) =>
                      handleTimeChange(idx, 'end_time', e.target.value)
                    }
                    style={{
                      border: '1px solid #d1d5db',
                      borderRadius: 4,
                      padding: '4px 8px',
                      width: 80,
                    }}
                  />
                </>
              )}
            </div>
          ))}
          {timeErrors.map((err, i) => (
            <p
              key={i}
              style={{ color: '#dc2626', fontSize: 13, margin: '4px 0' }}
            >
              {err}
            </p>
          ))}
          <button
            type='button'
            onClick={handleSave}
            style={{
              marginTop: 8,
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              cursor: 'pointer',
            }}
          >
            Save Schedule
          </button>
        </div>
      )}
    </div>
  );
}

function ZendeskDrawerSimple({
  open,
  onClose,
  data,
  isLoading,
  error,
  zendeskURL,
  Trigger,
}: ZendeskDrawerComponentProps) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <div>
      {Trigger}
      {open && (
        <div
          data-testid='zendesk-drawer'
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 360,
            height: '100%',
            background: '#fff',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
            padding: 24,
            overflowY: 'auto',
            zIndex: 100,
          }}
        >
          {isLoading && <div>Loading...</div>}
          {error && (
            <div style={{ color: '#dc2626' }}>Error loading article</div>
          )}
          {data?.title && (
            <strong style={{ display: 'block', marginBottom: 8 }}>
              {data.title}
            </strong>
          )}
          {data?.body && (
            <div dangerouslySetInnerHTML={{ __html: data.body }} />
          )}
          <a
            href={zendeskURL}
            target='_blank'
            rel='noopener noreferrer'
            style={{ color: '#2563eb', display: 'block', marginTop: 12 }}
          >
            help article
          </a>
          <button
            onClick={onClose}
            style={{
              marginTop: 16,
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export const defaultComponents: Components = {
  text: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div
      className='input-container'
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        marginBottom: 12,
      }}
    >
      <label htmlFor={field.name} style={{ fontWeight: 600, fontSize: 14 }}>
        {fieldData.label}
      </label>
      <input
        type='text'
        id={field.name}
        name={field.name}
        value={field.value ?? ''}
        ref={field.ref}
        onBlur={field.onBlur}
        placeholder={fieldData.label as string}
        onChange={(e) => field.onChange(e)}
        style={{
          border: '1px solid #d1d5db',
          borderRadius: 6,
          padding: '8px 10px',
          fontSize: 14,
          outline: 'none',
        }}
      />
      {fieldData.description && (
        <p
          className='input-description'
          style={{ margin: 0, fontSize: 12, color: '#6b7280' }}
        >
          {fieldData.description as string}
        </p>
      )}
      {fieldState.error && (
        <p
          className='error-message'
          style={{ margin: 0, fontSize: 12, color: '#dc2626' }}
        >
          {fieldState.error.message}
        </p>
      )}
    </div>
  ),
  email: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div
      className='input-container'
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        marginBottom: 12,
      }}
    >
      <label htmlFor={field.name} style={{ fontWeight: 600, fontSize: 14 }}>
        {fieldData.label}
      </label>
      <input
        type='email'
        id={field.name}
        name={field.name}
        value={field.value ?? ''}
        ref={field.ref}
        onBlur={field.onBlur}
        onChange={(e) => field.onChange(e)}
        style={{
          border: '1px solid #d1d5db',
          borderRadius: 6,
          padding: '8px 10px',
          fontSize: 14,
          outline: 'none',
        }}
      />
      {fieldState.error && (
        <p
          className='error-message'
          style={{ margin: 0, fontSize: 12, color: '#dc2626' }}
        >
          {fieldState.error.message}
        </p>
      )}
    </div>
  ),
  number: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div
      className='input-container'
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        marginBottom: 12,
      }}
    >
      <label htmlFor={field.name} style={{ fontWeight: 600, fontSize: 14 }}>
        {fieldData.label}
      </label>
      <input
        type='text'
        id={field.name}
        name={field.name}
        value={field.value ?? ''}
        ref={field.ref}
        onBlur={field.onBlur}
        placeholder={fieldData.label as string}
        onChange={(e) => field.onChange(e)}
        style={{
          border: '1px solid #d1d5db',
          borderRadius: 6,
          padding: '8px 10px',
          fontSize: 14,
          outline: 'none',
        }}
      />
      {fieldData.description && (
        <p
          className='input-description'
          style={{ margin: 0, fontSize: 12, color: '#6b7280' }}
        >
          {fieldData.description as string}
        </p>
      )}
      {fieldState.error && (
        <p
          className='error-message'
          style={{ margin: 0, fontSize: 12, color: '#dc2626' }}
        >
          {fieldState.error.message}
        </p>
      )}
    </div>
  ),
  textarea: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div
      className='input-container'
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        marginBottom: 12,
      }}
    >
      <label htmlFor={field.name} style={{ fontWeight: 600, fontSize: 14 }}>
        {fieldData.label}
      </label>
      <textarea
        id={field.name}
        name={field.name}
        value={field.value ?? ''}
        ref={field.ref}
        onBlur={field.onBlur}
        onChange={(e) => field.onChange(e)}
        style={{
          border: '1px solid #d1d5db',
          borderRadius: 6,
          padding: '8px 10px',
          fontSize: 14,
          outline: 'none',
          minHeight: 80,
          resize: 'vertical',
        }}
      />
      {fieldData.description && (
        <p
          className='input-description'
          style={{ margin: 0, fontSize: 12, color: '#6b7280' }}
        >
          {fieldData.description as string}
        </p>
      )}
      {fieldState.error && (
        <p
          className='error-message'
          style={{ margin: 0, fontSize: 12, color: '#dc2626' }}
        >
          {fieldState.error.message}
        </p>
      )}
    </div>
  ),
  date: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div
      className='input-container'
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        marginBottom: 12,
      }}
    >
      <label htmlFor={field.name} style={{ fontWeight: 600, fontSize: 14 }}>
        {fieldData.label}
      </label>
      <input
        type='date'
        id={field.name}
        data-testid={field.name}
        value={field.value ?? ''}
        onChange={(e) => {
          field?.onChange?.(e.target.value);
        }}
        style={{
          border: '1px solid #d1d5db',
          borderRadius: 6,
          padding: '8px 10px',
          fontSize: 14,
          outline: 'none',
        }}
      />
      {fieldData.description && (
        <p
          className='input-description'
          style={{ margin: 0, fontSize: 12, color: '#6b7280' }}
        >
          {fieldData.description as string}
        </p>
      )}
      {fieldState.error && (
        <p
          className='error-message'
          style={{ margin: 0, fontSize: 12, color: '#dc2626' }}
        >
          {fieldState.error.message}
        </p>
      )}
    </div>
  ),
  select: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div
      className='input-container'
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        marginBottom: 12,
      }}
    >
      <label htmlFor={field.name} style={{ fontWeight: 600, fontSize: 14 }}>
        {fieldData.label}
      </label>
      <select
        id={field.name}
        data-testid={field.name}
        value={field.value ?? ''}
        onChange={(e) => {
          field?.onChange?.(e.target.value);
        }}
        style={{
          border: '1px solid #d1d5db',
          borderRadius: 6,
          padding: '8px 10px',
          fontSize: 14,
          outline: 'none',
          background: '#fff',
        }}
      >
        <option value=''>Select an option</option>
        {fieldData.options?.map((option: { value: string; label: string }) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {fieldData.description && (
        <p
          className='input-description'
          style={{ margin: 0, fontSize: 12, color: '#6b7280' }}
        >
          {fieldData.description as string}
        </p>
      )}
      {fieldState.error && (
        <p
          className='error-message'
          style={{ margin: 0, fontSize: 12, color: '#dc2626' }}
        >
          {fieldState.error.message}
        </p>
      )}
    </div>
  ),
  countries: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div
      className='input-container'
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        marginBottom: 12,
      }}
    >
      <label htmlFor={field.name} style={{ fontWeight: 600, fontSize: 14 }}>
        {fieldData.label}
      </label>
      <select
        id={field.name}
        data-testid={field.name}
        value={field.value ?? ''}
        onChange={(e) => {
          field?.onChange?.(e.target.value);
        }}
        style={{
          border: '1px solid #d1d5db',
          borderRadius: 6,
          padding: '8px 10px',
          fontSize: 14,
          outline: 'none',
          background: '#fff',
        }}
      >
        <option value=''>Select a country</option>
        {fieldData.options?.map((option: { value: string; label: string }) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {fieldData.description && (
        <p
          className='input-description'
          style={{ margin: 0, fontSize: 12, color: '#6b7280' }}
        >
          {fieldData.description as string}
        </p>
      )}
      {fieldState.error && (
        <p
          className='error-message'
          style={{ margin: 0, fontSize: 12, color: '#dc2626' }}
        >
          {fieldState.error.message}
        </p>
      )}
    </div>
  ),
  radio: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <fieldset
      role='radiogroup'
      aria-label={(fieldData.label || fieldData.name) as string}
      style={{ border: 'none', padding: 0, margin: '0 0 12px' }}
    >
      <legend style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
        {fieldData.label}
      </legend>
      {fieldData.description && (
        <p
          className='input-description'
          style={{ margin: '0 0 6px', fontSize: 12, color: '#6b7280' }}
        >
          {fieldData.description as string}
        </p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {fieldData.options?.map(
          (option: { value: string; label: string; disabled?: boolean }) => (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: option.disabled ? 'not-allowed' : 'pointer',
                opacity: option.disabled ? 0.5 : 1,
              }}
            >
              <input
                type='radio'
                name={field.name}
                value={option.value}
                checked={field.value === option.value}
                disabled={option.disabled}
                onChange={() => field?.onChange?.(option.value)}
              />
              {option.label}
            </label>
          ),
        )}
      </div>
      {fieldState.error && (
        <p
          className='error-message'
          style={{ margin: '4px 0 0', fontSize: 12, color: '#dc2626' }}
        >
          {fieldState.error.message}
        </p>
      )}
    </fieldset>
  ),
  checkbox: ({ field, fieldData, fieldState }: FieldComponentProps) => {
    if (fieldData.multiple && fieldData.options) {
      return (
        <div
          className='input-container'
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            marginBottom: 12,
          }}
        >
          <label style={{ fontWeight: 600, fontSize: 14 }}>
            {fieldData.label as string}
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {fieldData.options.map(
              (option: { value: string; label: string }) => (
                <div
                  key={option.value}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <input
                    {...field}
                    type='checkbox'
                    id={option.value}
                    onChange={(e) =>
                      field.onChange(e.target.checked, option.value)
                    }
                    checked={field.value?.includes(option.value)}
                  />
                  <label htmlFor={option.value}>{option.label}</label>
                </div>
              ),
            )}
          </div>
          {fieldState.error && (
            <p
              className='error-message'
              style={{ margin: 0, fontSize: 12, color: '#dc2626' }}
            >
              {fieldState.error.message}
            </p>
          )}
        </div>
      );
    }
    return (
      <div
        className='input-container'
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          marginBottom: 12,
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
        >
          <input
            {...field}
            type='checkbox'
            aria-label={fieldData.label as string}
            checked={!!field.value}
            onChange={(e) => field?.onChange?.(e.target.checked)}
          />
          {fieldData.label}
        </label>
        {fieldData.description && (
          <p
            className='input-description'
            style={{ margin: 0, fontSize: 12, color: '#6b7280' }}
          >
            {fieldData.description as string}
          </p>
        )}
        {fieldState.error && (
          <p
            className='error-message'
            style={{ margin: 0, fontSize: 12, color: '#dc2626' }}
          >
            {fieldState.error.message}
          </p>
        )}
      </div>
    );
  },
  file: ({ field, fieldData, fieldState }: FieldComponentProps) => {
    const files: File[] = Array.isArray(field.value) ? field.value : [];
    return (
      <div
        className='input-container'
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          marginBottom: 12,
        }}
      >
        <label htmlFor={field.name} style={{ fontWeight: 600, fontSize: 14 }}>
          {fieldData.label as string}
        </label>
        {files.length > 0 && (
          <ul
            style={{
              margin: 0,
              padding: '0 0 0 16px',
              fontSize: 13,
              color: '#374151',
            }}
          >
            {files.map((f, i) => (
              <li key={i}>{f.name}</li>
            ))}
          </ul>
        )}
        <input
          type='file'
          id={field.name}
          aria-label={fieldData.label as string}
          onChange={(e) => field?.onChange?.(Array.from(e.target.files ?? []))}
          style={{ fontSize: 14 }}
        />
        {fieldData.description && (
          <p
            className='input-description'
            style={{ margin: 0, fontSize: 12, color: '#6b7280' }}
          >
            {fieldData.description as string}
          </p>
        )}
        {fieldState.error && (
          <p
            className='error-message'
            style={{ margin: 0, fontSize: 12, color: '#dc2626' }}
          >
            {fieldState.error.message}
          </p>
        )}
      </div>
    );
  },
  'multi-select': MultiSelectField,
  fieldsetToggle: ({
    onToggle,
    children,
    ...props
  }: FieldSetToggleComponentProps) => (
    <button type='button' onClick={onToggle} {...props}>
      {children}
    </button>
  ),
  button: ({ children, onClick, ...props }: ButtonComponentProps) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  'work-schedule': WorkScheduleField,
  statement: ({ data }: StatementComponentProps) => (
    <div
      style={{
        marginBottom: 12,
        padding: 12,
        background: '#f9fafb',
        borderRadius: 6,
      }}
    >
      {data.title && (
        <strong style={{ display: 'block', marginBottom: 4 }}>
          {data.title}
        </strong>
      )}
      {data.description && (
        <p style={{ margin: 0, color: '#374151', fontSize: 14 }}>
          {data.description}
        </p>
      )}
    </div>
  ),
  table: ({
    data = [],
    columns,
    className = '',
  }: TableComponentProps<$TSFixMe>) => (
    <table
      className={`RemoteFlows__Table ${className}`}
      style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}
    >
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={String(col.id)}
              className={col.className}
              style={{
                textAlign: 'left',
                padding: '8px 12px',
                borderBottom: '2px solid #e5e7eb',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex} style={{ borderBottom: '1px solid #e5e7eb' }}>
            {columns.map((col) => (
              <td
                key={String(col.id)}
                className={[col.className, col.cellClassName]
                  .filter(Boolean)
                  .join(' ')}
                style={{ padding: '8px 12px', color: '#374151' }}
              >
                {col.render
                  ? col.render(row[col.id], row, rowIndex)
                  : row[col.id]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
  drawer: ({
    open,
    onOpenChange,
    title,
    trigger,
    children,
  }: DrawerComponentProps) => (
    <div>
      <span onClick={() => onOpenChange(!open)} style={{ cursor: 'pointer' }}>
        {trigger}
      </span>
      {open && (
        <div
          data-testid='drawer'
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 360,
            height: '100%',
            background: '#fff',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
            padding: 24,
            overflowY: 'auto',
            zIndex: 100,
          }}
        >
          <strong style={{ display: 'block', marginBottom: 12, fontSize: 16 }}>
            {title}
          </strong>
          {children}
        </div>
      )}
    </div>
  ),
  zendeskDrawer: ZendeskDrawerSimple,
  pdfViewer: ({
    base64Data,
    fileName = 'document.pdf',
  }: PDFPreviewComponentProps) => {
    if (!base64Data) {
      return (
        <div
          style={{
            padding: 32,
            textAlign: 'center',
            background: '#f9fafb',
            borderRadius: 8,
            border: '1px solid #e5e7eb',
          }}
        >
          <p style={{ color: '#6b7280', margin: 0 }}>No PDF data available</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <iframe
          src={base64Data}
          title={fileName}
          style={{
            width: '100%',
            height: 600,
            border: '1px solid #e5e7eb',
            borderRadius: 6,
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 13,
          }}
        >
          <p style={{ margin: 0, color: '#6b7280' }}>{fileName}</p>
          <a
            href={base64Data}
            download={fileName}
            style={{ color: '#2563eb', textDecoration: 'none' }}
          >
            Download PDF
          </a>
        </div>
      </div>
    );
  },
};
