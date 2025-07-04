// 登录模块
export namespace ILogin {
  export interface LoginParams {
    username: string;
    password: string;
    clientId: string;
    grantType: string;
    captcha: string;  // 验证码
  }

  export interface LoginInfo {
    name: string;
    avatar: string;
    introduction: string;
    accessToken: string;
    token: string;
    refreshToken: string;
    roles: string[];
    userInfo: UserInfo;
    user:UserInfo;
    permissions: string[];
  }

  export interface UserInfo {
    id?: number;
    username: string;
    phone?: string;
    nickname?: string;
    logo?: string;
    age?: number;
    sex?: number;
    idCard?: string;
    email?: string;
    accountStatusCd?: string;
    userTagCd?: string;
    lastLoginTime?: string;
    createTime?: string;
    updateTime?: string;
  }
}
