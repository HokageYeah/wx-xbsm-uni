// 特别的处理的接口名单, 这里面的接口是不需要网管校验是否登录的，所以需要特殊处理
// 这个白名单中的接口是status":500， "code":41 登录失效
const isAPIWhiteList = ['login-v2/login/user-select-login'];
export interface ruleType {
  strategy: string; // isNotLogin策略对象教研方法名
  errorMsg?: string; // 报错信息
  status?: number; // 状态码
}

interface loginType {
  url: string;
  status: number;
  code: number;
}
type strategyKeyType = 'isNotLogin';
// http创建一个策略对象
const httpStrategyObj = {
  // 是否未登录
  isNotLogin: (params: any[]) => {
    const value = params[0] as loginType;
    console.log('isNotLogin--value--', value);
    // 判断是否在特别处理的接口名单中
    const isIncludeAPI = isAPIWhiteList.some((item: string) => item.includes(value.url as string));
    if (isIncludeAPI) {
      // 登录超时,重新登录
      return value.status === 500 && value.code === 41;
    }
    // 登录超时,重新登录
    return value.status === 401 && value.code === 2;
  }
};

// 创建一个验证类
class HttpStrategyVerify {
  cache: any[];
  errList: any[];
  // 单例类
  static instance: HttpStrategyVerify | null = null;
  constructor() {
    this.cache = []; // 存储要验证的方法
    this.errList = []; // 存储最终的验证结果
  }

  // 单例方法
  static getInstance() {
    console.log('HttpStrategyVerify---getInstance', HttpStrategyVerify.instance);
    if (!HttpStrategyVerify.instance) {
      HttpStrategyVerify.instance = new HttpStrategyVerify();
    }
    return HttpStrategyVerify.instance;
  }

  // value是一个对象，添加规则逻辑
  // 策略模式rules例子
  /***
   *
   validator.add(info.userName, [
    {
      strategy: 'isNoEmpty',
      errorMsg: '用户名不可为空'
    },
    {
      strategy: 'minLength:2',
      errorMsg: '用户名长度不能小于2位'
    }
  ]);
   */
  add(value: any, rules: ruleType[]) {
    rules.forEach((item: ruleType) => {
      // strategy 规则是 第一个是策略方法名称，后面是参数用:链接
      const strategyAry: any[] = item?.strategy.split(':');
      const errorMsg = item?.errorMsg || '';
      const status = item?.status || 0;
      console.log('HttpStrategyVerify----httpStrategyObj', httpStrategyObj);
      console.log('HttpStrategyVerify----strategyAry', strategyAry);
      this.cache.push(() => {
        const strategyKey = strategyAry.shift() as strategyKeyType;
        console.log('HttpStrategyVerify----strategyKey', strategyKey);
        strategyAry.unshift(value);
        strategyAry.push(status);
        strategyAry.push(errorMsg);
        console.log('HttpStrategyVerify----httpStrategyObj-after', httpStrategyObj);
        console.log('HttpStrategyVerify----strategyAry-after', strategyAry);
        console.log('HttpStrategyVerify----strategyKey-after', strategyKey);
        // 执行策略对象中的不同验证规则
        const error = httpStrategyObj[strategyKey](strategyAry);
        if (error) {
          this.errList.push(error);
        }
      });
    });
  }

  // 开始执行
  start() {
    console.log('HttpStrategyVerify----start---cache---', this.cache);
    console.log('HttpStrategyVerify----start---cache---', this.errList);
    this.cache.forEach((item) => {
      item();
    });
    return this.errList;
  }
}

export default HttpStrategyVerify;
