"use client";
import React, { useState, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  Autocomplete,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import dotenv from "dotenv";
import { BiLocationPlus } from "react-icons/bi";
import { CiCirclePlus, CiLocationArrow1 } from "react-icons/ci";
dotenv.config();
const libraries = ["places"];

const MapComponent = () => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [origin, setOrigin] = useState(null); // Changed initial state of origin to null
  const [destination, setDestination] = useState(null); // Changed initial state of destination to null
  const [waypoints, setWaypoints] = useState([]); // Changed initial state of waypoints to an empty array
  const [distance, setDistance] = useState("");
  const [loading, setLoading] = useState(false);

  const originRef = useRef();
  const destinationRef = useRef();
  const waypointRefs = useRef([]);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const handleLoad = (autocomplete, index) => {
    if (autocomplete) {
      waypointRefs.current[index] = autocomplete;
    }
  };

  const handlePlaceChanged = (type, index) => {
    let place;
    if (type === "origin") {
      place = originRef.current.getPlace();
    } else if (type === "destination") {
      place = destinationRef.current.getPlace();
    } else {
      place = waypointRefs.current[index]?.getPlace();
    }

    if (place && place.geometry) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      if (type === "origin") {
        setOrigin(location);
      } else if (type === "destination") {
        setDestination(location);
      } else {
        const newWaypoints = [...waypoints];
        newWaypoints[index] = location;
        setWaypoints(newWaypoints);
      }
    } else {
      console.error("Place geometry not available");
    }
  };

  const addWaypoint = () => {
    setWaypoints([...waypoints, ""]);
  };

  const calculateRoute = () => {
    if (origin && destination) {
      setLoading(true);
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          waypoints: waypoints.map((location) => ({
            location,
            stopover: true,
          })),
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
            const route = result.routes[0];
            const totalDistance = route.legs.reduce(
              (sum, leg) => sum + leg.distance.value,
              0
            );
            setDistance((totalDistance / 1000).toFixed(2) + " kms");
          } else {
            console.error(`error fetching directions ${result}`);
          }
          setLoading(false); // Moved setLoading inside the callback to ensure it's correctly handled
        }
      );
    } else {
      console.error("Origin or destination is not set");
      setLoading(false); // Added setLoading(false) in case of early return
    }
  };

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-center">
          <h1 className="text-2xl text-[#1B31A8] mb-4">
            Let's calculate <span className="font-bold">distance</span> from
            Google maps
          </h1>
        </div>
        <div className="flex flex-col-reverse md:flex-row items-center md:items-start">
          <div className="md:flex w-full my-5 md:justify-center md:items-center">
            <div className="w-full md:pr-8">
              <div className="mb-4">
                <label className="block mb-2 text-gray-700">Origin</label>
                <Autocomplete
                  onLoad={(autocomplete) => (originRef.current = autocomplete)}
                  onPlaceChanged={() => handlePlaceChanged("origin")}
                >
                  <div className="flex justify-center items-center w-full px-3 py-2 border text-black border-gray-300 rounded-md ">
                    <BiLocationPlus className="text-blue-600" />
                    <input
                      type="text"
                      placeholder="Origin"
                      className="border-none w-full px-3 py-2 _onfocus:outline-none focus:outline-none focus:ring-0 focus:border-transparent bg-transparent"
                    />
                  </div>
                </Autocomplete>
              </div>
              <div className="w-full">
                {waypoints.map((_, index) => (
                  <div key={index} className="">
                    <label className="block mb-2 text-gray-700">
                      Stop {index + 1}
                    </label>
                    <Autocomplete
                      onLoad={(autocomplete) =>
                        handleLoad(autocomplete, index)
                      }
                      onPlaceChanged={() =>
                        handlePlaceChanged("waypoint", index)
                      }
                    >
                      <input
                        type="text"
                        placeholder={`Stop ${index + 1}`}
                        className="w-full px-3 py-2 border text-black border-gray-300 rounded-md"
                      />
                    </Autocomplete>
                  </div>
                ))}
                <div className="w-full flex justify-end">
                  <button
                    className="text-blue-600 flex justify-center items-center"
                    onClick={addWaypoint}
                  >
                    <CiCirclePlus /> Add another stop
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-gray-700">
                  Destination
                </label>
                <Autocomplete
                  onLoad={(autocomplete) =>
                    (destinationRef.current = autocomplete)
                  }
                  onPlaceChanged={() => handlePlaceChanged("destination")}
                >
                  <div className="flex justify-center items-center w-full px-3 py-2 border text-black border-gray-300 rounded-md ">
                    <CiLocationArrow1 className="text-blue-600" />
                    <input
                      type="text"
                      placeholder="Destination"
                      className="border-none w-full px-3 py-2 _onfocus:outline-none focus:outline-none focus:ring-0 focus:border-transparent bg-transparent"
                    />
                  </div>
                </Autocomplete>
              </div>
              {distance && (
                <div>
                  <div className="mt-8 bg-white p-4 rounded-md shadow-md">
                    <div className="text-xl flex justify-between font-bold">
                      <h1>Distance</h1>
                      <span className="text-blue-600">{distance}</span>
                    </div>
                  </div>
                  <p className="my-5">
                    The distance between the selected points is {distance}.
                  </p>
                </div>
              )}
            </div>
            <div className="md:w-1/3 w-full md:pr-8">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-full mt-4"
                onClick={calculateRoute}
              >
                {loading ? "Loading..." : "Calculate"}
              </button>
            </div>
          </div>
          <div className="md:w-2/3 w-full mt-8 md:mt-0">
            <div className="h-96 w-full">
              <GoogleMap
                mapContainerStyle={{ height: "100%", width: "100%" }}
                zoom={8}
                center={{ lat: 20.5937, lng: 78.9629 }}
                onLoad={(map) => setMap(map)}
              >
                {directions && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
            </div>
          </div>
        </div>
      </div>
    </LoadScript>
  );
};

export default MapComponent;
