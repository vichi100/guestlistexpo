import React from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
  Text,
  YellowBox
} from "react-native";
import { AppLoading } from "expo";
import {Asset} from 'expo-asset';
import * as Font from 'expo-font';
import * as Icon from '@expo/vector-icons'

import AppNavigator from "./navigation/AppNavigator";
import ErrorBoundary from "./ErrorBoundary";
import AppIntroSlider from "react-native-app-intro-slider";

import { SafeAreaView } from "react-navigation";
import { Dimensions } from "react-native";

import { Notifications } from "expo";
import * as Permissions from "expo-permissions";
import firebase from "firebase";
import { AsyncStorage } from "react-native";
import OfflineNotice from "./screens/OfflineNotice";
// import { withNavigation } from 'react-navigation';
// import { NavigationActions } from 'react-navigation';
import { StackActions, NavigationActions } from 'react-navigation';
import * as Location from "expo-location";


YellowBox.ignoreWarnings(["Warning", "Setting a timer"]);

// Initialize Firebase
const firebaseConfig = {
  // ADD YOUR FIREBASE CREDENTIALS
  apiKey: "AIzaSyBLyvDUVMnqN-94N6xwH7MKsiNKXqCYxDs",
  authDomain: "guestlistrn.firebaseapp.com",
  databaseURL: "https://guestlistrn.firebaseio.com",
  projectId: "guestlistrn",
  storageBucket: "guestlistrn.appspot.com"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  let app = firebase.app();
  // Delete your app.
  app.delete(app);
}
//firebase.initializeApp(firebaseConfig);
//!firebase.apps.length ? firebase.initializeApp(config) : firebase.app();

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

if (Platform.OS === "android") {
  // removes extra space at top of header on android
  SafeAreaView.setStatusBarHeight(0);
}

class App extends React.Component {
  state = {
    isLoadingComplete: false,
    showRealApp: false,
    token: null,
    notification: null
  };

  async componentDidMount() {
    //await AsyncStorage.clear();//COMMENT THIS BEFORE BUILD
    // start : this._getLocationAsync();
    global.userLatlong = -1;
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied', 
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log('ClubsEvents: lat long: '+JSON.stringify(location))
    console.log('ClubsEvents: latitude '+location.coords.latitude)
    console.log('ClubsEvents: longitude '+location.coords.longitude)
    var userLatlong  = location.coords.latitude+","+location.coords.longitude
    global.userLatlong = userLatlong;
    this.setState({ latlong: userLatlong});
    ///end
    await this.init();
    setTimeout(() => {}, 200);
  }

  async init() {
    // check user preference of city
    var myCity = await AsyncStorage.getItem("city");
    console.log("mycity: "+myCity)
    if(myCity == null){
      await AsyncStorage.setItem("city", 'mumbai');
      global.city='mumbai';
    }else{
      global.city = myCity
    }

    
    var expoToken = null;//await AsyncStorage.getItem("expoToken");
    if (expoToken == null) {
      this.registerForPushNotifications();
    }
    var showRealApp = await AsyncStorage.getItem("showRealApp");
    console.log("showRealApp: " + JSON.stringify(showRealApp));
    if (showRealApp == null) {
      this.setState({ showRealApp: false });
    } else {
      this.setState({ showRealApp: true });
    }
  }

  _onDone = () => {
    // After user finished the intro slides. Show real app through
    // navigation or simply by controlling state
    this.setState({ showRealApp: true });
    this._storeDataShowRealAppp();
  };
  _onSkip = () => {
    // After user skip the intro slides. Show real app through
    // navigation or simply by controlling state
    this.setState({ showRealApp: true });
    this._storeDataShowRealAppp();
  };

  _storeDataShowRealAppp = async () => {
    try {
      await AsyncStorage.setItem("showRealApp", "false");
      console.log("store _storeDataShowRealAppp");
      setTimeout(() => {}, 200);
    } catch (error) {
      console.log("error in storeDataShowRealAppp" + error);
    }
  };

  async registerForPushNotifications() {
    console.log("registerForPushNotifications");
    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);

    if (status !== "granted") {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      if (status !== "granted") {
        return;
      }
    }

    const token = await Notifications.getExpoPushTokenAsync(); //'vichi34552466'//
    this.writeUserData(token);

    this.subscription = Notifications.addListener(this.handleNotification);
    
    this.setState({ token: token });
  }

  removeSpecialChars = (str) => {
    return str.replace(/(?!\w|\s)./g, '')
      .replace(/\s+/g, ' ')
      .replace(/^(\s*)([\W\w]*)(\b\s*$)/g, '$2');
  }

  writeUserData = token => {
    var tokenId = this.removeSpecialChars(token);
    global.tokenId = tokenId;
    // var changedToken = token.replace("[","");
    // changedToken = changedToken.replace("]","")
    var usersRef = firebase
      .database()
      .ref("Users/");
      usersRef.child(tokenId).set({


        //mytoken: {
        token: token,
        city: global.city.toLowerCase()
        //}
        
      })
      .then(data => {
        //success callback
        //console.log("App: successfully written expo token in firebase: ", data);
        this._storeDataExpoToken(token);
      })
      .catch(error => {
        //error callback
        console.log("error ", error);
      });
  };

  _storeDataExpoToken = async expoToken => {
    try {
      await AsyncStorage.setItem("expoToken", expoToken);
      console.log("store expoToken" + expoToken);
      setTimeout(() => {}, 200);
    } catch (error) {
      console.log("error in store expoT token" + error);
    }
  };

  handleNotification = notification => {
    //console.log("notification recived"+ JSON.stringify(notification));
    //console.log("notification recived clubid: "+ JSON.stringify(notification.data.clubid));
    var clubid = '1000002';//notification.data.clubid
    if(clubid != null){
      // this.navigator && this.navigator.dispatch({ type: 'Navigate', routeName, params });
      //this.navigator && this.navigator.dispatch({ type: 'Navigate', routeName:'EventsOfOneClub', params:{ clubid: clubid }});
      // this.props.navigation.navigate("EventsOfOneClub", { clubid: clubid });
      this.props.navigator && this.props.navigator.dispatch(NavigationActions.navigate({routeName: 'EventsOfOneClub'})) //{friend: chatInfo}
    
    
//       const resetAction = NavigationActions.reset({
//         index: 0,
//         actions: [ 
//             NavigationActions.navigate({ 
//                 routeName: 'EventsOfOneClub',      // name of the screen you want to navigate
//                 params: {
//                   clubid: clubid   // this second parameter is for sending the params
//                 } 
//             })
//         ],
// });
// this.props.navigation.dispatch(resetAction);
    
    
    
    
    
    }
    this.setState({
      notification
    });
  };

  render() {
    if (this.state.showRealApp) {
      if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
        return (
          <AppLoading
            startAsync={this._loadResourcesAsync}
            onError={this._handleLoadingError}
            onFinish={this._handleFinishLoading}
          />
        );
      } else {
        if (Platform.OS === "ios") {
          return (
            <ErrorBoundary>
              <SafeAreaView
                style={{ flex: 1, backgroundColor: "#fff" }}
                forceInset={{ top: "never" }}
              >
                <View style={styles.container}>
                  <OfflineNotice />
                  {Platform.OS === "ios" && <StatusBar barStyle="default" />}
                  <AppNavigator />
                </View>
              </SafeAreaView>
            </ErrorBoundary>
          );
        } else {
          return (
            <ErrorBoundary>
              <SafeAreaView
                style={{ flex: 1, backgroundColor: "#fff" }}
                forceInset={{ top: "never" }}
              >
                <View
                  style={{ flex: 1, marginTop: 25, backgroundColor: "#ffffff" }}
                >
                  <OfflineNotice />
                  {Platform.OS === "ios" && <StatusBar barStyle="default" />}
                  <AppNavigator />
                </View>
              </SafeAreaView>
            </ErrorBoundary>
          );
        }
      }
    } else {
      return (
        <AppIntroSlider
          slides={slides}
          //comming from the JsonArray below
          onDone={this._onDone}
          //Handler for the done On last slide
          showSkipButton={true}
          onSkip={this._onSkip}
        />
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require("./assets/images/robot-dev.png"),
        require("./assets/images/robot-prod.png")
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        "sans-serif": require("./assets/fonts/sansserif.ttf"),
        "space-mono": require("./assets/fonts/SpaceMono-Regular.ttf")
      })
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //marginTop: 25,
    backgroundColor: "#ffffff"
  },
  image: {
    resizeMode: "contain",
    width: width,
    height: 300
  },
  text: {
    color: "#FFFFFF",
    fontSize: 20
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    backgroundColor: "transparent",
    textAlign: "center",
    marginTop: 16
  }
});

const slides = [
  {
    key: "s1",
    text: "GUESTLIST   |    PASS    |    TABLE \nClick on to book ticket",
    title: " PARTY LIKE VIP",
    titleStyle: styles.title,
    textStyle: styles.text,
    image: require("./assets/images/introimg1.png"),
    imageStyle: styles.image,
    backgroundColor: "#651fff"
  },
  {
    key: "s2",
    text: "FREE ENTRY | HAPPY HOURS  ",
    title: " BEST DEALS ",
    titleStyle: styles.title,
    textStyle: styles.text,
    image: require("./assets/images/discount.png"),
    imageStyle: styles.image,
    backgroundColor: "#22bcb5"
  },
  {
    key: "s3",
    title: "BYE BYE Q ",
    titleStyle: styles.title,
    text: "ENTER LIKE CELEB",
    textStyle: styles.text,
    image: require("./assets/images/plane.png"),
    imageStyle: styles.image,
    backgroundColor: "#3395ff"
  },
  {
    key: "s4",
    title: "BEST CLUBS ",
    titleStyle: styles.title,
    text: "CRAZY WILD PARTIES ",
    textStyle: styles.text,
    image: require("./assets/images/location.png"),
    imageStyle: styles.image,
    backgroundColor: "#febe29"
  }
  // {
  //   key: 's5',
  //   title: 'Bus Booking',
  //   titleStyle: styles.title,
  //   text: 'Enjoy Travelling on Bus with flat 100% off',
  //   image: {
  //     uri:
  //       'http://aboutreact.com/wp-content/uploads/2018/08/bus_ticket_booking.png',
  //   },
  //   imageStyle: styles.image,
  //   backgroundColor: '#f6437b',
  // },
  // {
  //   key: 's6',
  //   title: 'Train Booking',
  //   titleStyle: styles.title,
  //   text: ' 10% off on first Train booking',
  //   image: {
  //     uri:
  //       'http://aboutreact.com/wp-content/uploads/2018/08/train_ticket_booking.png',
  //   },
  //   imageStyle: styles.image,
  //   backgroundColor: '#febe29',
  // },
];



export default App;