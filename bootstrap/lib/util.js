const { v4: uuidv4 } = require('uuid')

const parseBool = (value) => {
  if (!value) return false
  const _val = value.toString().toLowerCase()
  return (_val === 'true' || _val === 'false') && _val === 'true'
}

// We generate an UUID per instance
const uuid = () => {
  if (!process.env.UUID) process.env.UUID = uuidv4()
  return process.env.UUID
}

const toAsync = (execute, data) =>
  new Promise((resolve) => execute(data, (statusCode, data) => resolve({ statusCode, data })))

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const interval = (retryCount = 1, min = 100, max = 1000, coefficient = 2) => {
  if (retryCount <= 1) return min
  else return Math.min(interval(retryCount - 1, min, max, coefficient) * coefficient, max)
}

const getWithCoalescing = async ({ get, isInFlight, retries = 5, interval = () => 100 }) => {
  const _self = async (_retries) => {
    if (_retries === 0) return null
    const retryCount = retries - _retries + 1
    const entry = await get(retryCount)
    if (entry) return entry
    const inFlight = await isInFlight(retryCount)
    if (!inFlight) return null
    await delay(interval(retryCount))
    return await _self(_retries - 1)
  }
  return await _self(retries)
}

module.exports = {
  parseBool,
  uuid,
  toAsync,
  delay,
  interval,
  getWithCoalescing,
}