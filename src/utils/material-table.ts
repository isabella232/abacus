import theme from 'src/styles/theme'

/**
 * Default table options for dynamic MaterialTable instances.
 */
// @ts-ignore -- Options now requires a type argument which we don't have
export const defaultTableOptions: any = {
  emptyRowsWhenPaging: false,
  pageSize: 25,
  showEmptyDataSourceMessage: false,
  showTitle: false,
  search: true,
  toolbar: true,
  searchFieldVariant: 'standard',
  searchFieldAlignment: 'left',
  pageSizeOptions: [],
  showFirstLastPageButtons: false,
  headerStyle: {
    fontWeight: theme.custom.fontWeights.monospaceBold,
  },
  rowStyle: {
    opacity: 0.8,
  },
}

/**
 * Create an Options object that can be passed to MaterialTable to create a static table with no toolbar or pagination.
 *
 * @param numRows the exact number of rows that the table should have.
 */
// @ts-ignore -- Options now requires a type argument which we don't have
export function createStaticTableOptions(numRows: number): any {
  return {
    ...defaultTableOptions,
    pageSize: numRows,
    draggable: false,
    paging: false,
    sorting: false,
    toolbar: false,
  }
}
