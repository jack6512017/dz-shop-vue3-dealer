import { defineStore } from 'pinia';
import appConfig from '@/core/config/appConfig';
import routesConfig from '@/core/config/routesConfig';
import router from '@/core/utils/router';
import tabbarConfig from '@/core/config/tabbarConfig';
import themeConfig from '@/core/config/themeConfig';
import theme from '@/core/config/theme';

const EMPTY = {
	accessToken: '',
	refreshToken: '',
	expirationTime: 0,
	userInfo: {},
	dealerCode: '',
	lastLoginTime: 0,
	jumpUpdateVersion: '',
	productSearch: [],
	productSearchDefault: '',
	productSearchHot: [],
	cartNum: 0,
	imHistory: [],
	imNoRead: 0,
	shopSetting: {},
	customerTheme: 'red',
	theme: themeConfig['red'].colors,
	lastLoginCaptchaTimeStamp: 0, //上一次获取登录验证码时间
	lastBindMobileCaptchaTimeStamp: 0, //上一次获取绑定手机号验证码时间
	lastMobileUnBindCaptchaTimeStamp: 0, //上一次获取修改手机号确认原手机号验证码时间
	lastMobileReBindCaptchaTimeStamp: 0, //上一次获取修改手机号验证码时间
	lastUpdatePayPasswordCaptchaTimeStamp: 0, //  上一次获取修改支付密码验证码时间
	lastLogoffCaptchaTimeStamp: 0, //  上一次获取注销验证码时间
	lastInputMobile: '',
	lastSelectMobileArea: '86',
	cartPageListen: false, //购物车页面是否处于监听状态
	styleLoadingType: 'loading-1',
	wechatTip: true, //微信端提示
	isGuide: true, // 控制引导页显示
	profileNoticeTime: '',
	wechatMpLogin: null, // 是否是小程序登录
	wechatMpScene: 0, // 获取微信小程序本次场景值,
	updateWechatMpUserInfo: true,
};
const CACHE = uni.getStorageSync('dealerAppCache') || EMPTY;

//去除所有历史消息的tip类型
if (CACHE.imHistory) {
	for (let index = CACHE.imHistory.length - 1; index >= 0; index--) {
		if (CACHE.imHistory[index].tip === true) {
			CACHE.imHistory.splice(index, 1);
		}
	}
}

//初始化自定义TABBAR
const TABBARLIST = {
	type: 'default',
	props: {
		list: tabbarConfig.tabbarList,
	},
};
if (TABBARLIST.length > appConfig.cartBarIndex && CACHE.accessToken) {
	TABBARLIST[appConfig.cartBarIndex].count = CACHE.cartNum;
}

export const useUserStore = defineStore({
	id: 'user',
	state: () => ({
		data: { dealerAppCache: CACHE, ...CACHE, tabbarList: TABBARLIST },
	}),
	getters: {
		getCustomerTheme(state) {
			return state.data.customerTheme;
		},
		getTheme(state) {
			return { ...theme, ...state.data.theme };
		},
		getData(state) {
			return state.data;
		},
		getLastInputMobile(state) {
			return state.data.lastInputMobile;
		},
		getLastLoginCaptchaTimeStamp(state) {
			return state.data.lastLoginCaptchaTimeStamp;
		},
		getLastSelectMobileArea(state) {
			return state.data.lastSelectMobileArea;
		},
		getLastBindMobileCaptchaTimeStamp(state) {
			return state.data.lastBindMobileCaptchaTimeStamp;
		},
		getLastLogoffCaptchaTimeStamp(state) {
			return state.data.lastLogoffCaptchaTimeStamp;
		},
		getAccessToken(state) {
			return state.data.accessToken;
		},
		getRefreshToken(state) {
			return state.data.refreshToken;
		},
		getExpirationTime(state) {
			return state.data.expirationTime;
		},
		getStyleLoadingType(state) {
			return state.data.styleLoadingType;
		},
		getProductSearch(state) {
			return state.data.productSearch;
		},
		getShopSetting(state) {
			return state.data.shopSetting;
		},
		getUserInfo(state) {
			return state.data.userInfo;
		},
		getCustomerServiceUnread(state) {
			return state.data.customerServiceUnread;
		},
		getDealerCode(state) {
			return state.data.dealerCode;
		},
		getTabbarList(state) {
			return state.data.tabbarList;
		},
		getProfileNoticeTime(state) {
			return state.data.profileNoticeTime;
		},
		getWechatMpLogin(state) {
			return state.data.wechatMpLogin;
		},
		getWechatMpScene(state) {
			return state.data.wechatMpScene;
		},
		getUpdateWechatMpUserInfo(state) {
			return state.data.updateWechatMpUserInfo;
		},
		getCartNum(state) {
			return state.data.cartNum;
		},
		getCartPageListen(state) {
			return state.data.cartPageListen;
		},
		getProductSearchHot(state) {
			return state.data.productSearchHot || [];
		},
		getProductSearchDefault(state) {
			return state.data.productSearchDefault;
		},
		getThirdPartyUserInfo(state) {
			return state.data.thirdPartyUserInfo;
		},
		getWechatTip(state) {
			return state.data.wechatTip;
		},
		getIsGuide(state) {
			return state.data.isGuide;
		},
		hasLogin: (state): boolean => !!state.data.accessToken,
	},
	actions: {
		login(value: any) {
			this.data.dealerAppCache.accessToken = this.data.accessToken = value.access_token;
			this.data.dealerAppCache.refreshToken = this.data.refreshToken = value.refresh_token;
			this.data.dealerAppCache.expirationTime = this.data.expirationTime = value.expiration_time;
			this.data.dealerAppCache.userInfo = this.data.userInfo = value.dealer;
			this.data.dealerAppCache.lastLoginTime = this.data.lastLoginTime = new Date().getTime() / 1000;
			uni.setStorageSync('dealerAppCache', this.data.dealerAppCache);
			this.setCartNum(value.dealer.cart_num);
			uni.$emit('cartNumChange', {});
		},
		setTokenInfo(value: any) {
			this.data.dealerAppCache.accessToken = this.data.accessToken = value.access_token;
			this.data.dealerAppCache.refreshToken = this.data.refreshToken = value.refresh_token;
			this.data.dealerAppCache.expirationTime = this.data.expirationTime = value.expiration_time;
			this.setCartNum(value.member.cart_num);
		},
		setLastCaptchaTimeStamp(key: string, value: number) {
			this.data[key] = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setLastInputMobile(value: string) {
			this.data.lastInputMobile = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setLastSelectMobileArea(value: string) {
			this.data.lastSelectMobileArea = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setWechatMpLogin(value: Boolean) {
			this.data.dealerAppCache.wechatMpLogin = this.data.wechatMpLogin = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setWechatMpScene(value: number) {
			this.data.dealerAppCache.wechatMpScene = this.data.wechatMpScene = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setUpdateWechatMpUserInfo(value: Boolean) {
			this.data.dealerAppCache.updateWechatMpUserInfo = this.data.updateWechatMpUserInfo = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setShopSetting(value: Object) {
			this.data.dealerAppCache.shopSetting = this.data.shopSetting = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setThirdPartyUserInfo(value: Object) {
			this.data.thirdPartyUserInfo = value;
		},
		setUserHeadPortrait(value: string) {
			this.data.dealerAppCache.userInfo.head_portrait = this.data.userInfo.head_portrait = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setUserNickname(value: string) {
			this.data.dealerAppCache.userInfo.nickname = this.data.userInfo.nickname = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setUserMobile(value: string) {
			this.data.dealerAppCache.userInfo.mobile = this.data.userInfo.mobile = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setUserMobileArea(value: string) {
			this.data.dealerAppCache.userInfo.mobile_area = this.data.userInfo.mobile_area = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setDealerCode(value: string) {
			this.data.dealerAppCache.dealerCode = this.data.dealerCode = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setUserInfo(value: Object) {
			this.data.dealerAppCache.userInfo = this.data.userInfo = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setLoadingType(value: string) {
			this.data.dealerAppCache.styleLoadingType = this.data.styleLoadingType = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setTabbarList(value: any) {
			this.data.tabbarList = value;
			this.setCartNum(this.data.cartNum);
		},
		setProductSearch(value: []) {
			this.data.dealerAppCache.productSearch = this.data.productSearch = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setProductSearchDefault(value: string) {
			this.data.dealerAppCache.productSearchDefault = this.data.productSearchDefault = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setProductSearchHot(value: []) {
			this.data.dealerAppCache.productSearchHot = this.data.productSearchHot = value;
			uni.setStorageSync('dealerAppCache', this.data);
		},
		setCartNum(value: string) {
			this.data.dealerAppCache.cartNum = this.data.cartNum = value;
			this.data.dealerAppCache.userInfo.cart_num = this.data.userInfo.cart_num = value;
			uni.setStorageSync('dealerAppCache', this.data.dealerAppCache);
			if (appConfig.cartBarIndex > -1) {
				// 原生tabbar
				// if (parseInt(value) == 0) {
				// 	uni.removeTabBarBadge({
				// 		index: appConfig.cartBarIndex
				// 	})
				// } else {
				// 	uni.setTabBarBadge({
				// 		index: appConfig.cartBarIndex,
				// 		text: String(value)
				// 	})
				// }
				// 非原生tabbar
				if (this.data.tabbarList.component == 'dz-tabbar') {
					this.data.tabbarList.props.list.forEach((item: any, index: number) => {
						if (item.pagePath == '/pages/main/cart/cart') {
							this.data.tabbarList.props.list[index].count = value;
						}
					});
				} else {
					if (this.data.tabbarList.length > appConfig.cartBarIndex) {
						this.data.tabbarList[appConfig.cartBarIndex].count = value;
					}
				}
			}
		},
		setCartPageListen(value: boolean) {
			this.data.cartPageListen = value;
		},
		setCustomerTheme(value: string) {
			this.data.dealerAppCache.customerTheme = this.data.customerTheme = value;
			uni.setStorageSync('dealerAppCache', this.data.dealerAppCache);
		},
		setTheme(value: object) {
			this.data.dealerAppCache.theme = this.data.theme = value;
			uni.setStorageSync('dealerAppCache', this.data.dealerAppCache);
		},
		setCustomerServiceUnread(value: number) {
			this.data.customerServiceUnread = value;
		},
		setProfileNoticeTime(value: number) {
			this.data.dealerAppCache.profileNoticeTime = this.data.profileNoticeTime = value;
			uni.setStorageSync('dealerAppCache', this.data.dealerAppCache);
		},
		setWechatTip(value: boolean) {
			this.data.dealerAppCache.wechatTip = this.data.wechatTip = value;
			uni.setStorageSync('dealerAppCache', this.data.dealerAppCache);
		},
		setIsGuide(value: boolean) {
			this.data.dealerAppCache.isGuide = this.data.isGuide = value;
			uni.setStorageSync('dealerAppCache', this.data.dealerAppCache);
		},
		logout() {
			this.data.dealerAppCache.accessToken = this.data.accessToken = '';
			this.data.dealerAppCache.refreshToken = this.data.refreshToken = '';
			this.data.dealerAppCache.userInfo = this.data.userInfo = {};
			this.data.dealerAppCache.wechatMpLogin = this.data.wechatMpLogin = null;
			uni.setStorageSync('dealerAppCache', this.data.dealerAppCache);
			this.setCartNum('0');
			uni.$emit('cartNumChange', {});
		},
		reLogin() {
			this.logout();
			router.push({
				route: routesConfig.login,
			});
		},
	},
});
