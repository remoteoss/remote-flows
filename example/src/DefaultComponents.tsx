import { Components } from '@remoteoss/remote-flows';
import { CountryFieldDefault } from './components/defaults/CountryFieldDefault';
import { MultiSelectFieldDefault } from './components/defaults/MultiSelectFieldDefault';
import { TextFieldDefault } from './components/defaults/TextFieldDefault';
import { TextAreaFieldDefault } from './components/defaults/TextAreaFieldDefault';
import { SelectFieldDefault } from './components/defaults/SelectFieldDefault';
import { CheckboxFieldDefault } from './components/defaults/CheckboxFieldDefault';
import { RadioGroupFieldDefault } from './components/defaults/RadioGroupFieldDefault';
import { DatePickerFieldDefault } from './components/defaults/DatePickerFieldDefault';
import { ButtonDefault } from './components/defaults/ButtonDefault';
import { EmailFieldDefault } from './components/defaults/EmailFieldDefault';
import { NumberFieldDefault } from './components/defaults/NumberFieldDefault';
import { StatementDefault } from './components/defaults/StatementDefault';
import { PDFPreviewDefault } from './components/defaults/PDFPreviewDefault';
import { FileUploadFieldDefault } from './components/defaults/FileUploadFieldDefault';

export const defaultComponents: Components = {
  text: TextFieldDefault,
  textarea: TextAreaFieldDefault,
  select: SelectFieldDefault,
  checkbox: CheckboxFieldDefault,
  radio: RadioGroupFieldDefault,
  date: DatePickerFieldDefault,
  button: ButtonDefault,
  email: EmailFieldDefault,
  number: NumberFieldDefault,
  statement: StatementDefault,
  countries: CountryFieldDefault,
  'multi-select': MultiSelectFieldDefault,
  pdfViewer: PDFPreviewDefault,
  file: FileUploadFieldDefault,
};
