import { useEffect, useState } from 'react';
import { FieldComponentProps, WorkScheduleComponentProps, StatementComponentProps } from '@/src/types/fields';
import {
  Components,
  FieldSetToggleComponentProps,
  ButtonComponentProps,
  ZendeskDrawerComponentProps,
  DrawerComponentProps,
  TableComponentProps,
  $TSFixMe,
} from '@/src/types/remoteFlows';
import {
  DAYS_OF_THE_WEEK,
  calculateHours,
  DailySchedule,
} from '@/src/components/form/fields/workScheduleUtils';

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

function MultiSelectField({ field, fieldData, fieldState }: FieldComponentProps) {
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
      <label>{fieldData.label as string}</label>
      {selected.map((val) => {
        const opt = options.find((o) => o.value === val);
        return opt ? (
          <span key={val}>
            {opt.label}
            <button
              aria-label={`remove ${opt.label}`}
              onClick={() => field.onChange(selected.filter((v) => v !== val))}
              onKeyDown={(e) => {
                if (e.key === 'Enter')
                  field.onChange(selected.filter((v) => v !== val));
              }}
            >
              ×
            </button>
          </span>
        ) : null;
      })}
      <div
        role='combobox'
        aria-expanded={isOpen}
        aria-haspopup='listbox'
        onClick={() => setIsOpen((o) => !o)}
      >
        Select...
      </div>
      {isOpen && (
        <ul role='listbox'>
          {options.length === 0 ? (
            <li>No item found.</li>
          ) : (
            options.map((opt) => (
              <li
                key={opt.value}
                role='option'
                aria-selected={selected.includes(opt.value)}
                onClick={() => toggleOption(opt.value)}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
      {fieldData.description && <p>{fieldData.description as string}</p>}
      {fieldState.error && <p>{fieldState.error.message}</p>}
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
    // Recalculate hours for all days on checked state change
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
      <p>Work hours</p>
      <p>
        {'Total of '}
        {totalWorkHours}
        {' hours per week'}
      </p>
      <button type='button' onClick={() => setIsOpen(true)}>
        Edit Schedule
      </button>
      {isOpen && (
        <div>
          <h2>Edit employee working hours</h2>
          {localSchedule.map((day, idx) => (
            <div key={day.day}>
              <input
                type='checkbox'
                id={`ws-${day.day}`}
                checked={day.checked}
                onChange={(e) => handleCheckboxChange(idx, e.target.checked)}
              />
              <label htmlFor={`ws-${day.day}`}>
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
                  />
                  <input
                    type='text'
                    value={day.end_time}
                    onChange={(e) =>
                      handleTimeChange(idx, 'end_time', e.target.value)
                    }
                  />
                </>
              )}
            </div>
          ))}
          {timeErrors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
          <button type='button' onClick={handleSave}>
            Save Schedule
          </button>
        </div>
      )}
    </div>
  );
}

function ZendeskDrawerDefault({
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
        <div data-testid='zendesk-drawer'>
          {isLoading && <div>Loading...</div>}
          {error && <div>Error loading article</div>}
          {data?.title && <strong>{data.title}</strong>}
          {data?.body && (
            <div dangerouslySetInnerHTML={{ __html: data.body }} />
          )}
          <a href={zendeskURL} target='_blank' rel='noopener noreferrer'>
            help article
          </a>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
}

export const defaultComponents: Components = {
  text: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <input
        type='text'
        id={field.name}
        name={field.name}
        value={field.value ?? ''}
        ref={field.ref}
        onBlur={field.onBlur}
        placeholder={fieldData.label as string}
        onChange={(e) => field.onChange(e.target.value)}
      />
      {fieldData.description && (
        <p className='input-description'>{fieldData.description as string}</p>
      )}
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
  email: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <input
        type='email'
        id={field.name}
        name={field.name}
        value={field.value ?? ''}
        ref={field.ref}
        onBlur={field.onBlur}
        onChange={(e) => field.onChange(e.target.value)}
      />
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
  number: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <input
        type='number'
        id={field.name}
        name={field.name}
        value={field.value ?? ''}
        ref={field.ref}
        onBlur={field.onBlur}
        placeholder={fieldData.label as string}
        onChange={(e) => field.onChange(e.target.value)}
      />
      {fieldData.description && (
        <p className='input-description'>{fieldData.description as string}</p>
      )}
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
  textarea: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <textarea
        id={field.name}
        name={field.name}
        value={field.value ?? ''}
        ref={field.ref}
        onBlur={field.onBlur}
        onChange={(e) => field.onChange(e.target.value)}
      />
      {fieldData.description && (
        <p className='input-description'>{fieldData.description as string}</p>
      )}
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
  date: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <input
        type='date'
        id={field.name}
        data-testid={field.name}
        value={field.value ?? ''}
        onChange={(e) => {
          field?.onChange?.(e.target.value);
        }}
      />
      {fieldData.description && (
        <p className='input-description'>{fieldData.description as string}</p>
      )}
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
  select: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <select
        id={field.name}
        data-testid={field.name}
        value={field.value ?? ''}
        onChange={(e) => {
          field?.onChange?.(e.target.value);
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
        <p className='input-description'>{fieldData.description as string}</p>
      )}
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
  countries: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label htmlFor={field.name}>{fieldData.label}</label>
      <select
        id={field.name}
        data-testid={field.name}
        value={field.value ?? ''}
        onChange={(e) => {
          field?.onChange?.(e.target.value);
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
        <p className='input-description'>{fieldData.description as string}</p>
      )}
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
  radio: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <fieldset role='radiogroup' aria-label={fieldData.label as string}>
      <legend>{fieldData.label}</legend>
      {fieldData.description && (
        <p className='input-description'>{fieldData.description as string}</p>
      )}
      {fieldData.options?.map(
        (option: { value: string; label: string; disabled?: boolean }) => (
          <label key={option.value}>
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
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </fieldset>
  ),
  checkbox: ({ field, fieldData, fieldState }: FieldComponentProps) => {
    if (fieldData.multiple && fieldData.options) {
      return (
        <div className='input-container'>
          <label>{fieldData.label as string}</label>
          {fieldData.options.map(
            (option: { value: string; label: string }) => (
              <div key={option.value}>
                <input
                  type='checkbox'
                  id={option.value}
                  onChange={(e) =>
                    field?.onChange?.(e.target.checked, option.value)
                  }
                />
                <label htmlFor={option.value}>{option.label}</label>
              </div>
            ),
          )}
          {fieldState.error && (
            <p className='error-message'>{fieldState.error.message}</p>
          )}
        </div>
      );
    }
    return (
      <div className='input-container'>
        <label>
          <input
            type='checkbox'
            aria-label={fieldData.label as string}
            checked={!!field.value}
            onChange={(e) => field?.onChange?.(e.target.checked)}
          />
          {fieldData.label}
        </label>
        {fieldData.description && (
          <p className='input-description'>{fieldData.description as string}</p>
        )}
        {fieldState.error && (
          <p className='error-message'>{fieldState.error.message}</p>
        )}
      </div>
    );
  },
  file: ({ field, fieldData, fieldState }: FieldComponentProps) => (
    <div className='input-container'>
      <label>{fieldData.label as string}</label>
      <button type='button'>Upload</button>
      <input
        type='file'
        aria-label='File upload'
        onChange={(e) => field?.onChange?.(e)}
      />
      {fieldData.description && (
        <p className='input-description'>{fieldData.description as string}</p>
      )}
      {fieldState.error && (
        <p className='error-message'>{fieldState.error.message}</p>
      )}
    </div>
  ),
  'multi-select': MultiSelectField,
  fieldsetToggle: ({
    onToggle,
    children,
    ...props
  }: FieldSetToggleComponentProps) => (
    <button onClick={onToggle} {...props}>
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
    <div>
      {data.title && <strong>{data.title}</strong>}
      {data.description && <p>{data.description}</p>}
    </div>
  ),
  table: ({ data = [], columns, className = '' }: TableComponentProps<$TSFixMe>) => (
    <table className={`RemoteFlows__Table ${className}`}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.id)} className={col.className}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((col) => (
              <td
                key={String(col.id)}
                className={[col.className, col.cellClassName]
                  .filter(Boolean)
                  .join(' ')}
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
      <span onClick={() => onOpenChange(!open)}>{trigger}</span>
      {open && (
        <div data-testid='drawer'>
          <strong>{title}</strong>
          {children}
        </div>
      )}
    </div>
  ),
  zendeskDrawer: ZendeskDrawerDefault,
};
