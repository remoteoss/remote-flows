import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Client } from '@/src/client/client';
import {
  getV1EmploymentsEmploymentIdFiles,
  getV1FilesId,
  postV1Documents,
} from '@/src/client/sdk.gen';
import {
  GetV1EmploymentsEmploymentIdFilesData,
  GetV1EmploymentsEmploymentIdFilesErrors,
  File as ApiFile,
  ListFilesResponse,
  PostV1DocumentsData,
} from '@/src/client/types.gen';
import { useClient } from '@/src/context';

/**
 * Hook to upload a file associated with a specified employment.
 * @returns A mutation result for uploading employee files.
 */
export const useUploadFile = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (params: PostV1DocumentsData['body']) => {
      return postV1Documents({
        client: client as Client,
        body: params,
        headers: {
          Authorization: ``,
        },
      });
    },
  });
};

/**
 * Hook to download a file by its ID.
 * @param id - The ID of the file to download.
 * @returns A query result containing the file data.
 */
export const useDownloadFile = (id: string) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['download-file', id],
    queryFn: async () => {
      const result = await getV1FilesId({
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

/**
 * Hook to retrieve files associated with a specific employment.
 * @param employmentId - The ID of the employment to retrieve files for.
 * @param queryParams - The query parameters to filter the files.
 * @param queryOptions - Optional TanStack Query options to customize the query behavior.
 * @returns A query result containing the employment files.
 */
export const useEmploymentFiles = (
  employmentId: string,
  queryParams: GetV1EmploymentsEmploymentIdFilesData['query'],
  queryOptions?: Omit<
    UseQueryOptions<
      ListFilesResponse,
      GetV1EmploymentsEmploymentIdFilesErrors,
      ApiFile[] | undefined,
      unknown[]
    >,
    'queryKey' | 'queryFn'
  >,
) => {
  const { client } = useClient();
  return useQuery({
    queryKey: ['employment-files', employmentId],
    queryFn: async () => {
      const result = await getV1EmploymentsEmploymentIdFiles({
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
