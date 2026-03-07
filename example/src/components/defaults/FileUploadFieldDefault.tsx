import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { FileUploader } from '../ui/file-uploader';
import { FileComponentProps } from '@remoteoss/remote-flows';

export function FileUploadFieldDefault({
  field,
  fieldState,
  fieldData,
}: FileComponentProps) {
  const { name, label, description, multiple, accept } = fieldData;

  return (
    <FormItem
      data-field={name}
      className={`RemoteFlows__FileUpload__Item__${name}`}
    >
      <FormLabel className='RemoteFlows__FileUpload__Label'>{label}</FormLabel>
      <FormControl>
        <FileUploader
          onChange={field.onChange}
          multiple={multiple}
          accept={accept}
          files={field.value}
        />
      </FormControl>
      {description && (
        <FormDescription className='RemoteFlows__FileUpload__Description'>
          {description}
        </FormDescription>
      )}
      {fieldState.error && (
        <FormMessage className='RemoteFlows__FileUpload__Error' />
      )}
    </FormItem>
  );
}
