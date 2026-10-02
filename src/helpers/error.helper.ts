export function errorText(error: any): string {
  return error?.message ?? JSON.stringify(error);
}
