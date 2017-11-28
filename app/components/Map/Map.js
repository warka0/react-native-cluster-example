import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';
import { MapView, Permissions } from 'expo';
import supercluster from 'supercluster';

import MapMarker from './MapMarker';

class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clusters: null,
      mapLock: false,
      moving: false,

      // Marseilles
      region: {
        latitude: 43.2931047,
        longitude: 5.38509780000004,
        latitudeDelta: 0.0922 / 1.2,
        longitudeDelta: 0.0421 / 1.2,
      },
    };
  }

  setRegion = region => {
    if (Array.isArray(region)) {
      region.map(function(element) {
        if (
          element.hasOwnProperty('latitudeDelta') &&
          element.hasOwnProperty('longitudeDelta')
        ) {
          region = element;
        }
      });
    }

    if (!Array.isArray(region)) {
      this.setState({ region: region });
    } else {
      console.log("We can't set the region as an array");
    }
  };

  componentDidMount() {
    Permissions.askAsync(Permissions.LOCATION)
      .then(permissions => {
        console.log('Getting permissions');
        if (permissions.status !== 'granted') {
          throw new Error(
            'No has permitido a la app acceder a los servicios de ubicación.',
          );
        }
        console.log('Have permissions');
      })
      .catch(error => {
        console.log(error);
      });

    this.createClusters(this.props.mapPoints);
  }

  createClusters = mapPoints => {
    const markers = { places: mapPoints };

    if (markers && Object.keys(markers)) {
      const clusters = {};

      this.setState({ mapLock: true });

      // Recalculate cluster trees
      Object.keys(markers).forEach(categoryKey => {
        const cluster = supercluster({
          radius: 60,
          maxZoom: 16,
        });

        cluster.load(markers[categoryKey]);
        clusters[categoryKey] = cluster;
      });

      this.setState({ clusters, mapLock: false });
    }
  };

  getZoomLevel = (region = this.state.region) => {
    const angle = region.longitudeDelta;

    return Math.round(Math.log(360 / angle) / Math.LN2);
  };

  createMarkersForRegion_Places = () => {
    const padding = 0.25;

    if (this.state.clusters && this.state.clusters['places']) {
      const returnArray = [];
      const { clusters, region } = this.state;
      const onPressMaker = this.onPressMaker;
      const markers = this.state.clusters['places'].getClusters(
        [
          this.state.region.longitude -
            this.state.region.longitudeDelta * (0.5 + padding),
          this.state.region.latitude -
            this.state.region.latitudeDelta * (0.5 + padding),
          this.state.region.longitude +
            this.state.region.longitudeDelta * (0.5 + padding),
          this.state.region.latitude +
            this.state.region.latitudeDelta * (0.5 + padding),
        ],
        this.getZoomLevel(),
      );

      markers.map(function(element) {
        returnArray.push(
          <MapMarker
            key={element.properties._id || element.properties.cluster_id}
            onPress={onPressMaker}
            feature={element}
            clusters={clusters}
            region={region}
          />,
        );
      });
      return returnArray;
    }

    return [];
  };

  onPressMaker = data => {
    if (data.options.isCluster) {
      if (data.options.region.length > 0) {
        this.goToRegion(data.options.region, 100);
      } else {
        console.log("We can't move to an empty region");
      }
    }
  };

  goToRegion = (region, padding) => {
    this.map.fitToCoordinates(region, {
      edgePadding: {
        top: padding,
        right: padding,
        bottom: padding,
        left: padding,
      },
      animated: true,
    });
  };

  onChangeRegionComplete = region => {
    this.setRegion(region);
    this.setState({ moving: false });
  };

  onChangeRegion = () => {
    this.setState({ moving: true });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <MapView
          ref={ref => (this.map = ref)}
          style={{ flex: 1 }}
          initialRegion={this.state.region}
          onRegionChange={this.onChangeRegion}
          onRegionChangeComplete={this.onChangeRegionComplete}
        >
          {this.createMarkersForRegion_Places()}
        </MapView>
      </View>
    );
  }
}

Map.propTypes = {
  mapPoints: PropTypes.array,
};

export default Map;
