import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point'; // Impor Point
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol';
import ImageryLayer from '@arcgis/core/layers/ImageryLayer';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  mapView: MapView | any;
  map: Map | any;
  userLocationGraphic: Graphic | any;

  constructor() {}

  async ngOnInit() {
    this.map = new Map({
      basemap: 'topo-vector' // Basemap awal
    });

    this.mapView = new MapView({
      container: 'container',
      map: this.map,
      zoom: 8,
      center: [-100.437, 47.5515] // North Dakota center coordinates
    });

    let weatherServiceFL = new ImageryLayer({ url: WeatherServiceUrl });
    this.map.add(weatherServiceFL);

    await this.updateUserLocationOnMap();
    this.mapView.center = this.userLocationGraphic.geometry as Point;
    setInterval(this.updateUserLocationOnMap.bind(this), 10000);

    // Tambahkan marker pada North Dakota, USA
    this.addMarkerNorthDakota();
  }

  async getLocationService(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((resp) => {
        resolve([resp.coords.latitude, resp.coords.longitude]);
      });
    });
  }

  async updateUserLocationOnMap() {
    let latLng = await this.getLocationService();
    let geom = new Point({ latitude: latLng[0], longitude: latLng[1] });
    if (this.userLocationGraphic) {
      this.userLocationGraphic.geometry = geom;
    } else {
      this.userLocationGraphic = new Graphic({
        symbol: new SimpleMarkerSymbol(),
        geometry: geom,
      });
      this.mapView.graphics.add(this.userLocationGraphic);
    }
  }

  // Fungsi untuk menambahkan marker di North Dakota, USA
  addMarkerNorthDakota() {
    const northDakotaPoint = new Point({
      longitude: -94.5786, // Kansas City longitude
      latitude: 39.0997,   // Kansas City latitude
    });

    const symbol = new SimpleMarkerSymbol({
      color: [226, 119, 40], // Warna marker
      outline: {
        color: [255, 255, 255], // Outline marker
        width: 2,
      },
    });

    const graphic = new Graphic({
      geometry: northDakotaPoint,
      symbol: symbol,
    });

    this.mapView.graphics.add(graphic);
  }

  // Fungsi untuk mengubah basemap saat pengguna memilih dari dropdown
  changeBasemap(event: any) {
    const selectedBasemap = event.detail.value;
    this.map.basemap = selectedBasemap; // Mengubah basemap sesuai pilihan pengguna
  }
}

const WeatherServiceUrl =
  'https://mapservices.weather.noaa.gov/eventdriven/rest/services/radar/radar_base_reflectivity_time/ImageServer';
