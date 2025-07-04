/**
 * 验证密码格式
 * @param rule
 * @param value
 * @param callback
 */
export const validatePasswordFormat = (rule: any, value: any, callback: (error?: string | Error) => void) => {
  // 验证密码格式
  const reg = /^.{6,20}$/;
  // 密码要求：
  // 1、长度为6-20位
  if (!reg.test(value)) {
    // 密码不符合要求
    callback(new Error('密码长度必须为6-20位'));
    return;
  }
  // 密码符合要求
  callback();
};
