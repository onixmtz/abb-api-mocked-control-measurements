export function isValidTcpPort(port: number): boolean {
  return typeof port === "number" && port > 0 && port < 65536;
}