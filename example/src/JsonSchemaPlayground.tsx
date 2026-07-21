import { useState } from 'react';
import {
  JsonSchemaPlaygroundFlow,
  SIMPLE_SALARY_TEST_INITIAL_VALUES,
} from '@remoteoss/remote-flows/internals';
import { RemoteFlows } from './RemoteFlows';

export const JsonSchemaPlayground = () => {
  const [submissionCount, setSubmissionCount] = useState(0);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  return (
    <RemoteFlows
      authType='company-manager'
      proxy={{ url: window.location.origin }}
    >
      <JsonSchemaPlaygroundFlow
        defaultSchema='simple-salary-test'
        initialValues={SIMPLE_SALARY_TEST_INITIAL_VALUES}
        onSubmit={(values) => {
          console.log('Form submitted:', values);
          setSubmissionCount((prev) => prev + 1);
          setFormErrors([]); // Clear errors on successful submission
        }}
        render={({ playgroundBag, components }) => (
          <div className='max-w-6xl mx-auto p-6 space-y-6'>
            {/* Header */}
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                JSON Schema Playground
              </h1>
              <p className='text-gray-600'>
                Test different JSON schemas and see how they render as forms.
                Select a schema, fill out the form, and see the submitted
                values.
              </p>
            </div>

            {/* Schema Selection */}
            <div className='bg-white rounded-lg shadow-sm border p-6'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                Select Schema
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {playgroundBag.availableSchemas.map(
                  (schema: {
                    key: string;
                    name: string;
                    description: string;
                  }) => (
                    <button
                      key={schema.key}
                      onClick={() =>
                        playgroundBag.handleSchemaChange(schema.key)
                      }
                      className={`p-4 text-left border rounded-lg transition-colors ${
                        playgroundBag.selectedSchema === schema.key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h3 className='font-medium text-gray-900 mb-1'>
                        {schema.name}
                      </h3>
                      <p className='text-sm text-gray-500'>
                        {schema.description}
                      </p>
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Current Schema Info */}
            <div className='bg-blue-50 rounded-lg border border-blue-200 p-4'>
              <h3 className='font-medium text-blue-900 mb-1'>
                Current Schema: {playgroundBag.currentSchemaData.name}
              </h3>
              <p className='text-sm text-blue-700'>
                {playgroundBag.currentSchemaData.description}
              </p>
              <p className='text-sm text-blue-600 mt-2'>
                Fields: {playgroundBag.fields.length} | Submissions:{' '}
                {submissionCount} | Pre-filled with sample data
                {formErrors.length > 0 && (
                  <span className='text-red-600 font-medium'>
                    {' '}
                    | ⚠️ {formErrors.length} validation error(s)
                  </span>
                )}
              </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Form */}
              <div className='bg-white rounded-lg shadow-sm border'>
                <div className='px-6 py-4 border-b border-gray-200'>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    Generated Form
                  </h2>
                </div>
                <div className='p-6'>
                  {playgroundBag.isLoading ? (
                    <div className='flex items-center justify-center py-8'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
                    </div>
                  ) : (
                    <>
                      <components.Form
                        className='space-y-4'
                        onValidationError={setFormErrors}
                      />

                      {/* Error Display */}
                      {formErrors.length > 0 && (
                        <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-md'>
                          <div className='flex'>
                            <div className='flex-shrink-0'>
                              <svg
                                className='h-5 w-5 text-red-400'
                                viewBox='0 0 20 20'
                                fill='currentColor'
                              >
                                <path
                                  fillRule='evenodd'
                                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                                  clipRule='evenodd'
                                />
                              </svg>
                            </div>
                            <div className='ml-3'>
                              <h3 className='text-sm font-medium text-red-800'>
                                Validation Errors ({formErrors.length})
                              </h3>
                              <div className='mt-2 text-sm text-red-700'>
                                <ul className='list-disc list-inside space-y-1'>
                                  {formErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className='flex gap-3 mt-6 pt-6 border-t'>
                        <components.SubmitButton className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'>
                          Submit Form
                        </components.SubmitButton>
                        <components.ResetButton
                          className='px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700'
                          onClick={() => setFormErrors([])} // Clear errors when resetting
                        >
                          Reset Form
                        </components.ResetButton>
                        {formErrors.length > 0 && (
                          <button
                            type='button'
                            onClick={() => setFormErrors([])}
                            className='px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 border border-red-300'
                          >
                            Clear Errors
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className='bg-white rounded-lg shadow-sm border'>
                <div className='px-6 py-4 border-b border-gray-200 flex justify-between items-center'>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    Submission Results
                  </h2>
                  {playgroundBag.submittedResults.length > 0 && (
                    <button
                      onClick={playgroundBag.clearResults}
                      className='text-sm text-red-600 hover:text-red-700'
                    >
                      Clear Results
                    </button>
                  )}
                </div>
                <div className='p-6'>
                  {playgroundBag.submittedResults.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <p>No submissions yet.</p>
                      <p className='text-sm mt-1'>
                        Fill out and submit the form to see results here.
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-4 max-h-96 overflow-y-auto'>
                      {playgroundBag.submittedResults.map(
                        (result, index: number) => (
                          <div
                            key={result.timestamp}
                            className={`border rounded-lg p-4 ${
                              result.success
                                ? 'border-green-200 bg-green-50'
                                : 'border-red-200 bg-red-50'
                            }`}
                          >
                            <div className='flex items-center justify-between mb-2'>
                              <span
                                className={`text-sm font-medium ${
                                  result.success
                                    ? 'text-green-800'
                                    : 'text-red-800'
                                }`}
                              >
                                Submission #
                                {playgroundBag.submittedResults.length - index}
                                {result.success ? ' (Success)' : ' (Error)'}
                              </span>
                              <span className='text-xs text-gray-500'>
                                {new Date(result.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <pre
                              className={`text-xs overflow-auto p-3 rounded ${
                                result.success
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Debug (collapsible) */}
            <details className='bg-yellow-50 rounded-lg border border-yellow-200'>
              <summary className='px-6 py-4 cursor-pointer font-medium text-yellow-900 hover:bg-yellow-100'>
                Debug: Form State & Values
              </summary>
              <div className='px-6 pb-4 space-y-4'>
                <div>
                  <h4 className='text-sm font-medium text-yellow-900 mb-2'>
                    Current Field Values:
                  </h4>
                  <pre className='text-xs bg-white p-4 rounded border overflow-auto max-h-48'>
                    {JSON.stringify(playgroundBag.fieldValues, null, 2)}
                  </pre>
                </div>

                {formErrors.length > 0 && (
                  <div>
                    <h4 className='text-sm font-medium text-red-900 mb-2'>
                      Current Errors:
                    </h4>
                    <pre className='text-xs bg-red-50 p-4 rounded border border-red-200 overflow-auto max-h-48'>
                      {JSON.stringify(formErrors, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <h4 className='text-sm font-medium text-yellow-900 mb-2'>
                    Form Fields ({playgroundBag.fields.length}):
                  </h4>
                  <pre className='text-xs bg-white p-4 rounded border overflow-auto max-h-48'>
                    {JSON.stringify(
                      playgroundBag.fields.map((f) => ({
                        name: f.name,
                        type: f.type,
                        required: f.required,
                      })),
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>
            </details>

            {/* Schema Debug (collapsible) */}
            <details className='bg-gray-50 rounded-lg border'>
              <summary className='px-6 py-4 cursor-pointer font-medium text-gray-900 hover:bg-gray-100'>
                Debug: Current Schema JSON
              </summary>
              <div className='px-6 pb-4'>
                <pre className='text-xs bg-white p-4 rounded border overflow-auto max-h-96'>
                  {JSON.stringify(
                    playgroundBag.currentSchemaData.schema,
                    null,
                    2,
                  )}
                </pre>
              </div>
            </details>
          </div>
        )}
      />
    </RemoteFlows>
  );
};
