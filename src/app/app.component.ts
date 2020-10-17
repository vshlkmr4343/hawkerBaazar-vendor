import { Component } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { ToastController } from '@ionic/angular';
import { Network } from '@ionic-native/network/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { FcmService } from '../app/fcm.service';
import { Title } from '@angular/platform-browser';
import { Icon } from 'ionicons/dist/types/icon/icon';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.scss']
})

export class AppComponent {
	notificationData: any;
	hasOnTab: boolean = false;
	hasOnTabForGround: boolean = false;
	isNotOpen: boolean = true;
	subscription: any;

	constructor(
		private nativeAudio: NativeAudio,
		private oneSignal: OneSignal,
		private filePath: FilePath,
		private platform: Platform,
		private splashScreen: SplashScreen,
		private statusBar: StatusBar,
		public toast: ToastController,
		private alert: AlertController,
		private network: Network,
		private iap: InAppBrowser,
		private fcm: FcmService,
		private backgroundMode: BackgroundMode
	) {
		this.initializeApp();
	}

	initializeApp() {
		this.platform.ready().then(() => {
			this.statusBar.styleDefault();
			this.splashScreen.hide();
			this.setupPush();
			this.backgroundMode.disableWebViewOptimizations();
            this.backgroundMode.disableBatteryOptimizations();
            this.backgroundMode.enable();
			if (this.network.type != 'none') {
				this.fcm.presentLoading('show')
				this.fcm.getId().then(token => {
					//   let body = { 'pushToken': '' }
					//   body.pushToken = token.userId;
					console.log("Token is", token.userId)
					let count = 0;
					const browser = this.iap.create("https://hawkerbazaar.com/vendor/#/?deviceToken=" +  token.userId + "&deviceType=1", "_self", "hideurlbar=yes,closebuttoncolor=white,toolbar=yes,location=no,zoom=no");
					// const browser = this.iap.create("https://codewarriortechnologies.com/works/hawkerbazaar/vendor/#/?deviceToken=" + token.userId + "&deviceType=1", "_blank", "hideurlbar=yes,closebuttoncolor=white,toolbar=yes,location=no,zoom=no");
					browser.on('loadstop').subscribe(event => {
						console.log('loadstop:', event)
						  if (event.url == "https://hawkerbazaar.com/vendor/#/?deviceToken=" + token.userId + "&deviceType=1" || event.url == "https://hawkerbazaar.com/vendor/#/sign-in?deviceToken=" + token.userId + "&deviceType=1")
						// if (event.url == "https://codewarriortechnologies.com/works/hawkerbazaar/vendor/#/?deviceToken=" + token.userId + "&deviceType=1") 
						
						{
							console.log("event url",event.url)
						    console.log("Count",count)
							count = count + 1;
							if (count == 4) {
								navigator['app'].exitApp()
							}
						}
					});
					browser.on('exit').subscribe(function (event) {
						console.log('Exit event', event);
						navigator['app'].exitApp();
					});

				});
			}
			else {
				this.presentAlert();
			}

		});

	}

	setupPush() {
		this.oneSignal.startInit('d9c92bbd-3e66-4ed3-8e1f-5bdfb614d67c', '690999698807');
		this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);
		this.oneSignal.handleNotificationReceived().subscribe((data) => {
			console.log('DATA:', JSON.stringify(data))
			console.log("Payload is",data)
			if (data.payload.sound == 'alarm') {
			this.playAudio();
			}
		});
		this.oneSignal.handleNotificationOpened().subscribe((data) => {
			console.log('OPEN DATA:', JSON.stringify(data))
			const browser1 = this.iap.create("https://hawkerbazaar.com/vendor/#/notifications/notification", "_self", "hideurlbar=yes,closebuttoncolor=white,toolbar=yes,location=no,zoom=no");
			// const browser1 = this.iap.create("https://codewarriortechnologies.com/works/hawkerbazaar/vendor/#/notifications/notification", "_self", "hideurlbar=yes,closebuttoncolor=white,toolbar=yes,location=no,zoom=no");
			browser1.on('exit').subscribe(function (event) {
				console.log('Exit event', event);
				navigator['app'].exitApp();
			});
		});
		this.oneSignal.endInit();
	}

	playAudio() {
		let id = JSON.stringify(Math.floor(1000 + Math.random() * 9000));
		console.log('id', id);
		this.nativeAudio.preloadSimple(id, 'assets/sound/alarm.mp3').then(data => {
			this.nativeAudio.play(id, () => console.log('uniqueId1 is done playing'));
		});

	}
	async presentAlert() {
		const alert = await this.alert.create({
			header: "",
			subHeader: 'Please check your internet connection.',
			message: '',
			buttons: [{
				text: 'ok',
				role: 'ok',
				handler: () => {
					navigator['app'].exitApp();
				}
			}]
		});
		await alert.present();
	}

}
//One Signal App Id : d9c92bbd-3e66-4ed3-8e1f-5bdfb614d67c

//Rest Api : Mzc4MTk0ZmItOWQ4MC00NTRlLTk1NzMtNjlmZDY5NTE2MDc4

//Server Key firebase : AAAAoOLKpXc:APA91bG7ncs3kEfBPkhaRxUfjx00l9uxk94UY9u60Dv7iu3_iDx8RgOwBTbGcDTqAOtsG0gaMHs54wKwrKaBQD_P2EHrgk25vIks2sPNilJEYV0EGGiVBJJCo7DuzWXp2WWv6QcgOJIe

//Sender Id firebase: 690999698807

//Google FireBase 
//Email::hawkerbazaaronesignal@gmail.com
//Password::1qaz2wsx#@

//keyStore Password :: vishalscrum#
//ionic cordova build --release
//For Genarate KeyStore:: keytool -genkey -v -keystore vendor.keystore -alias vendor -keyalg RSA -keysize 2048 -validity 10000
//jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore vendor.keystore app-release-unsigned.apk vendor
// /Users/apple/Library/Android/sdk/build-tools/28.0.3/zipalign -v 4 app-release-unsigned.apk Vendor.apk