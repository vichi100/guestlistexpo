// @flow

import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { EventType } from '../EventsScreen';

export default class Event extends Component {

  props: {
    event: EventType,
  };

  render() {
    const { event } = this.props;
    console.log("Event componant   "+JSON.stringify(event))
    const {
        clubid,
        clubname,
        djname,
        music,
      date,
      imageURL,
    } = event;
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageURL }}
            style={styles.image}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{date.calendar()}</Text>
          <Text style={[styles.text, styles.title]}>{clubname}</Text>
          <Text style={styles.text}>{music}</Text>
        </View>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    padding: 15,
  },
  imageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 15,
    width: 90,
    height: 90,
  },
  textContainer: {
    flex: 1,
  },
  image: {
    width: 89,
    height: 89,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});