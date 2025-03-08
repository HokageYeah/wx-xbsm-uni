<template>
  <tui-modal
    :show="showLoginModal"
    title="提示"
    :button="loginArray"
    content="请登录"
    @click="loginHandleClick"
    @cancel="$emit('update:showLoginModal', false)"
  ></tui-modal>
</template>

<script setup lang="ts">
import { wxAuthorizLogin } from '@/uni-module-common/utils/wxAuthorizedLogin';
import { uniShowToast } from '@/uni-module-common/utils/uiUtile';
const props = withDefaults(
  defineProps<{
    showLoginModal: boolean;
  }>(),
  {
    showLoginModal: false
  }
);
const emits = defineEmits<{
  (e: 'update:showLoginModal', value: boolean): void;
}>();
const loginArray = ref([
  {
    text: '取消',
    type: 'gray'
  },
  {
    text: '确定',
    type: 'green',
    plain: false
  }
]);
const { isLogin, userInfo, setToken, updateUserData } = useStore('user');
// 点击去登录
const loginHandleClick = async (e: any) => {
  if (e.index === 0 || isLogin.value) {
    emits('update:showLoginModal', false);
    return;
  }
  // 获取微信用户信息
  await wxAuthorizLogin.useWXProfile();
  // 调用用户登录
  try {
    const resDetail = (await wxAuthorizLogin.wxLogin(
      '/api/v1/wx/mini.login.by.code',
      'POST',
      'XBSM'
    )) as any;
    console.log('content---', resDetail);
    console.log('code---', resDetail.code);
    emits('update:showLoginModal', false);
    uniShowToast('登录成功');
    setToken(resDetail.token);
    const user_info = {
      webId: resDetail.user_id,
      nickname: resDetail.username
    };
    updateUserData(user_info);
    // 保存用户
  } catch (error) {
    console.log('error---', error);
  }
};
</script>

<style scoped lang="scss"></style>
