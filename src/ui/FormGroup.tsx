import React from 'react';
import { ReactNode } from 'react';
import * as Label from '@radix-ui/react-label';

import './FormGroup.css';

export type FormGroupProps = {
  /**
   * The input component
   */
  children: ReactNode;
  /**
   * Text that is used alongside the control label for additional help
   */
  description?: ReactNode | string;

  /**
   * Specify the unique identifier for the input. Will use `name` if undefined
   * @default name
   */
  id?: string;

  /**
   * `name` attribute for the underlying `<button>` element
   */
  name: string;

  /**
   * Text read by a screen reader when visiting this control
   */
  label: ReactNode;
};

export const FormGroup = ({
  children,
  description,
  label,
  name,
  id,
}: FormGroupProps) => {
  const htmlFor = id || name;
  return (
    <div className="rmt-FormGroup">
      <Label.Root htmlFor={htmlFor} className="rmt-FormGroupLabel">
        {label}
      </Label.Root>
      {children}

      {description && (
        <span id={`${htmlFor}-help-text`} className="rmt-FormGroupDescription">
          {description}
        </span>
      )}
    </div>
  );
};
