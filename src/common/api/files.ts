import { Client } from '@/src/client/client';
import { getShowFile, postUploadEmployeeFileFile } from '@/src/client/sdk.gen';
import {
  GetShowFileData,
  PostUploadEmployeeFileFileData,
} from '@/src/client/types.gen';
import { useClient } from '@/src/context';
import { useMutation } from '@tanstack/react-query';

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
        body: {
          employment_id: params.employment_id,
          file: params.file,
        },
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
 * @returns {UseMutationResult<DownloadFileResponse, Error, GetShowFileData['path']>} - The mutation result.
 */
export const useDownloadFile = () => {
  const { client } = useClient();
  return useMutation({
    mutationFn: (params: GetShowFileData['path']) => {
      return getShowFile({
        client: client as Client,
        path: {
          id: params.id,
        },
      });
    },
  });
};
