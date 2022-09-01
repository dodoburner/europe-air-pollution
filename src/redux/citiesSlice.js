import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = [];
const createCity = (name, id, lat, long) => ({
  name,
  id,
  lat,
  long,
  info: { pollution: [], weather: [] },
});

export default createSlice({
  name: 'cities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase('cities/getCityData/fulfilled', (state, action) => {
      const countryName = action.payload.topName;
      const country = state.find((el) => el.name === countryName);
      const city = country.cities.find((el) => el.name === action.payload.name);
      city.info = action.payload.results;
    });

    builder.addCase('cities/getCities/fulfilled', (state, action) => {
      const cities = action.payload.results.map((city) => createCity(
        city.name,
        city.objectId,
        city.location.latitude,
        city.location.longitude,
      ));
      const country = action.payload.name;
      state.push({ name: country, cities });
    });

    builder.addCase('cities/getCityLocation/fulfilled', (state, action) => {
      state.push(action.payload);
    });
  },
});

export const getCityData = createAsyncThunk(
  'cities/getCityData',
  async ({
    lat, long, topName, name,
  }) => {
    const data = await axios.get(
      `http://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${long}&key=d4281486-c6e5-40f2-a45a-666c2a800bae`,
    );
    const results = data.data.data.current;
    return { results, topName, name };
  },
);

export const getCities = createAsyncThunk(
  'cities/getCities',
  async ({ id, name }) => {
    const where = encodeURIComponent(
      JSON.stringify({
        country: {
          __type: 'Pointer',
          className: 'Continentscountriescities_Country',
          objectId: id,
        },
      }),
    );
    const response = await fetch(
      `https://parseapi.back4app.com/classes/Continentscountriescities_City?limit=20&order=-population&keys=name,location&where=${where}`,
      {
        headers: {
          'X-Parse-Application-Id': 'mfpmjU4NFMM0RudR7jTsImrVvH16ZG7aqJhqWoiZ', // This is your app's application id
          'X-Parse-REST-API-Key': '5kDXPpyzOXoLdqeid6koqIX7TVKpK97k1GEw33BK', // This is your app's REST API key
        },
      },
    );
    const data = await response.json();
    const { results } = data; // Here you have the data that you need
    return { results, name };
  },
);

export const getCityLocation = createAsyncThunk(
  'cities/getCityLocation',
  async ({ name }) => {
    const where = encodeURIComponent(
      JSON.stringify({
        name,
      }),
    );
    const response = await fetch(
      `https://parseapi.back4app.com/classes/Continentscountriescities_City?limit=1&keys=name,country,location&where=${where}`,
      {
        headers: {
          'X-Parse-Application-Id': 'mfpmjU4NFMM0RudR7jTsImrVvH16ZG7aqJhqWoiZ', // This is your app's application id
          'X-Parse-REST-API-Key': '5kDXPpyzOXoLdqeid6koqIX7TVKpK97k1GEw33BK', // This is your app's REST API key
        },
      },
    );
    const data = await response.json();
    const { latitude, longitude } = data.results[0].location;
    const { objectId } = data.results[0];

    const cityAqi = await axios.get(
      `http://api.airvisual.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=d4281486-c6e5-40f2-a45a-666c2a800bae`,
    );
    const results = cityAqi.data.data.current;
    const city = createCity(name, objectId, latitude, longitude);
    city.info = results;
    return city;
  },
);
