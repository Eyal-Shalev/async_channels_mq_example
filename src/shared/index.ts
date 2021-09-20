
export enum ExchangeSendModes {
  WaitForAll = "WaitForAll",
  WaitForOne = "WaitForOne",
  ReturnImmediately = "ReturnImmediately"
}
export function isExchangeSendMode(x: unknown): x is ExchangeSendModes {
  return ([
    ExchangeSendModes.WaitForAll,
    ExchangeSendModes.WaitForOne,
    ExchangeSendModes.ReturnImmediately,
  ] as unknown[]).includes(x);
}

export type ExchangeName = string;
export type QueueName = string;
export type TopicName = string;

function isString(x: unknown): x is string {
  return typeof x === "string";
}
function isNonEmptyString(x: unknown): x is string {
  return isString(x) && x !== "";
}
export const isTopicName: (x: unknown) => x is TopicName = isNonEmptyString;
export const isQueueName: (x: unknown) => x is QueueName = isNonEmptyString;
export const isExchangeName: (x: unknown) => x is ExchangeName =
  isNonEmptyString;

function isNew(item: string, list: undefined | string[]) {
  if (!list) return true;
  return !list.includes(item);
}
export const isValidQueueName = (
  name: QueueName,
  existing: undefined | QueueName[],
) => isNew(name, existing);
export const isValidExchangeName = (
  name: ExchangeName,
  existing: undefined | ExchangeName[],
) => isNew(name, existing);

export interface ExchangeRequestBody {
  name: ExchangeName;
  sendMode?: ExchangeSendModes;
}

export function isValidExchangeRequestBody(
  x: Partial<ExchangeRequestBody>,
  existing: undefined | ExchangeName[],
): x is ExchangeRequestBody {
  return "name" in x &&
    isExchangeName(x.name) &&
    isValidExchangeName(x.name, existing) &&
    "sendMode" in x &&
    isExchangeSendMode(x.sendMode);
}

export type BufferSize = number;
export function isBufferSize(x: unknown): x is BufferSize {
  return typeof x === "number" && Number.isSafeInteger(x) && x >= 0;
}

export interface QueueRequestBody {
  name: QueueName;
  topics: [ExchangeName, TopicName][];
  bufferSize?: BufferSize;
}

export function validateQueueRequestBody(
  x: Partial<QueueRequestBody>,
  existing: undefined | QueueName[],
): x is QueueRequestBody {
  if (!("name" in x)) throw new TypeError(`"name" missing from request body`);
  if (!isQueueName(x.name)) throw new TypeError(`"name" is not a valid queue name`);
  if (!isValidQueueName(x.name, existing)) throw new TypeError(`A queue with the name "${x.name}" already exists`);
  if (("bufferSize" in x) && x.bufferSize === undefined && !isBufferSize(x.bufferSize)) throw new TypeError(`"bufferSize" is not a valid bufferSize`);
  return true;
}
