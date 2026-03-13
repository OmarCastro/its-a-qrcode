const originalFetch = globalThis.fetch

/**
 * Setup fetch mock fixture
 * @returns {MockApi} mock api
 */
export function setup () {
  const mockData = {
    fetchHistory: [],
    mockedEntries: [],
    isErrorThrownOnMockNotFound: false,
  }
  globalThis.fetch = customFetch.bind(null, mockData)
  return buildApi(mockData)
}

/**
 * teardown fetch mock fixture
 */
export function teardown () {
  globalThis.fetch = originalFetch
}

/**
 * @param {MockData} mockData - mock data object bound to this function
 * @returns {MockApi} mock api
 */
const buildApi = (mockData) => Object.freeze({
  fetchHistory: {
    get data () { return [...mockData.fetchHistory] },
    get inputs () { return mockData.fetchHistory.map(({ inputs }) => inputs) },
    get inputHrefs () { return mockData.fetchHistory.map(({ inputs }) => getHrefFromFetchRequest(inputs[0])) },
  },
  mock (regex, response) {
    const entry = {
      regex,
      response: response instanceof Response ? response.clone() : response,
    }
    mockData.mockedEntries.push(entry)
  },
  throwErrorOnNonMockedRequests () {
    mockData.isErrorThrownOnMockNotFound = true
  },
})

/**
 * @param {Parameters<typeof originalFetch>[0]} fetchParam - original `fetch()` arguments
 */
const getHrefFromFetchRequest = (fetchParam) => {
  if (typeof fetchParam === 'string') { return fetchParam }
  if (fetchParam instanceof URL) { return fetchParam.toString() }
  if (fetchParam instanceof Request) { return fetchParam.url.toString() }
  return ''
}

/**
 * @param {MockData} mockData - mock data object bound to this function
 * @param {Parameters<typeof originalFetch>} args - original `fetch()` arguments
 */
async function customFetch (mockData, ...args) {
  const { fetchHistory, mockedEntries, isErrorThrownOnMockNotFound } = mockData
  let output = null
  try {
    const inputToSearch = getHrefFromFetchRequest(args[0])
    const mockedEntry = mockedEntries.findLast(({ regex }) => regex.test(inputToSearch))
    const response = mockedEntry?.response
    if (response) {
      output = response
    } else if (isErrorThrownOnMockNotFound) {
      throw Error(`no fetch mock found for url ${inputToSearch}`)
    } else {
      output = await originalFetch(...args)
    }
  } catch (e) {
    output = e instanceof Error ? e : Error('error executing fetch()', { cause: e })
  }
  const historyEntry = {
    inputs: args, output,
  }
  fetchHistory.push(historyEntry)
  if (output instanceof Error) {
    throw output
  }
  if (output instanceof Response) {
    return output.clone()
  }
  return output
}

/**
 * @typedef {object} FetchHistoryEntry
 * @property {Parameters<typeof globalThis.fetch>} inputs - fetch() arguments
 * @property {any} output - awaited fetch result
 * @property {boolean} isError - determines if result is an error
 */

/**
 * @typedef {object} MockData
 * @property {FetchHistoryEntry[]} fetchHistory - fetch history for this mock
 * @property {any[]} mockedEntries - fetch history for this mock
 * @property {boolean} isErrorThrownOnMockNotFound - mock an entry
 */

/**
 * @typedef {object} MockApi
 * @property {object} fetchHistory - fetch history object this mock
 * @property {FetchHistoryEntry[]} fetchHistory.data - fetch history for this mock
 * @property {Parameters<typeof globalThis.fetch>[]} fetchHistory.inputs - fetch history with the input parameters called with this mock
 * @property {string[]} fetchHistory.inputHrefs - fetch history with only the hrefs in the mock, RequestInit parameters are ignored.
 * @property {MockFetch} mock - mock an entry
 * @property {() => void} throwErrorOnNonMockedRequests - throw error if a `fetch()` request made in the test is not yet mocked
 */

/**
 * @callback MockFetch
 * @param {RegExp} regex - regex to test url
 * @param {Response|Error} response - fetch response, can be an error to simulate a fetch error (e.g. DNS error)
 */
