import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Client } from '@/src/client/client';
import {
  getIndexEmploymentFile,
  getShowFile,
  postUploadEmployeeFileFile,
} from '@/src/client/sdk.gen';
import {
  GetIndexEmploymentFileData,
  GetIndexEmploymentFileErrors,
  File as ApiFile,
  ListFilesResponse,
  PostUploadEmployeeFileFileData,
} from '@/src/client/types.gen';
import { useClient } from '@/src/context';

/*
 * Hook to upload a file associated with a specified employment.
 * @param {string} employmentId - The ID of the employment to upload the file for.
 * @returns {UseMutationResult<UploadFileResponse, Error, PostUploadEmployeeFileFileData['body']>} - The mutation result.
 */
export const useUploadFile = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (params: PostUploadEmployeeFileFileData['body']) => {
      return postUploadEmployeeFileFile({
        client: client as Client,
        body: params,
        headers: {
          Authorization: ``,
        },
      });
    },
  });
};

/*
 * Hook to download a file associated with a specified employment.
 * @param {string} id - The ID of the file to download.
 * @returns {UseQueryResult<ApiFile, Error>} - The query result.
 */
export const useDownloadFile = (id: string) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['download-file', id],
    queryFn: async () => {
      const result = await getShowFile({
        client: client as Client,
        path: { id: id },
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    },
    select: ({ data }) => data?.file,
    enabled: !!id,
  });
};

/*
 * Hook to retrieve files associated with a specific employment.
 * @param {string} employmentId - The ID of the employment to retrieve files for.
 * @param {GetIndexEmploymentFileData['query']} queryParams - The query parameters to filter the files.
 * @returns {UseQueryResult<ListFilesResponse, GetIndexEmploymentFileErrors>} - The query result.
 */

export const useEmploymentFiles = (
  employmentId: string,
  queryParams: GetIndexEmploymentFileData['query'],
  queryOptions?: Omit<
    UseQueryOptions<
      ListFilesResponse,
      GetIndexEmploymentFileErrors,
      ApiFile[] | undefined,
      unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['employment-files', employmentId, queryParams],
    queryFn: async () => {
      const result = await getIndexEmploymentFile({
        client: client as Client,
        path: { employment_id: employmentId },
        query: queryParams,
      });

      if (result.error) {
        throw result.error;
      }

      return result.data;
    },
    ...queryOptions,
  });
};
