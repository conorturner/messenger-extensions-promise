const getSdk = Symbol("getSdk");
const initSdk = Symbol("initSdk");
const initPromise = Symbol.for("initPromise"); // hides value but also allows for debugging if needed.

export default class MessengerExtensions {

	constructor({ timeout }) {
		this[initPromise] = this[initSdk](timeout);
	}

	[initSdk](timeout){
		this.isLoaded = false;

		const promise = new Promise((resolve) => {

			window.extAsyncInit = () => { // the Messenger Extensions JS SDK is done loading
				const { MessengerExtensions: sdk } = window;
				this.isLoaded = true;
				this.sdk = sdk;
				resolve(sdk);
			};

			(function (doc, script, domId) {
				let js, fjs = doc.getElementsByTagName(script)[0];
				if (doc.getElementById(domId)) return;
				js = doc.createElement(script);
				js.id = domId;
				js.src = "//connect.facebook.com/en_US/messenger.Extensions.js";
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'Messenger'));

		});

		if (timeout) {
			 return Promise.race([
				promise,
				new Promise((resolve, reject) => setTimeout(() => reject(`extAsyncInit reached timeout of ${timeout}ms`), timeout))
			]);
		}
		else return promise;
	}

	[getSdk]() {
		if (this.isLoaded) return Promise.resolve(this.sdk);
		else return this[initPromise];
	}

	getContext(app_id) {
		return this[getSdk]().then(sdk => new Promise((resolve, reject) => sdk.getContext(app_id, resolve, reject)))
	}

	requestCloseBrowser() {
		return this[getSdk]().then(sdk => new Promise((resolve, reject) => sdk.requestCloseBrowser(resolve, reject)))
	}

	beginShareFlow(message, mode) {
		return this[getSdk]().then(sdk =>
			new Promise((resolve, reject) =>
				sdk.beginShareFlow(resolve, (code, message) => reject({ code, message }), message, mode)))
	}

	askPermission(permission) {
		return this[getSdk]().then(sdk =>
			new Promise((resolve, reject) =>
				sdk.askPermission(resolve, (code, message) => reject({ code, message }), permission)))
	}

	getGrantedPermissions() {
		return this[getSdk]().then(sdk => new Promise((resolve, reject) => sdk.getGrantedPermissions(resolve, reject)))
	}

	PaymentRequest(methodData, paymentDetails, additionalOptions){
		return this[getSdk]().then(sdk =>
			sdk.PaymentRequest(methodData, paymentDetails, additionalOptions))
	}

	getSupportedFeatures() {
		return this[getSdk]().then(sdk => new Promise((resolve, reject) => sdk.getSupportedFeatures(resolve, reject)))
	}
}