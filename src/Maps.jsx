import React, { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import myImage from "./assets/mark.png";
import Alert from "@mui/material/Alert";

const myIcon = L.icon({
  iconUrl: myImage,
  // ...
});
// const myIcon = new L.Icon({
//   iconUrl: require("./mark.png"),
// });
const MapComponent = (props) => {
  const [markers, setMarkers] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (props.data && props.data.apiData) {
      setMapData(props.data.apiData);
    }
  }, [props.data]);

  useEffect(() => {
    if (mapData.length > 0) {
      const fetchCoordinates = async () => {
        setStatus(true);
        const markerPromises = mapData.map(async (city) => {
          try {
            const response = await axios.get(
              `https://photon.komoot.io/api/?q=${city._id}`
            );
            if (response.data.features.length > 0) {
              const coordsData = response.data.features[0].geometry.coordinates;
              const lon = coordsData[0], // Photon API returns [longitude, latitude]
                lat = coordsData[1];
              return { ...city, lat, lon };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching coordinates for ${city._id}:`, error);
            return null;
          }
        });

        const markerData = await Promise.all(markerPromises);
        setStatus(false);
        setMarkers(markerData.filter((marker) => marker !== null));
      };

      fetchCoordinates();
    }
  }, [mapData]);

  return (
    <>
      {status ? (
        <Alert severity="info " sx={{ mb: "20px" }}>
          Please wait fetching city coordinates
        </Alert>
      ) : (
        ""
      )}
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lon]} icon={myIcon}>
            <Popup>
              <b>{marker._id}</b>
              <br />
              Order count: {marker.count}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
};

export default MapComponent;
