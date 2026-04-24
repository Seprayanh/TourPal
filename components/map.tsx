"use client";

import Leaflet from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete Leaflet.Icon.Default.prototype._getIconUrl;
Leaflet.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src,
  iconRetinaUrl: markerIcon2x.src,
  shadowUrl: markerShadow.src,
});

interface MapProps {
  center?: [number, number];
}

// Default: centre of China
const CHINA_CENTER: [number, number] = [35.0, 105.0];

const Map: React.FC<MapProps> = ({ center }) => {
  const mapCenter = center ?? CHINA_CENTER;
  return (
    <MapContainer
      center={mapCenter}
      zoom={center ? 7 : 4}
      scrollWheelZoom={false}
      className="h-[35vh] rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {center && <Marker position={mapCenter} />}
    </MapContainer>
  );
};

export default Map;
