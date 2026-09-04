export const contractorsListResponse = {
  data: {
    current_page: 1,
    total_count: 2,
    total_pages: 1,
    employments: [
      {
        id: 'employment-grace',
        full_name: 'Grace Hopper',
        type: 'contractor',
        status: 'active',
      },
      {
        id: 'employment-ada',
        full_name: 'Ada Lovelace',
        type: 'contractor',
        status: 'active',
      },
    ],
  },
};

/**
 * A first page that claims more contractors than it returns, so the flow reports the picker
 * list as truncated.
 */
export const truncatedContractorsListResponse = {
  data: {
    current_page: 1,
    total_count: 5000,
    total_pages: 50,
    employments: [
      {
        id: 'employment-grace',
        full_name: 'Grace Hopper',
        type: 'contractor',
        status: 'active',
      },
    ],
  },
};
