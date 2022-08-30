import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Continent from "./components/Continent";
import Country from "./components/Country";
import City from "./components/City";

function App() {
  return (
    <div className="App">
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Home />}/>
        <Route path="/continent" element={<Continent />} />
        <Route path="/country" element={<Country />} />
        <Route path="/city" element={<City />} />
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
