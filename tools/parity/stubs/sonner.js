const noop = () => {};
export const toast = Object.assign(noop, { success: noop, error: noop, info: noop, warning: noop, message: noop });
export default toast;
