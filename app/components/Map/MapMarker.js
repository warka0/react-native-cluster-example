import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
  Platform,
} from 'react-native';
import { MapView } from 'expo';

import ImageMarker from '../../assets/marker.png';

const offset_map_small = 0.0001;

// Workaround to display Image markers on Android
const IS_ANDROID = Platform.OS !== 'ios';

const styles = StyleSheet.create({
  markerTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerText: {
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
  },
});

class MapMarker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      shouldRender: false,
    };

    this.colorByCategory = {
      A: 'mediumvioletred',
      B: 'saddlebrown',
      C: 'blue',
      D: 'orangered',
      E: 'green',
      Cluster: 'red',
    };
  }

  // Workaround to display Image markers on Android
  componentDidMount() {
    if (IS_ANDROID) {
      console.log('android');
      setTimeout(() => {
        this.setState({ shouldRender: true });
      }, 750);
    }
  }

  // Workaround to display Image markers on Android
  doRepaint = () => {
    if (IS_ANDROID) {
      this.setState({ shouldRender: true });
    }
  };

  // Workaround to display Image markers on Android
  renderImageMarker = category => {
    if (IS_ANDROID) {
      return (
        <ImageBackground
          resizeMode="contain"
          style={{ width: 37, height: 37 }}
          imageStyle={{ tintColor: this.colorByCategory[category] }}
          source={ImageMarker}
          onLayout={this.doRepaint}
          onLoad={this.doRepaint}
        >
          <Text style={{ width: 0, height: 0 }}>{Math.random()}</Text>
        </ImageBackground>
      );
    } else {
      return (
        <Image
          resizeMode="contain"
          style={{ tintColor: this.colorByCategory[category] }}
          source={ImageMarker}
        />
      );
    }
  };

  onPress = () => {
    if (!this.props.feature.properties.featureclass) {
      // Calculate the angle
      const { region } = this.props;
      const category = this.props.feature.properties.featureclass || 'Cluster';
      const angle = region.longitudeDelta || 0.0421 / 1.2;
      const newRegion = [];
      const smallZoom = 0.05;
      const result = Math.round(Math.log(360 / angle) / Math.LN2);

      // Look for children
      const markers = this.props.clusters['places'].getChildren(
        this.props.feature.properties.cluster_id,
        result,
      );

      // Remap
      markers.map(function(element) {
        newRegion.push({
          latitude:
            offset_map_small +
            element.geometry.coordinates[1] -
            region.latitudeDelta * smallZoom,
          longitude:
            offset_map_small +
            element.geometry.coordinates[0] -
            region.longitudeDelta * smallZoom,
        });

        newRegion.push({
          latitude: offset_map_small + element.geometry.coordinates[1],
          longitude: offset_map_small + element.geometry.coordinates[0],
        });

        newRegion.push({
          latitude:
            offset_map_small +
            element.geometry.coordinates[1] +
            region.latitudeDelta * smallZoom,
          longitude:
            offset_map_small +
            element.geometry.coordinates[0] +
            region.longitudeDelta * smallZoom,
        });
      });

      // Prepare the return
      const options = {
        isCluster: true,
        region: newRegion,
      };

      // Then send the event
      if (this.props.onPress) {
        this.props.onPress({
          type: category,
          feature: this.props.feature,
          options: options,
        });
      }
    }
  };

  render() {
    const latitude = this.props.feature.geometry.coordinates[1];
    const longitude = this.props.feature.geometry.coordinates[0];
    const category = this.props.feature.properties.featureclass || 'Cluster';
    const text =
      category === 'Cluster'
        ? this.props.feature.properties.point_count
        : category;

    return (
      <MapView.Marker
        coordinate={{ latitude, longitude }}
        onPress={this.onPress}
      >
        {this.renderImageMarker(category)}

        <View style={styles.markerTextContainer}>
          <Text style={styles.markerText}>{text}</Text>
        </View>
      </MapView.Marker>
    );
  }
}

MapMarker.propTypes = {
  mapPoints: PropTypes.array,
  onPress: PropTypes.func,
  feature: PropTypes.object,
  clusters: PropTypes.object,
  region: PropTypes.object,
};

export default MapMarker;
